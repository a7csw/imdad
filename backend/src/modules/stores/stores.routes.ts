import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { VALID_CITIES } from '../../data/iraqiCities';

const router = Router();

const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().max(500).optional(),
  address: z.string().min(5).optional(),
  city: z.enum(VALID_CITIES).optional(),
  phone: z.string().min(10).optional(),
  logo: z.string().url().optional(),
  banner: z.string().url().optional(),
});

// Public — list approved stores
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const where = {
      status: 'APPROVED' as const,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: { select: { name: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.store.count({ where }),
    ]);

    res.json({ stores, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Public — single store
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: req.params.slug },
      include: {
        owner: { select: { name: true, phone: true } },
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!store || store.status !== 'APPROVED') throw createError('Store not found', 404);
    res.json(store);
  } catch (err) { next(err); }
});

// Store owner — update their own store
router.patch('/me', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateStoreSchema.parse(req.body);
    const store = await prisma.store.update({
      where: { ownerId: req.user!.userId },
      data,
    });
    res.json(store);
  } catch (err) { next(err); }
});

// Admin — list all stores
router.get('/admin/all', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const where = status ? { status: status as any } : {};
    const stores = await prisma.store.findMany({
      where,
      include: { owner: { select: { name: true, email: true } }, _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(stores);
  } catch (err) { next(err); }
});

// Admin — update store status
router.patch('/admin/:id/status', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']) }).parse(req.body);
    const store = await prisma.store.update({ where: { id: req.params.id }, data: { status } });
    res.json(store);
  } catch (err) { next(err); }
});

export default router;
