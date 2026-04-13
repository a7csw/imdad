import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma/client';
import { authenticate, requireRole } from '../../middleware/auth';
import { createError } from '../../middleware/errorHandler';
import { VALID_CITIES } from '../../data/iraqiCities';

const router = Router();

// Admin — list all users
router.get('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, name: true, email: true, phone: true, city: true, role: true, suspended: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// Admin — suspend/unsuspend user
router.patch('/:id', authenticate, requireRole('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { suspended } = z.object({ suspended: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended },
      select: { id: true, name: true, email: true, suspended: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

// Buyer/Store Owner — update own profile
router.patch('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().min(10).optional(),
      city: z.enum(VALID_CITIES).optional(),
    });
    const data = updateSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: { id: true, name: true, email: true, phone: true, city: true, role: true },
    });
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
