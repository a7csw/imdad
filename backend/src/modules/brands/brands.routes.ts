import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { slugify } from '../../utils/slug';
import { createError } from '../../middleware/errorHandler';

const router = Router();

const brandSchema = z.object({
  name: z.string().min(2),
  logo: z.string().url().optional(),
  origin: z.string().optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    res.json(brands);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = brandSchema.parse(req.body);
    const slug = slugify(data.name);
    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) throw createError('Brand already exists', 409);
    const brand = await prisma.brand.create({ data: { ...data, slug } });
    res.status(201).json(brand);
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = brandSchema.partial().parse(req.body);
    const slug = data.name ? slugify(data.name) : undefined;
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: { ...data, ...(slug && { slug }) },
    });
    res.json(brand);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ message: 'Brand deleted' });
  } catch (err) { next(err); }
});

export default router;
