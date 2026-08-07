-- =============================================================================
-- DEXTER MENS CLOTHING — COMPLETE PRODUCTION DATABASE SCHEMA
-- =============================================================================
-- Derived by inspecting every Supabase call in the codebase. Tables included:
--   profiles, user_roles, products, orders, reviews, promo_codes,
--   lookbook_items, store_settings, payment_settings, audit_logs
--   + storage bucket "product-images"
--
-- NOT included (intentionally): categories, brands, product_images, variants,
-- carts, wishlists, newsletter, FAQ, CMS pages, analytics, etc.
--   * Categories are a text column on products (products.category).
--   * Variants/stock live in products.stock_by_size (jsonb).
--   * Cart + Wishlist are client-side localStorage (CartContext/WishlistContext).
--   * Order items live in orders.items (jsonb) — no separate order_items table.
--   * Trending/featured = products.pinned; offers = products.offer_price/badge_text.
--   * Hero/announcement/shipping/SEO copy = store_settings singleton row.
-- Adding tables the app never queries would ship dead schema, so they are omitted.
--
-- Script is idempotent and safe to re-run in the Supabase SQL editor.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'customer');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- 2. SHARED FUNCTIONS
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

revoke execute on function public.touch_updated_at() from anon, authenticated;

-- Role check (security definer -> avoids recursive RLS on user_roles)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. PROFILES  (src/services/auth.ts, useAuth.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists idx_profiles_phone on public.profiles(phone);
create unique index if not exists uq_profiles_phone on public.profiles(phone) where phone is not null and phone <> '';

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 4. USER ROLES  (AdminGuard.tsx, DexterBoss.tsx, useAuth.tsx)
-- Roles are NEVER stored on profiles — separate table prevents privilege escalation.
-- -----------------------------------------------------------------------------
create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists idx_user_roles_user on public.user_roles(user_id);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "Users read own roles" on public.user_roles;
create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- New-signup bootstrap: profile row + default 'customer' role (never 'admin').
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict do nothing;

  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. AUDIT LOGS  (components/admin/AuditLog.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  table_name  text not null,
  action      text not null check (action in ('INSERT','UPDATE','DELETE')),
  record_id   text,
  actor_id    uuid,
  actor_email text,
  summary     text,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name);

grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;

drop policy if exists "Admins read audit logs" on public.audit_logs;
create policy "Admins read audit logs" on public.audit_logs
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
-- No insert/update/delete policies: rows are written only by the definer trigger.

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_rec_id text;
  v_summary text;
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  select email into v_email from public.profiles where id = v_actor;
  v_rec_id := v_row->>'id';
  v_summary := coalesce(
    v_row->>'name', v_row->>'code', v_row->>'customer_name', v_row->>'caption', tg_table_name
  );

  insert into public.audit_logs (table_name, action, record_id, actor_id, actor_email, summary, old_data, new_data)
  values (
    tg_table_name, tg_op, v_rec_id, v_actor, v_email, v_summary,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  return coalesce(new, old);
end; $$;

revoke execute on function public.log_audit_event() from anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. PRODUCTS  (ProductsContext.tsx, services/products.ts, Admin.tsx)
-- category = text (Shirts, T-Shirts, Pants, Activewear, Innerwear, Accessories)
-- pinned = "Trending Now" homepage flag; stock_by_size = per-size inventory matrix
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(trim(name)) > 0),
  category      text not null,
  price         numeric(10,2) not null check (price >= 0),
  offer_price   numeric(10,2) check (offer_price is null or offer_price >= 0),
  image_url     text,
  description   text,
  tag           text,
  badge_text    text,
  pinned        boolean not null default false,
  stock_by_size jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint products_offer_lt_price check (offer_price is null or offer_price <= price)
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_pinned on public.products(pinned) where pinned;
create index if not exists idx_products_created on public.products(created_at desc);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products
  for select to anon, authenticated using (deleted_at is null or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins insert products" on public.products;
create policy "Admins insert products" on public.products
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update products" on public.products;
create policy "Admins update products" on public.products
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete products" on public.products;
create policy "Admins delete products" on public.products
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists products_touch_updated on public.products;
create trigger products_touch_updated before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_products on public.products;
create trigger audit_products after insert or update or delete on public.products
  for each row execute function public.log_audit_event();

-- -----------------------------------------------------------------------------
-- 7. ORDERS  (Checkout.tsx, TrackOrder.tsx, services/orders.ts)
-- items jsonb = line items; shipping address stored inline on the order.
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  customer_name  text not null,
  phone          text not null,
  address        text not null,
  city           text not null,
  pincode        text not null,
  items          jsonb not null,
  total          numeric(10,2) not null check (total >= 0),
  payment_method text not null default 'cod',
  status         text not null default 'pending'
                 check (status in ('pending','confirmed','packed','shipped','delivered','cancelled','returned','refunded')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);

grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

-- Guests may place orders only with user_id null; signed-in users only as themselves.
drop policy if exists "Place own or guest order" on public.orders;
create policy "Place own or guest order" on public.orders
  for insert to anon, authenticated
  with check (
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  );

drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders
  for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete orders" on public.orders;
create policy "Admins delete orders" on public.orders
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_orders on public.orders;
create trigger audit_orders after insert or update or delete on public.orders
  for each row execute function public.log_audit_event();

-- -----------------------------------------------------------------------------
-- 8. REVIEWS / RATINGS / TESTIMONIALS  (components/Reviews.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  product_id  uuid references public.products(id) on delete cascade,
  author_name text not null,
  location    text,
  rating      integer not null check (rating between 1 and 5),
  body        text not null,
  approved    boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_approved on public.reviews(approved) where approved;

grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

drop policy if exists "Anyone can view approved reviews" on public.reviews;
create policy "Anyone can view approved reviews" on public.reviews
  for select to anon, authenticated
  using ((approved = true and deleted_at is null) or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Submit own or anonymous review" on public.reviews;
create policy "Submit own or anonymous review" on public.reviews
  for insert to anon, authenticated
  with check (
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and (user_id is null or user_id = auth.uid()))
  );

drop policy if exists "Admins update reviews" on public.reviews;
create policy "Admins update reviews" on public.reviews
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete reviews" on public.reviews;
create policy "Admins delete reviews" on public.reviews
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at before update on public.reviews
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 9. PROMO CODES / COUPONS  (Cart.tsx, Admin.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.promo_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text not null,
  kind       text not null check (kind in ('percent','flat')),
  value      numeric(10,2) not null check (value > 0),
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists uq_promo_codes_code on public.promo_codes(upper(code));

grant select on public.promo_codes to anon, authenticated;
grant insert, update, delete on public.promo_codes to authenticated;
grant all on public.promo_codes to service_role;
alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes public read" on public.promo_codes;
create policy "promo_codes public read" on public.promo_codes
  for select to anon, authenticated using (deleted_at is null);

drop policy if exists "promo_codes admin write" on public.promo_codes;
create policy "promo_codes admin write" on public.promo_codes
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_promo_codes_updated_at on public.promo_codes;
create trigger trg_promo_codes_updated_at before update on public.promo_codes
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_promo_codes on public.promo_codes;
create trigger audit_promo_codes after insert or update or delete on public.promo_codes
  for each row execute function public.log_audit_event();

-- -----------------------------------------------------------------------------
-- 10. LOOKBOOK  ("SHOP THE LOOK" grid — LookbookContext.tsx, Admin.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.lookbook_items (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  product_id uuid references public.products(id) on delete set null,
  caption    text,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_lookbook_sort on public.lookbook_items(sort_order);
create index if not exists idx_lookbook_product on public.lookbook_items(product_id);

grant select on public.lookbook_items to anon, authenticated;
grant insert, update, delete on public.lookbook_items to authenticated;
grant all on public.lookbook_items to service_role;
alter table public.lookbook_items enable row level security;

drop policy if exists "lookbook public read" on public.lookbook_items;
create policy "lookbook public read" on public.lookbook_items
  for select to anon, authenticated using (active = true and deleted_at is null);

drop policy if exists "lookbook admin all read" on public.lookbook_items;
create policy "lookbook admin all read" on public.lookbook_items
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "lookbook admin write" on public.lookbook_items;
create policy "lookbook admin write" on public.lookbook_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_lookbook_items_updated_at on public.lookbook_items;
create trigger trg_lookbook_items_updated_at before update on public.lookbook_items
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_lookbook_items on public.lookbook_items;
create trigger audit_lookbook_items after insert or update or delete on public.lookbook_items
  for each row execute function public.log_audit_event();

-- -----------------------------------------------------------------------------
-- 11. STORE SETTINGS  (singleton: shipping, announcement bar, hero content)
--     StoreSettingsContext.tsx, Admin.tsx
-- -----------------------------------------------------------------------------
create table if not exists public.store_settings (
  id                      boolean primary key default true check (id),
  free_shipping_threshold numeric(10,2) not null default 2500,
  flat_shipping_fee       numeric(10,2) not null default 162,
  announcement_text       text not null default 'Free shipping on orders over ₹2500 · Call 089252 59787',
  hero_headline           text not null default 'DEXTER MENS CLOTHING',
  hero_subtext            text not null default 'Premium Menswear · Jayankondam',
  hero_image_url          text,
  updated_at              timestamptz not null default now()
);

grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;

drop policy if exists "store_settings public read" on public.store_settings;
create policy "store_settings public read" on public.store_settings
  for select to anon, authenticated using (true);

drop policy if exists "store_settings admin write" on public.store_settings;
create policy "store_settings admin write" on public.store_settings
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_store_settings_updated_at on public.store_settings;
create trigger trg_store_settings_updated_at before update on public.store_settings
  for each row execute function public.touch_updated_at();

drop trigger if exists audit_store_settings on public.store_settings;
create trigger audit_store_settings after insert or update or delete on public.store_settings
  for each row execute function public.log_audit_event();

-- -----------------------------------------------------------------------------
-- 12. PAYMENT SETTINGS / METHODS  (admin/PaymentMethods.tsx, Checkout.tsx)
-- -----------------------------------------------------------------------------
create table if not exists public.payment_settings (
  method       text primary key,
  label        text,
  description  text,
  instructions text,
  upi_vpa      text,
  payee_name   text,
  enabled      boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

grant select on public.payment_settings to anon, authenticated;
grant insert, update, delete on public.payment_settings to authenticated;
grant all on public.payment_settings to service_role;
alter table public.payment_settings enable row level security;

drop policy if exists "Anyone view payment settings" on public.payment_settings;
create policy "Anyone view payment settings" on public.payment_settings
  for select to anon, authenticated using (true);

drop policy if exists "Admins insert payment settings" on public.payment_settings;
create policy "Admins insert payment settings" on public.payment_settings
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update payment settings" on public.payment_settings;
create policy "Admins update payment settings" on public.payment_settings
  for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins delete payment settings" on public.payment_settings;
create policy "Admins delete payment settings" on public.payment_settings
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

drop trigger if exists trg_payment_settings_updated_at on public.payment_settings;
create trigger trg_payment_settings_updated_at before update on public.payment_settings
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 13. STORAGE BUCKET  ("product-images" — services/products.ts, Admin.tsx)
-- Public read (product photos are shown to everyone); admin-only writes.
-- Note: on Lovable Cloud the bucket is created via the storage tool, not SQL.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- -----------------------------------------------------------------------------
-- 14. SEED DATA (idempotent, safe for testing)
-- -----------------------------------------------------------------------------
insert into public.store_settings (id) values (true) on conflict (id) do nothing;

insert into public.payment_settings (method, label, description, instructions, upi_vpa, payee_name, enabled, sort_order)
values
  ('cod', 'Cash on Delivery', 'Pay in cash when your order arrives', 'Keep exact change ready.', null, null, true, 1),
  ('upi', 'UPI', 'Pay instantly via any UPI app', 'Send the amount to the UPI ID below and share the reference number.', 'dexter@upi', 'Dexter Mens Clothing', true, 2),
  ('card', 'Card', 'Debit / Credit card', 'Card payments are processed at the store counter on delivery.', null, null, false, 3)
on conflict (method) do nothing;

insert into public.promo_codes (code, kind, value, active) values
  ('DEXTER10', 'percent', 10, true),
  ('FIRSTDROP', 'flat', 200, true)
on conflict do nothing;

insert into public.products (name, category, price, offer_price, description, tag, badge_text, pinned, stock_by_size)
select * from (values
  ('Classic Oxford Shirt', 'Shirts', 1299::numeric, 999::numeric, 'Breathable cotton oxford, tailored fit.', 'Bestseller', 'SAVE ₹300', true, '{"S":8,"M":12,"L":10,"XL":6}'::jsonb),
  ('Premium Black Tee', 'T-Shirts', 799::numeric, 599::numeric, 'Heavyweight combed cotton crew neck.', 'New', 'SAVE ₹200', true, '{"S":15,"M":20,"L":18,"XL":9}'::jsonb),
  ('Slim Fit Chinos', 'Pants', 1799::numeric, null::numeric, 'Stretch twill chinos for all-day comfort.', null, null, false, '{"30":6,"32":10,"34":8,"36":4}'::jsonb),
  ('Dry-Fit Training Tee', 'Activewear', 999::numeric, 749::numeric, 'Moisture-wicking performance fabric.', 'Trending', 'SAVE ₹250', true, '{"S":10,"M":14,"L":12,"XL":5}'::jsonb),
  ('Cotton Vest Pack of 3', 'Innerwear', 599::numeric, null::numeric, 'Soft combed cotton, everyday comfort.', null, null, false, '{"M":25,"L":20,"XL":12}'::jsonb),
  ('Leather Belt', 'Accessories', 899::numeric, 699::numeric, 'Genuine leather with brushed buckle.', null, 'SAVE ₹200', false, '{"Free":30}'::jsonb)
) as seed(name, category, price, offer_price, description, tag, badge_text, pinned, stock_by_size)
where not exists (select 1 from public.products);

insert into public.reviews (author_name, location, rating, body, approved)
select * from (values
  ('Karthik R.', 'Jayankondam', 5, 'Best menswear collection in town. Fabric quality is excellent.', true),
  ('Suresh M.', 'Trichy', 5, 'Ordered two shirts, delivered in two days. Perfect fit.', true),
  ('Vignesh P.', 'Ariyalur', 4, 'Good pricing and genuine offers. Will shop again.', true)
) as seed(author_name, location, rating, body, approved)
where not exists (select 1 from public.reviews);

-- -----------------------------------------------------------------------------
-- 15. GRANT THE OWNER ACCOUNT ADMIN ROLE
-- Replace the phone alias below if your owner account uses a different login.
-- -----------------------------------------------------------------------------
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = '8668183926@dexter.phone' or raw_user_meta_data->>'phone' = '8668183926'
on conflict do nothing;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
