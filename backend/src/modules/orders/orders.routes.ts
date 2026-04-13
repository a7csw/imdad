import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { sendOrderEmails } from '../../utils/email';

const router = Router();

const createOrderSchema = z.object({
  storeId: z.string().cuid(),
  deliveryAddress: z.string().min(5),
  deliveryCity: z.string().min(2),
  deliveryPhone: z.string().min(10),
  notes: z.string().max(300).optional(),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive(),
  })).min(1),
});

// Buyer — create order
router.post('/', authenticate, requireRole('BUYER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);

    // Validate all products belong to the store and are in stock
    const productIds = data.items.map(i => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId: data.storeId, status: 'ACTIVE' },
    });

    if (products.length !== productIds.length) {
      throw createError('One or more products are unavailable', 400);
    }

    const itemsWithPrice = data.items.map((item) => {
      const product = products.find((p: { id: string }) => p.id === item.productId) as typeof products[number];
      if (product.stock < item.quantity) throw createError(`Insufficient stock for ${product.name}`, 400);
      const priceIQD = product.discountPriceIQD ?? product.priceIQD;
      return { productId: item.productId, quantity: item.quantity, priceIQD };
    });

    const totalIQD = itemsWithPrice.reduce((sum, i) => sum + i.priceIQD * i.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Decrease stock
      for (const item of itemsWithPrice) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          buyerId: req.user!.userId,
          storeId: data.storeId,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          deliveryPhone: data.deliveryPhone,
          notes: data.notes,
          totalIQD,
          items: { create: itemsWithPrice },
        },
        include: {
          items: { include: { product: true } },
          store: { include: { owner: { select: { email: true, name: true } } } },
          buyer: { select: { email: true, name: true, phone: true } },
        },
      });
    });

    res.status(201).json(order);

    // Fire-and-forget — never throws, never delays the response
    sendOrderEmails({
      orderId: order.id,
      storeName: order.store.name,
      buyerName: order.buyer.name,
      buyerEmail: order.buyer.email,
      buyerPhone: order.buyer.phone ?? data.deliveryPhone,
      storeOwnerEmail: order.store.owner.email,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryPhone: order.deliveryPhone,
      notes: order.notes,
      totalIQD: order.totalIQD,
      items: order.items.map((item) => ({
        productName: item.product.nameAr ?? item.product.name,
        quantity: item.quantity,
        priceIQD: item.priceIQD,
      })),
    }).catch((err) => console.error('[email] Unexpected error:', err));
  } catch (err) { next(err); }
});

// Buyer — own orders
router.get('/my', authenticate, requireRole('BUYER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user!.userId },
      include: {
        store: { select: { name: true, slug: true, logo: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
});

// Buyer/Store/Admin — single order
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: { select: { name: true, phone: true, email: true } },
        store: { select: { name: true, slug: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) throw createError('Order not found', 404);

    const { userId, role } = req.user!;
    if (
      role !== 'ADMIN' &&
      order.buyerId !== userId &&
      !(role === 'STORE_OWNER' && (await prisma.store.findUnique({ where: { ownerId: userId } }))?.id === order.storeId)
    ) {
      throw createError('Forbidden', 403);
    }

    res.json(order);
  } catch (err) { next(err); }
});

// Store owner — update order status
router.patch('/:id/status', authenticate, requireRole('STORE_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({
      status: z.enum(['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    }).parse(req.body);

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw createError('Order not found', 404);

    if (req.user!.role === 'STORE_OWNER') {
      const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
      if (!store || store.id !== order.storeId) throw createError('Forbidden', 403);
    }

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status } });
    res.json(updated);
  } catch (err) { next(err); }
});

// Store owner — own store orders
router.get('/store/mine', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) throw createError('Store not found', 404);

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        buyer: { select: { name: true, phone: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) { next(err); }
});

// Admin — all orders
router.get('/admin/all', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          buyer: { select: { name: true, email: true } },
          store: { select: { name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

export default router;
