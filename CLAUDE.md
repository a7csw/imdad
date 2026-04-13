# CLAUDE.md — Imdad Project Onboarding

> This file is the authoritative context document for AI assistants and new contributors. Read it fully before touching any code.

---

## 1. Project Overview

**Imdad** (إمداد — Arabic for "supply / provision") is a **multi-vendor supplements marketplace** built for the Iraqi market. It connects supplement store owners with buyers across all Iraqi provinces, with Cash on Delivery as the only payment method (no payment gateway integration).

**Target users:**
- **Buyers** — Iraqi fitness/sports enthusiasts who browse, filter, and order supplements
- **Store Owners** — supplement shop owners who list products and fulfil orders
- **Admins** — platform operators who approve stores, manage categories/brands, and moderate users

**Key product decisions:**
- COD-only (no Stripe, no payment gateway — intentional for V1)
- One order per store (if buyer orders from multiple stores, multiple orders are created)
- Store goes live only after admin approval (status: PENDING → APPROVED)
- Languages: Arabic (default, RTL), English (LTR), Kurdish Sorani (RTL)
- Dark mode by default; supports light/system theme toggle

**Codebase location:** `/Users/abdulrahmanalfaiadi/Developer/Imdad/`  
```
Imdad/
├── frontend/     # React app (port 5173)
├── backend/      # Express API (port 4000)
├── .gitignore
└── CLAUDE.md     # ← this file
```

---

## 2. Tech Stack

### Frontend (`frontend/`)
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.4 |
| Build tool | Vite | 8.0.4 |
| Language | TypeScript | ~6.0.2 |
| CSS | Tailwind CSS v4 (via `@tailwindcss/vite`) | 4.2.2 |
| Animations | Framer Motion | 12.38.0 |
| Routing | React Router v7 | 7.14.0 |
| State management | Zustand (with persist) | 5.0.12 |
| HTTP client | Axios (with interceptors) | 1.15.0 |
| Forms | React Hook Form + Zod | 7.72.1 / 4.3.6 |
| i18n | i18next + react-i18next | 26.0.4 / 17.0.2 |
| Icons | lucide-react | 1.7.0 |
| Class utilities | clsx + tailwind-merge | 2.1.1 / 3.5.0 |
| Fonts | Cairo (display/Arabic) + Inter (body) via Google Fonts |

### Backend (`backend/`)
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Express | 4.22.1 |
| Language | TypeScript | 5.9.3 |
| ORM | Prisma | 6.19.3 |
| Database | PostgreSQL (16, local via Homebrew) | — |
| Auth | jsonwebtoken (JWT) | 9.0.3 |
| Password hashing | bcryptjs (SALT_ROUNDS=12) | 3.0.3 |
| Validation | Zod | 3.25.76 |
| Security | helmet | 8.1.0 |
| CORS | cors | 2.8.6 |
| Env | dotenv | 17.4.1 |
| Dev runner | nodemon + ts-node (--transpile-only) | 3.1.14 / 10.9.2 |

> **Note:** `multer` and `uuid` are installed as backend deps but are **not currently used** in any route. Prisma uses `cuid()` for IDs and there is no image upload route yet.

---

## 3. Architecture

### Data Flow

```
Browser (React, :5173)
  └── Axios (Authorization: Bearer <token>)
       └── Vite proxy /api → localhost:4000
            └── Express router
                 ├── authenticate middleware (JWT verify)
                 ├── requireRole middleware (BUYER / STORE_OWNER / ADMIN)
                 └── Prisma Client → PostgreSQL
```

### Frontend Folder Structure

```
frontend/src/
├── main.tsx                  # App entry: bootstrap theme, language, mount RouterProvider
├── App.tsx                   # Unused — routing is handled in main.tsx via RouterProvider
├── router/
│   ├── index.tsx             # All route definitions (lazy-loaded), nested layouts
│   └── guards.tsx            # ProtectedRoute, GuestRoute, PageLoader
├── pages/
│   ├── public/               # LandingPage, MarketplacePage, StoresPage, StoreDetailPage,
│   │                         #   ProductDetailPage, AboutPage, NotFoundPage
│   ├── auth/                 # LoginPage, RegisterPage
│   ├── buyer/                # ProfilePage, OrdersPage, CartPage, CheckoutPage
│   ├── dashboard/            # DashboardHome, DashboardProducts, DashboardAddProduct,
│   │                         #   DashboardEditProduct, DashboardOrders, DashboardAnalytics,
│   │                         #   DashboardSettings
│   └── admin/                # AdminLayout, AdminDashboard, AdminStores, AdminUsers,
│                             #   AdminProducts, AdminCategories, AdminBrands, AdminOrders
├── components/
│   ├── ui/                   # Button, Input, Select, Badge, Spinner, Skeleton
│   ├── shared/               # ProductCard, StoreCard
│   └── layout/               # Header, Footer, MainLayout, DashboardLayout
├── features/
│   └── cart/                 # CartDrawer (sliding sidebar used in Header + CartPage)
├── store/
│   ├── auth.store.ts         # Zustand: user, accessToken, refreshToken, isAuthenticated
│   ├── cart.store.ts         # Zustand: items[], addItem, removeItem, totalPrice
│   └── theme.store.ts        # Zustand: theme ('dark'|'light'|'system'), language ('ar'|'en'|'ku')
├── lib/
│   ├── api.ts                # Axios instance + request/response interceptors (auto token refresh)
│   ├── i18n.ts               # i18next init with AR/EN/KU resources
│   ├── motion.ts             # Framer Motion: CINEMA_EASE, revealVariant, staggerContainer, getVariant, viewportReveal, lineReveal, scaleIn, slideLeft, slideRight, fadeUp, fadeIn, prefersReducedMotion
│   └── utils.ts              # cn(), formatIQDSimple(), getDiscountPercent(), getOrderStatusColor(), getImageUrl(), slugify(), getCategoryName()
├── types/
│   └── index.ts              # All TypeScript interfaces: User, Product, Store, Order, OrderItem, CartItem, Category, Brand, etc.
├── locales/
│   ├── ar/common.json        # Arabic translations (~185 keys)
│   ├── en/common.json        # English translations (~185 keys)
│   └── ku/common.json        # Kurdish (Sorani) translations (~185 keys)
├── assets/
│   └── brand/                # logo-primary.svg (wordmark), logo-mark.svg, favicon.svg
├── styles/
│   └── globals.css           # Tailwind @theme semantic tokens (--color-bg-page, --color-bg-surface, etc.), @keyframes marquee, .marquee-track utility, btn-shimmer, card-glow, font-numeric
└── hooks/
    └── useCountUp.ts         # IntersectionObserver + rAF count-up hook; ms-based duration; HTMLDivElement ref; cubic ease-out; respects prefers-reduced-motion
```

### Backend Folder Structure

```
backend/
├── src/
│   ├── app.ts                # Express setup: middleware stack, route mounting, server start
│   ├── config/
│   │   └── env.ts            # Env var validation + centralized config export
│   ├── middleware/
│   │   ├── auth.ts           # authenticate(), requireRole(), AppRole type
│   │   └── errorHandler.ts   # errorHandler(), notFound(), createError()
│   ├── modules/              # Feature modules (each: routes + controller + service + schema)
│   │   ├── auth/             # register/buyer, register/store, login, refresh, logout, /me
│   │   ├── users/            # list users (admin), suspend (admin), update own profile
│   │   ├── stores/           # public list, single, update own, admin approval
│   │   ├── products/         # public list, single, CRUD (store owner), admin all
│   │   ├── categories/       # public list, CRUD (admin)
│   │   ├── brands/           # public list, CRUD (admin)
│   │   └── orders/           # create (buyer), my orders, single, status update, store orders, admin all
│   ├── prisma/
│   │   └── client.ts         # Prisma singleton (global in dev, prevents hot-reload duplicates)
│   ├── types/
│   │   └── express.d.ts      # Augments Express Request with optional `user: { userId, role }`
│   └── utils/
│       ├── jwt.ts            # signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
│       ├── hash.ts           # hashPassword, comparePassword (bcryptjs, SALT_ROUNDS=12)
│       └── slug.ts           # slugify(), uniqueSlug() (appends base36 timestamp)
├── prisma/
│   ├── schema.prisma         # Database schema (see section below)
│   └── seed.ts               # Seeds: admin user, 8 categories, 7 brands
├── .env                      # NOT committed — see env var list below
├── package.json
└── tsconfig.json
```

### Database Schema (Prisma)

**Enums:**
- `Role`: `BUYER | STORE_OWNER | ADMIN`
- `StoreStatus`: `PENDING | APPROVED | REJECTED | SUSPENDED`
- `ProductStatus`: `ACTIVE | INACTIVE | OUT_OF_STOCK`
- `OrderStatus`: `PENDING | CONFIRMED | PREPARING | SHIPPED | DELIVERED | CANCELLED`

**Models and key fields:**
```
User          id(cuid), name, email(@unique), password(hashed), phone, city,
              role(@default BUYER), suspended(@default false), createdAt, updatedAt
              → has: store(1:1), orders(1:N), refreshTokens(1:N)

RefreshToken  id(cuid), token(@unique), userId(FK→User, onDelete:Cascade), expiresAt, createdAt

Store         id(cuid), name, slug(@unique), description?, address, city, phone,
              logo?, banner?, status(@default PENDING), ownerId(@unique FK→User, Cascade),
              createdAt, updatedAt
              → has: products(1:N), orders(1:N)

Category      id(cuid), name(@unique), nameAr, nameKu?, slug(@unique), icon?
              → has: products(1:N)

Brand         id(cuid), name(@unique), slug(@unique), logo?, origin?
              → has: products(1:N)

Product       id(cuid), name, nameAr?, slug(@unique), descriptionShort?, descriptionFull?,
              priceIQD(Int), discountPriceIQD?(Int), stock(@default 0),
              images(String[]), flavor?, size?, servings?(Int),
              ingredients?, usage?, warnings?, origin?,
              authentic(@default false), goalTags(String[]), featured(@default false),
              status(@default ACTIVE), storeId(FK→Store,Cascade), categoryId(FK), brandId(FK),
              createdAt, updatedAt

Order         id(cuid), status(@default PENDING), totalIQD(Int), notes?,
              deliveryAddress, deliveryCity, deliveryPhone,
              buyerId(FK→User), storeId(FK→Store), createdAt, updatedAt
              → has: items(1:N OrderItem)

OrderItem     id(cuid), quantity, priceIQD(price locked at order time),
              orderId(FK→Order, Cascade), productId(FK→Product)
```

**Key relations:**
- User 1:1 Store (a store owner has exactly one store)
- One order belongs to one store — multi-store cart creates multiple orders
- Stock is decremented atomically in a Prisma transaction on order creation

### Auth Token Flow

```
1. POST /api/auth/login → { user, accessToken (15m JWT), refreshToken (7d JWT) }
2. Frontend stores both in Zustand (persisted to localStorage under 'imdad-auth')
3. Axios interceptor adds: Authorization: Bearer <accessToken> on every request
4. On 401 response:
   a. Axios response interceptor fires
   b. POST /api/auth/refresh with { refreshToken }
   c. Old refresh token deleted from DB; new pair generated (rotation)
   d. Original request retried with new access token
   e. Concurrent requests queued during refresh
5. On refresh failure → clearAuth() + redirect to /login
```

### Route Guards

```
GuestRoute      → Redirects authenticated users away from /login, /register
ProtectedRoute  → Redirects unauthenticated to /login; checks allowedRoles[]
                  ADMIN    → /admin/*
                  STORE_OWNER → /dashboard/*
                  BUYER    → /profile, /orders, /cart, /checkout
```

---

## 4. Current Status

### ✅ Built and Working

**Backend:**
- Full Prisma schema, migrations run (`npx prisma migrate dev --name init`)
- All REST API endpoints implemented and mounted
- JWT auth (access + refresh tokens with rotation)
- Role-based middleware (`authenticate`, `requireRole`)
- Zod validation on all inputs
- Transactional order creation (stock decrement atomic)
- Seed script (admin user + 8 categories + 7 brands)
- `GET /health` endpoint

**Frontend:**
- All pages built (Landing, Marketplace, Stores, Store Detail, Product Detail, About, 404, Login, Register, Cart, Checkout, Orders, Profile, Store Dashboard (all 7 sub-pages), Admin (all 7 sub-pages))
- React Router with lazy loading + Suspense + guards
- Zustand stores with localStorage persistence (auth, cart, theme)
- Axios with auto token refresh + request queuing
- i18n with AR/EN/KU — all 3 locale files complete (~130 keys each)
- Theme toggle: Light / Dark / System (follows OS preference)
- Language toggle: AR → EN → KU cycling, RTL/LTR DOM switching
- Framer Motion animation system (`src/lib/motion.ts`) — fadeUp with blur, stagger, slide, scaleIn, lineReveal
- Grain texture overlay, floating blob animations in hero
- Page transitions via `AnimatePresence` in `MainLayout`
- `ProductCard` / `StoreCard` with `whileInView` scroll entrance + hover lift
- LandingPage: full animation upgrade, stagger children, animated section underlines
- Frontend builds clean: `tsc -b && vite build` → 0 errors

**Infrastructure:**
- PostgreSQL 16 installed via Homebrew on macOS
- Database: `imdad_db` on `localhost:5432`
- Backend dev server: `nodemon` + `ts-node --transpile-only` on port 4000
- Frontend dev server: Vite on port 5173, proxies `/api` to `:4000`

### ⚠️ Incomplete / Partially Working

- **Image uploads**: `multer` is installed on the backend but no upload routes exist. Product `images` and store `logo`/`banner` are stored as URL strings — the frontend uses a `getImageUrl()` utility that handles fallbacks, but there is no actual upload UI or endpoint yet.
- **Footer i18n**: Footer text is hardcoded in Arabic — it does not respond to language switching.
- **Dashboard pages**: `DashboardAnalytics` and `DashboardSettings` are stub pages (minimal implementation).
- **Store Detail Page**: Works but uses Arabic hardcoded text (not fully i18n'd).
- **Admin pages**: All 7 admin pages exist but the extent of their implementation varies (AdminDashboard, AdminStores, AdminUsers are more complete; others may be stubs).
- **Cloudinary / image storage**: `src/utils/cloudinary.ts` is referenced in the plan but may not exist. No CDN configured.
- **Email notifications**: Not implemented.
- **Search**: Basic substring search on product name/store name — no full-text search.

### ❌ Not Started

- Payment gateway integration (intentionally deferred — COD only in V1)
- Push notifications / SMS for order updates
- Product reviews / ratings
- Wishlist
- Discount codes / coupons
- Store analytics (real charts — the analytics page is a stub)
- File upload endpoint (images stored as URLs, no upload UI)
- Production deployment / CI/CD
- Automated tests (no test files exist)
- Email system (registration confirmation, order updates)
- Store-level shipping configuration

---

## 5. Key Conventions

### Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase + `.tsx` | `ProductCard.tsx` |
| Pages | PascalCase + `Page.tsx` | `MarketplacePage.tsx` |
| Zustand stores | `camelCase.store.ts` | `auth.store.ts` |
| Utilities | `camelCase.ts` | `utils.ts`, `motion.ts` |
| i18n keys | `namespace.sub_key` (snake_case) | `product.add_to_cart` |
| DB IDs | Prisma `cuid()` — never UUID | `clxxxxxxxx` |
| URL slugs | generated via `slugify()` + `uniqueSlug()` | `optimum-whey-1a2b` |

### Component Structure Pattern

```tsx
// 1. Imports — external, then internal (use @/ alias)
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import type { Product } from '@/types';
import Button from '@/components/ui/Button';

// 2. Interface (props only — types go in src/types/)
interface PageProps {
  product: Product;
  onClose?: () => void;
}

// 3. Default export function (named function, not arrow)
export default function ProductCard({ product, onClose }: PageProps) {
  const { t } = useTranslation();
  // state, effects, handlers
  return <div>...</div>;
}

// 4. Sub-components at bottom of same file (no separate file for small helpers)
function DetailChip({ label, value }: { label: string; value: string }) {
  return <div>...</div>;
}
```

### Styling Conventions

- **Tailwind utility-first** — no custom CSS except in `globals.css`
- **RTL-safe**: use `start`/`end` instead of `left`/`right` (e.g., `ps-4`, `me-2`, `rounded-e-xl`)
- **Dark by default**: components styled for dark theme; light overrides in `.light` class
- **Color tokens** (always use these, never raw hex in components):
  - Gold CTA: `text-gold`, `bg-gold`, `border-gold`, `bg-gradient-gold`
  - Backgrounds: `bg-dark-900` (page), `bg-dark-700` (card), `bg-dark-800` (elevated/input)
  - Text: `text-text` (primary), `text-text-muted` (secondary), `text-text-faint` (disabled)
  - Danger/accent: `text-accent`, `bg-accent`
- **Rounded corners**: `rounded-xl` (inputs/small), `rounded-2xl` (cards), `rounded-3xl` (large cards/modals)
- **`cn()` utility**: always use `cn()` from `@/lib/utils` for conditional class merging

### Animation Conventions

Use variants from `src/lib/motion.ts` — do not define inline animation values:
```tsx
import { fadeUp, staggerContainer } from '@/lib/motion';

// Container
<motion.div variants={staggerContainer(0.1)} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  // Children
  <motion.div variants={fadeUp}>...</motion.div>
</motion.div>
```

Available variants: `revealVariant`, `fadeUp`, `fadeIn`, `staggerContainer(stagger, delay)`, `slideLeft`, `slideRight`, `scaleIn`, `lineReveal`  
Key exports: `CINEMA_EASE = [0.22, 1, 0.36, 1]`, `getVariant(variant)` (returns no-op when `prefers-reduced-motion`), `viewportReveal = { once: true, margin: '-100px' }`  
Ease curve: `CINEMA_EASE = [0.22, 1, 0.36, 1]` (cinematic spring-like cubic bezier)

### Form Handling Pattern

```tsx
// Use React Hook Form + Zod resolver
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
  resolver: zodResolver(schema),
});

async function onSubmit(data: FormData) {
  try {
    await api.post('/endpoint', data);
  } catch (err: any) {
    setError('root', { message: err.response?.data?.message ?? t('common.try_again') });
  }
}
```

**Exception**: Dashboard product forms (`DashboardAddProduct`, `DashboardEditProduct`) use plain `useForm<FormData>` with string fields and manual `parseInt()` conversion in `onSubmit` — Zod resolver caused type mismatch with mixed string/number fields.

### i18n Pattern

```tsx
const { t } = useTranslation(); // default namespace 'common'
t('product.add_to_cart')               // simple key
t('marketplace.product_count', { count: 42 })  // interpolation
t(`orders.status.${order.status}`)     // dynamic key (template literal)
```

All string-visible-to-user must use `t()`. No hardcoded Arabic, English, or Kurdish strings in components (except Footer — known issue).

### Backend Validation Pattern

Zod schemas defined per-module in `auth.schema.ts`, inline in route files for simpler modules. Always use Zod `.parse()` or `.safeParse()`, throw via `createError()` on failure.

### Backend Error Handling Pattern

```typescript
// In controller/route handler:
try {
  const result = await someService();
  res.json(result);
} catch (err) {
  next(err); // passes to centralized errorHandler middleware
}

// Throwing controlled errors:
throw createError('Store not found', 404);
```

---

## 6. Important Constraints

### Never Do These

1. **Do not add a payment gateway** — COD-only is a V1 product decision. Any payment integration requires explicit instruction.
2. **Do not use `left`/`right` CSS directional properties** — use `start`/`end` in Tailwind for RTL compatibility (`ps-`, `pe-`, `ms-`, `me-`, `rounded-s-`, `rounded-e-`, etc.)
3. **Do not use raw hex colors in component code** — use the CSS token names (`text-gold`, `bg-dark-700`, etc.)
4. **Do not create orders spanning multiple stores** — the cart enforces single-store per checkout. Multiple stores = multiple separate orders.
5. **Do not skip `authenticate` or `requireRole` on protected endpoints** — every write endpoint and any endpoint returning user-specific data must be protected.
6. **Do not store prices client-side as source of truth** — `OrderItem.priceIQD` is locked at server time during order creation. Never trust the client-side price.
7. **Do not change the Tailwind v4 setup** — the project uses `@tailwindcss/vite` plugin (Tailwind v4), NOT the traditional `postcss`/`tailwind.config.js` approach. Do not add a `tailwind.config.js`.
8. **Do not use `ts-node` without `--transpile-only` flag on the backend** — the Express request type augmentation in `src/types/express.d.ts` doesn't resolve properly at runtime without it.

### Sensitive Areas

- **`backend/.env`** — contains JWT secrets and DB connection string. Never commit this file. It is `.gitignore`'d.
- **`RefreshToken` table** — tokens are rotated on every refresh. If you modify the refresh logic, ensure the old token is always deleted before issuing a new one.
- **Stock decrement** — order creation decrements stock atomically in a Prisma `$transaction`. Do not move stock operations outside the transaction.
- **`User.suspended`** — suspended users cannot log in (checked in auth service). Admins can toggle this via `PATCH /api/users/:id`.

### Deprecated / Known Bad Patterns

- **`verbatimModuleSyntax`** is enabled in `tsconfig.app.json` — always use `import type { X }` or `import { type X }` for type-only imports, never bare `import { X }` when X is only a type.
- **`baseUrl` in tsconfig** — `ignoreDeprecations: "6.0"` is set because TypeScript 6 deprecated `baseUrl` standalone. Do not remove `ignoreDeprecations`.
- **Instagram / Twitter icons** — not available in lucide-react. Use `MessageCircle` (WhatsApp) and `Send` (Telegram) as replacements. See `Footer.tsx`.

---

## 7. Dev Commands

### Prerequisites

```bash
# PostgreSQL 16 must be running
brew services start postgresql@16

# Database must exist
psql postgres -c "CREATE DATABASE imdad_db;"
```

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env (copy from below, fill in values)
# Required vars: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# Run migrations (first time or after schema changes)
npx prisma migrate dev --name <description>

# Generate Prisma client (after schema changes)
npm run prisma:generate

# Seed the database (admin user + categories + brands)
npm run prisma:seed

# Start dev server (nodemon + ts-node --transpile-only, port 4000)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm run start

# Open Prisma Studio (DB GUI)
npm run prisma:studio
```

**Backend `.env` file** (copy this, fill in secrets):
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://<your_user>@localhost:5432/imdad_db"
JWT_ACCESS_SECRET=<any-long-random-string>
JWT_REFRESH_SECRET=<different-long-random-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Seeded credentials:**
- Admin: `admin@imdad.iq` / `Admin@123456`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (Vite, port 5173, proxies /api to :4000)
npm run dev

# Type-check + production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

### Run Both (quick start)

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Health Check

```bash
curl http://localhost:4000/health
# → {"status":"ok","env":"development"}

curl http://localhost:4000/api/auth/me
# → {"message":"Unauthorized"}  (expected — no token)
```

### No Tests

There are currently no automated tests. Test manually via browser at `http://localhost:5173`.

---

## 8. Open Questions / Known Issues

### Known Bugs / Issues

1. **Footer not i18n'd** — `Footer.tsx` uses hardcoded Arabic strings for all links and copyright text. Switching language has no effect on the footer. Needs translation keys added.

2. **`StoreDetailPage` hardcoded Arabic** — `src/pages/public/StoreDetailPage.tsx` was not updated in the i18n pass and likely still has hardcoded Arabic strings.

3. **`DashboardAnalytics` is a stub** — renders basic placeholder content. No real analytics implementation.

4. **`DashboardSettings` is a stub** — the settings form exists but may be incomplete.

5. **Admin pages vary in completeness** — `AdminStores` and `AdminUsers` are more fully implemented. `AdminProducts`, `AdminCategories`, `AdminBrands`, `AdminOrders` may be partial stubs.

6. **No image upload** — `multer` is installed on the backend but there is no `POST /api/upload` endpoint. Product images and store logos/banners are entered as raw URLs in forms. This is a significant UX gap.

7. **`App.tsx` is unused** — `src/App.tsx` exists but the app entry uses `RouterProvider` in `main.tsx` directly. `App.tsx` can be deleted.

8. **`hooks/` directory is empty** — `src/hooks/` exists with no files.

9. **`uuid` package unused** — installed in backend `package.json` but not imported anywhere (Prisma uses `cuid()`).

10. **Order pagination on buyer side** — `GET /orders/my` returns all orders without pagination. Works fine for V1 but will be a performance issue for heavy users.

11. **No loading state on initial auth check** — if the page loads while Zustand is hydrating from localStorage, there's a brief flash before route guards evaluate. Generally imperceptible but could cause issues.

### Unresolved Design Decisions

1. **Image storage strategy** — no decision on CDN (Cloudinary is referenced in the plan/utils but not implemented). Will it be Cloudinary, S3, or a local storage endpoint?

2. **Kurdish (Sorani) locale quality** — translations were AI-generated and have not been reviewed by a native Kurdish speaker.

3. **Product slug uniqueness** — `uniqueSlug()` appends a timestamp in base36. This means two products with the same name get different slugs. No UI for slug customization.

4. **Order history for store owners** — `GET /orders/store/mine` has no pagination. Could be a problem for active stores.

5. **Store status transitions** — currently any `StoreStatus` can be set to any other via admin panel. There is no enforced state machine (e.g., REJECTED stores can be re-APPROVED directly).

6. **Product status vs stock** — `ProductStatus.OUT_OF_STOCK` exists as an enum but stock is also tracked as `Product.stock (Int)`. These can get out of sync. The API filters by `status: ACTIVE` for public listings, but doesn't auto-update status based on stock.

7. **Multi-locale category names** — `Category.nameAr` is required; `Category.nameKu` is optional. The frontend always shows `cat.nameAr` regardless of selected language. This should be dynamic based on current locale.

8. **Cart conflict UX** — if a buyer adds products from Store A and then tries to add from Store B, the cart shows a warning toast but does not automatically resolve the conflict. User must manually clear the cart.

### TODOs Found in Code

- `src/utils/cloudinary.ts` — mentioned in the original plan but may not exist. If it does, it's unused.
- `multer` middleware is set up but not wired to any route.
- `hooks/` directory is a placeholder.
- Dashboard analytics page needs real chart implementation.

---

## Quick Reference Card

```
Roles:          BUYER | STORE_OWNER | ADMIN
Auth:           JWT access (15m) + refresh (7d, rotated, stored in DB)
Seed admin:     admin@imdad.iq / Admin@123456
DB:             PostgreSQL 16, database: imdad_db, user: system user
Ports:          Backend :4000, Frontend :5173
API base:       /api (proxied by Vite in dev)
i18n:           ar (default, RTL) | en (LTR) | ku (RTL)
Theme:          dark (default) | light | system
Storage keys:   imdad-auth | imdad-cart | imdad-theme (Zustand persist)
Colors:         Gold #C9A84C | Dark bg #0F0F1A | Accent red #E63946
Fonts:          Cairo (display/Arabic) | Inter (body)
No tests.       No payment. No image uploads. COD only.
```
