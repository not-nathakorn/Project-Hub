-- Fix Security Vulnerabilities
-- 1. Fix insecure function public.update_map_settings_secure

CREATE OR REPLACE FUNCTION public.update_map_settings_secure(
  p_is_visible BOOLEAN,
  p_enabled_universities JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp -- Fix: Set search_path
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update the single row (we assume there's only one settings row)
  UPDATE public.map_settings
  SET 
    is_visible = p_is_visible,
    enabled_universities = p_enabled_universities,
    updated_at = NOW()
  WHERE id = (SELECT id FROM public.map_settings LIMIT 1)
  RETURNING to_jsonb(map_settings.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Note: regarding pgbouncer.get_auth
-- This function belongs to the pgbouncer schema which is usually managed by the system/extensions.
-- If you have permissions, you can try to run the following, but it might fail if you are not a superuser:
-- ALTER FUNCTION pgbouncer.get_auth(text) SET search_path = pgbouncer, pg_temp;
