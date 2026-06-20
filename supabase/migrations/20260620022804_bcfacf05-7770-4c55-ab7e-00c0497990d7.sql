
-- ============= store_settings (singleton row) =============
CREATE TABLE public.store_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  free_shipping_threshold numeric NOT NULL DEFAULT 2500,
  flat_shipping_fee numeric NOT NULL DEFAULT 162,
  announcement_text text NOT NULL DEFAULT 'Free shipping on orders over ₹2500 · Call 089252 59787',
  hero_headline text NOT NULL DEFAULT 'DEXTER MENS CLOTHING',
  hero_subtext text NOT NULL DEFAULT 'Premium Menswear · Jayankondam',
  hero_image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store_settings public read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "store_settings admin write" ON public.store_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_store_settings_updated_at BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.store_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

-- ============= promo_codes =============
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('percent','flat')),
  value numeric NOT NULL CHECK (value > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promo_codes TO anon, authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "promo_codes public read" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "promo_codes admin write" ON public.promo_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.promo_codes (code, kind, value) VALUES
  ('DEXTER10','percent',10),
  ('DEXTER5','percent',5),
  ('FIRSTDROP','flat',200)
ON CONFLICT DO NOTHING;

-- ============= lookbook_items =============
CREATE TABLE public.lookbook_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  caption text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lookbook_items TO anon, authenticated;
GRANT ALL ON public.lookbook_items TO service_role;
ALTER TABLE public.lookbook_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lookbook public read" ON public.lookbook_items FOR SELECT USING (active = true);
CREATE POLICY "lookbook admin all read" ON public.lookbook_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "lookbook admin write" ON public.lookbook_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_lookbook_items_updated_at BEFORE UPDATE ON public.lookbook_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed a few starter lookbook images
INSERT INTO public.lookbook_items (image_url, sort_order) VALUES
  ('https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=900&q=80', 1),
  ('https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=900&q=80', 2),
  ('https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80', 3),
  ('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80', 4),
  ('https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80', 5),
  ('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80', 6);

-- ============= products extensions =============
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_text text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_by_size jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============= Realtime =============
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promo_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lookbook_items;
