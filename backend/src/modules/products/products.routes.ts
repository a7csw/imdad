import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { uniqueSlug } from '../../utils/slug';
import { createError } from '../../middleware/errorHandler';

const router = Router();

const productSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  descriptionShort: z.string().max(200).optional(),
  descriptionFull: z.string().optional(),
  priceIQD: z.number().int().positive(),
  discountPriceIQD: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
  flavor: z.string().optional(),
  size: z.string().optional(),
  servings: z.number().int().positive().optional(),
  ingredients: z.string().optional(),
  usage: z.string().optional(),
  warnings: z.string().optional(),
  origin: z.string().optional(),
  authentic: z.boolean().default(false),
  goalTags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  categoryId: z.string().cuid(),
  brandId: z.string().cuid(),
});

// Public — list products with filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const brandId = req.query.brandId as string | undefined;
    const storeId = req.query.storeId as string | undefined;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
    const featured = req.query.featured === 'true';

    const where: any = {
      status: 'ACTIVE',
      store: { status: 'APPROVED' },
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(storeId && { storeId }),
      ...(featured && { featured: true }),
      ...((minPrice || maxPrice) && {
        priceIQD: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          store: { select: { name: true, slug: true } },
          category: { select: { name: true, nameAr: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Public — single product
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        store: { select: { name: true, slug: true, logo: true, city: true } },
        category: true,
        brand: true,
      },
    });
    if (!product || product.status !== 'ACTIVE') throw createError('Product not found', 404);
    res.json(product);
  } catch (err) { next(err); }
});

// Store owner — create product
router.post('/', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store || store.status !== 'APPROVED') throw createError('Store not active', 403);

    const data = productSchema.parse(req.body);
    const slug = uniqueSlug(data.name);
    const product = await prisma.product.create({
      data: { ...data, slug, storeId: store.id },
      include: { category: true, brand: true },
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

// Store owner — update product
router.patch('/:id', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) throw createError('Store not found', 404);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.storeId !== store.id) throw createError('Product not found', 404);

    const data = productSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: true, brand: true },
    });
    res.json(product);
  } catch (err) { next(err); }
});

// Store owner — delete product
router.delete('/:id', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) throw createError('Store not found', 404);

    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.storeId !== store.id) throw createError('Product not found', 404);

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted' });
  } catch (err) { next(err); }
});

// Store owner — list own products
router.get('/store/mine', authenticate, requireRole('STORE_OWNER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.user!.userId } });
    if (!store) throw createError('Store not found', 404);

    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      include: { category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) { next(err); }
});

export default router;
