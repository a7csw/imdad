import { prisma } from '../../prisma/client';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { uniqueSlug } from '../../utils/slug';
import { createError } from '../../middleware/errorHandler';
import { RegisterBuyerInput, RegisterStoreInput, LoginInput } from './auth.schema';

function tokenExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}

function stripPassword<T extends { password: string }>(user: T) {
  const { password: _, ...rest } = user;
  return rest;
}

export async function registerBuyer(input: RegisterBuyerInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw createError('Email already in use', 409);

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      phone: input.phone,
      city: input.city,
      role: 'BUYER',
    },
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: tokenExpiry() },
  });

  return { user: stripPassword(user), accessToken, refreshToken };
}

export async function registerStore(input: RegisterStoreInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw createError('Email already in use', 409);

  const hashed = await hashPassword(input.password);
  const slug = uniqueSlug(input.storeName);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      phone: input.phone,
      city: input.city,
      role: 'STORE_OWNER',
      store: {
        create: {
          name: input.storeName,
          slug,
          address: input.storeAddress,
          city: input.city,
          phone: input.storePhone,
          description: input.storeDescription,
          status: 'PENDING',
        },
      },
    },
    include: { store: true },
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: tokenExpiry() },
  });

  return { user: stripPassword(user), accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw createError('Invalid credentials', 401);
  if (user.suspended) throw createError('Account suspended', 403);

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw createError('Invalid credentials', 401);

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: tokenExpiry() },
  });

  const store = user.role === 'STORE_OWNER'
    ? await prisma.store.findUnique({ where: { ownerId: user.id } })
    : null;

  return { user: { ...stripPassword(user), store }, accessToken, refreshToken };
}

export async function refresh(token: string) {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw createError('Invalid refresh token', 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw createError('Invalid refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.suspended) throw createError('Unauthorized', 401);

  const newPayload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await prisma.refreshToken.delete({ where: { token } });
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt: tokenExpiry() },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { store: true },
  });
  if (!user) throw createError('User not found', 404);
  return stripPassword(user);
}
