-- Update handle_new_user trigger: phone 8668183926 = admin, remove email admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_phone text;
BEGIN
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');

  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), v_phone);

  IF regexp_replace(v_phone, '\D', '', 'g') = '8668183926'
     OR NEW.email = '8668183926@dexter.phone' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Promote any existing user with that phone alias to admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = '8668183926@dexter.phone'
ON CONFLICT DO NOTHING;

-- Remove legacy email-based admin role
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id IN (
    SELECT id FROM auth.users WHERE email IN ('admin@dexter.com', 'admin@dextermensclothing.in')
  );