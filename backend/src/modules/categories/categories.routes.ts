import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { slugify } from '../../utils/slug';
import { createError } from '../../middleware/errorHandler';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().min(2),
  nameKu: z.string().optional(),
  icon: z.string().optional(),
});

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(categories);
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.parse(req.body);
    const slug = slugify(data.name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw createError('Category already exists', 409);
    const category = await prisma.category.create({ data: { ...data, slug } });
    res.status(201).json(category);
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    const slug = data.name ? slugify(data.name) : undefined;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { ...data, ...(slug && { slug }) },
    });
    res.json(category);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted' });
  } catch (err) { next(err); }
});

export default router;
