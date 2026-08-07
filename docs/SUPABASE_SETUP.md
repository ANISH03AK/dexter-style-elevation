# Supabase Setup Guide — DEXTER MENS CLOTHING

## 1. Environment variables

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

Both values are public by design — data is protected by Row Level Security.
The build accepts either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 2. Client

`src/lib/supabase.ts` exports the shared client:

```ts
import { supabase } from "@/lib/supabase";
```

Sessions persist in `localStorage` with auto token refresh.

## 3. Database schema (already provisioned)

| Table | Purpose |
| --- | --- |
| `profiles` | User profile (email, full name, phone), auto-created on signup |
| `user_roles` | `admin` / `customer` roles, checked via the `has_role()` function |
| `products` | Catalogue: price, offer price, category, image URL, per-size stock, pin/badge |
| `orders` | Orders with items JSON, address, totals, payment method, status |
| `reviews` | Customer reviews, admin-moderated |
| `promo_codes` | Discount codes (percent / fixed) |
| `store_settings` | Announcement bar, hero copy/image, shipping thresholds |
| `lookbook_items` | "Shop the look" gallery |
| `payment_settings` | Configurable payment methods (COD / UPI / Card) |
| `audit_logs` | Automatic create/update/delete trail for admin actions |

Categories are derived from `products.category` (Shirts, T-Shirts, Pants,
Activewear, Innerwear, Accessories). Cart and wishlist are intentionally
client-side (`localStorage`) so guests can shop without an account.

## 4. Row Level Security

RLS is enabled on every table. Summary:

- Products, store settings, promo codes, lookbook, payment settings: public read, admin-only write.
- Orders: anyone can place one; users see only their own; admins see and manage all.
- Profiles / user roles: users read and update only their own row.
- Reviews: approved reviews are public; admins moderate.
- Audit logs: admin read only, inserted by database triggers.

Roles are **never** stored on `profiles` — always on `user_roles`, checked with
the `SECURITY DEFINER` function `has_role(uid, role)` to avoid recursive policies.

## 5. Storage

Bucket **`product-images`** (public) holds all catalogue imagery. Upload helper:

```ts
import { uploadProductImage } from "@/services/products";
const { data: url, error } = await uploadProductImage(file);
```

## 6. Authentication

- Email + password (customers use a `<mobile>@dexter.phone` alias so one mobile number = one account).
- Google login: helpers are ready in `src/services/auth.ts`; enable the Google provider in the backend auth settings to activate it.
- Password reset: `resetPassword()` sends a mail redirecting to `/reset-password`.
- Protected routes: `AdminGuard` gates `/admin`; owner login lives at `/dexter-boss`.
- Logout: `signOut()` clears the session and remember-me flags.

## 7. Admin access

`/dexter-boss` → phone `8668183926`, password `DexterAdmin`.
