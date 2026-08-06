DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE c.relkind='r' AND n.nspname='public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);
  END LOOP;
END $$;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.payment_settings TO anon;
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT ON public.promo_codes TO anon;
GRANT SELECT ON public.lookbook_items TO anon;
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT INSERT ON public.orders TO anon;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;

ALTER TABLE public.payment_settings
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS upi_vpa text,
  ADD COLUMN IF NOT EXISTS payee_name text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='payment_settings_method_key') THEN
    ALTER TABLE public.payment_settings ADD CONSTRAINT payment_settings_method_key UNIQUE (method);
  END IF;
END $$;

UPDATE public.payment_settings SET label = COALESCE(label,
  CASE method WHEN 'cod' THEN 'Cash on Delivery' WHEN 'upi' THEN 'UPI' WHEN 'card' THEN 'Credit / Debit Card' ELSE initcap(method) END),
  description = COALESCE(description,
  CASE method WHEN 'cod' THEN 'Pay when you receive' WHEN 'upi' THEN 'Google Pay, PhonePe, Paytm' WHEN 'card' THEN 'Visa, Mastercard, RuPay' ELSE '' END);

DROP POLICY IF EXISTS "Admins delete payment settings" ON public.payment_settings;
CREATE POLICY "Admins delete payment settings" ON public.payment_settings
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));