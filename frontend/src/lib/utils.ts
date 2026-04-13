import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIQD(amount: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIQDSimple(amount: number): string {
  return `${amount.toLocaleString('en')} IQD`;
}

export function getDiscountPercent(original: number, discounted: number): number {
  return Math.round(((original - discounted) / original) * 100);
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

export function getImageUrl(url: string | undefined, fallback = '/placeholder.jpg'): string {
  if (!url) return fallback;
  return url;
}

export function getOrderStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    CONFIRMED: 'text-blue-400 bg-blue-400/10',
    PREPARING: 'text-purple-400 bg-purple-400/10',
    SHIPPED: 'text-cyan-400 bg-cyan-400/10',
    DELIVERED: 'text-green-400 bg-green-400/10',
    CANCELLED: 'text-red-400 bg-red-400/10',
  };
  return map[status] ?? 'text-secondary bg-surface-2';
}

export function getCategoryName(
  category: { name: string; nameAr: string; nameKu?: string | null },
  language: string
): string {
  if (language === 'ar') return category.nameAr;
  if (language === 'ku') return category.nameKu ?? category.nameAr;
  return category.name;
}

export function getStoreStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    APPROVED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    SUSPENDED: 'text-orange-400 bg-orange-400/10',
  };
  return map[status] ?? 'text-secondary bg-surface-2';
}
