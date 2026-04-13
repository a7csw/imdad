import { z } from 'zod';
import { VALID_CITIES } from '../../data/iraqiCities';

const passwordField = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .max(100);

export const registerBuyerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordField,
  phone: z.string().min(10).max(20),
  city: z.enum(VALID_CITIES),
});

export const registerStoreSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: passwordField,
  phone: z.string().min(10).max(20),
  city: z.enum(VALID_CITIES),
  storeName: z.string().min(2).max(100),
  storeAddress: z.string().min(5).max(200),
  storePhone: z.string().min(10).max(20),
  storeDescription: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;
export type RegisterStoreInput = z.infer<typeof registerStoreSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
