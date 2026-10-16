-- ==============================================================================
-- DEXTER MEN'S CLOTHING — ADVANCED CMS & STORE MANAGEMENT SUITE
-- Migration: 20261016090000_dexter_cms_suite.sql
-- ==============================================================================

-- 1. EXTEND PRODUCTS TABLE FOR MULTI-IMAGE, BRAND, SKU, AND MERCHANDISING
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'DEXTER',
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. DEDICATED PRODUCT_IMAGES TABLE FOR RELATIONAL GALLERY MANAGEMENT
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  view_type TEXT DEFAULT 'front', -- 'front', 'back', 'side', 'detail', 'model', 'other'
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON public.product_images(product_id, sort_order ASC);

-- 3. ADVERTISEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  button_text TEXT,
  button_url TEXT,
  placement TEXT NOT NULL DEFAULT 'hero', -- 'hero', 'home_promo', 'banner_strip', 'shop', 'category'
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  background_color TEXT DEFAULT '#0d0e12',
  text_color TEXT DEFAULT '#ffffff',
  text_alignment TEXT DEFAULT 'center', -- 'left', 'center', 'right'
  overlay_opacity NUMERIC DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advertisements_placement ON public.advertisements(placement, is_active);

-- 4. PROMOTIONAL BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  background_color TEXT DEFAULT '#dc2626',
  text_color TEXT DEFAULT '#ffffff',
  button_text TEXT,
  button_url TEXT,
  placement TEXT NOT NULL DEFAULT 'announcement', -- 'announcement', 'compact_card', 'medium_promo', 'large_banner', 'shop_top'
  layout_preset TEXT DEFAULT 'thin_announcement', -- 'thin_announcement', 'compact', 'medium', 'large_hero'
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotional_banners_placement ON public.promotional_banners(placement, is_active);

-- 5. OFFERS & DISCOUNT CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.discount_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  offer_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed_amount', 'product_specific', 'category_specific', 'sitewide', 'coupon_code', 'flash_sale'
  discount_value NUMERIC NOT NULL DEFAULT 0,
  coupon_code TEXT,
  applicable_products JSONB DEFAULT '[]'::jsonb,
  applicable_categories JSONB DEFAULT '[]'::jsonb,
  min_purchase_amount NUMERIC DEFAULT 0,
  max_discount_amount NUMERIC,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  display_label TEXT,
  banner_image_url TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discount_campaigns_code ON public.discount_campaigns(coupon_code);
CREATE INDEX IF NOT EXISTS idx_discount_campaigns_active ON public.discount_campaigns(is_active);

-- 6. HOMEPAGE DESIGN & SECTION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.homepage_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  background_image_url TEXT,
  background_mobile_image_url TEXT,
  background_sizing TEXT DEFAULT 'cover', -- 'cover', 'contain'
  focal_point TEXT DEFAULT 'center 18%',
  overlay_opacity NUMERIC DEFAULT 0.40,
  is_background_published BOOLEAN DEFAULT TRUE,
  draft_background_image_url TEXT,
  sections_order JSONB DEFAULT '[
    {"id": "announcement", "enabled": true, "title": ""},
    {"id": "hero", "enabled": true, "title": "DEXTER MENS CLOTHING", "subtitle": "Premium Menswear · Jayankondam"},
    {"id": "promo_banners", "enabled": true, "title": ""},
    {"id": "categories", "enabled": true, "title": "Shop By Category", "subtitle": "Curated collections for modern men"},
    {"id": "featured_products", "enabled": true, "title": "Featured Streetwear", "subtitle": "Hand-picked elevated essentials"},
    {"id": "new_arrivals", "enabled": true, "title": "New Arrivals", "subtitle": "Fresh drop of premium streetwear"},
    {"id": "advertisements", "enabled": true, "title": "Featured Campaigns"},
    {"id": "lookbook", "enabled": true, "title": "Lookbook — Street Elevation", "subtitle": "Real styling, real fabric, real Jayankondam culture."},
    {"id": "reviews", "enabled": true, "title": "Customer Reviews", "subtitle": "Verified feedback from style-conscious men"},
    {"id": "store_info", "enabled": true, "title": "Visit Our Store", "subtitle": "Anna Silai, Jayankondam"}
  ]'::jsonb,
  featured_product_ids JSONB DEFAULT '[]'::jsonb,
  featured_categories JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CENTRAL MEDIA ASSETS LIBRARY
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  category TEXT NOT NULL DEFAULT 'other', -- 'products', 'backgrounds', 'advertisements', 'banners', 'categories', 'other'
  file_size INTEGER,
  dimensions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category);

-- 8. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Public read access for customer storefront
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read active advertisements" ON public.advertisements FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read active promotional_banners" ON public.promotional_banners FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read active discount_campaigns" ON public.discount_campaigns FOR SELECT TO anon, authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read homepage_settings" ON public.homepage_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read media_assets" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);

-- Admin write access
CREATE POLICY "Admins manage product_images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage advertisements" ON public.advertisements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage promotional_banners" ON public.promotional_banners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage discount_campaigns" ON public.discount_campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage homepage_settings" ON public.homepage_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage media_assets" ON public.media_assets FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. INITIAL SEED FOR HOMEPAGE SETTINGS
INSERT INTO public.homepage_settings (id, background_sizing, focal_point, overlay_opacity, is_background_published)
VALUES ('main', 'cover', 'center 18%', 0.40, true)
ON CONFLICT (id) DO NOTHING;
