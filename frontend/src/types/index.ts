// ── Auth & Users ─────────────────────────────────────────────────────────────

export type Role = 'BUYER' | 'STORE_OWNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: Role;
  suspended: boolean;
  createdAt: string;
  store?: Store | null;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export type StoreStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  phone: string;
  logo?: string;
  banner?: string;
  status: StoreStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: { name: string };
  _count?: { products: number; orders?: number };
}

// ── Category & Brand ─────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  nameKu?: string;
  slug: string;
  icon?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  origin?: string;
}

// ── Product ──────────────────────────────────────────────────────────────────

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  descriptionShort?: string;
  descriptionFull?: string;
  priceIQD: number;
  discountPriceIQD?: number;
  stock: number;
  images: string[];
  flavor?: string;
  size?: string;
  servings?: number;
  ingredients?: string;
  usage?: string;
  warnings?: string;
  origin?: string;
  authentic: boolean;
  goalTags: string[];
  featured: boolean;
  status: ProductStatus;
  storeId: string;
  categoryId: string;
  brandId: string;
  createdAt: string;
  updatedAt: string;
  store?: Pick<Store, 'name' | 'slug' | 'logo' | 'city'>;
  category?: Pick<Category, 'name' | 'nameAr' | 'slug'>;
  brand?: Pick<Brand, 'name' | 'slug'>;
}

// ── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  quantity: number;
  priceIQD: number;
  productId: string;
  product?: Pick<Product, 'name' | 'images'>;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalIQD: number;
  notes?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  buyerId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
  buyer?: Pick<User, 'name' | 'phone' | 'email'>;
  store?: Pick<Store, 'name' | 'slug' | 'logo'>;
  items: OrderItem[];
}

// ── Cart (client-side) ───────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  storeId: string;
  name: string;
  image: string;
  priceIQD: number;
  discountPriceIQD?: number;
  quantity: number;
  stock: number;
}

// ── API Responses ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
