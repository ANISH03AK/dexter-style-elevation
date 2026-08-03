CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  action text NOT NULL,
  record_id text,
  actor_id uuid,
  actor_email text,
  summary text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_email text;
  v_rec_id text;
  v_summary text;
BEGIN
  SELECT email INTO v_email FROM public.profiles WHERE id = v_actor;

  IF TG_OP = 'DELETE' THEN
    v_rec_id := (to_jsonb(OLD)->>'id');
  ELSE
    v_rec_id := (to_jsonb(NEW)->>'id');
  END IF;

  v_summary := COALESCE(
    (CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'name',
    (CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'code',
    (CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'customer_name',
    (CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END)->>'caption',
    TG_TABLE_NAME
  );

  INSERT INTO public.audit_logs (table_name, action, record_id, actor_id, actor_email, summary, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    v_rec_id,
    v_actor,
    v_email,
    v_summary,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_store_settings AFTER INSERT OR UPDATE OR DELETE ON public.store_settings
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_promo_codes AFTER INSERT OR UPDATE OR DELETE ON public.promo_codes
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_lookbook_items AFTER INSERT OR UPDATE OR DELETE ON public.lookbook_items
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();