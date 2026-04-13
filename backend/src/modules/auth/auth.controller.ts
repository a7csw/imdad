import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import {
  registerBuyerSchema,
  registerStoreSchema,
  loginSchema,
  refreshSchema,
} from './auth.schema';

export async function registerBuyer(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerBuyerSchema.parse(req.body);
    const result = await authService.registerBuyer(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function registerStore(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerStoreSchema.parse(req.body);
    const result = await authService.registerStore(input);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
