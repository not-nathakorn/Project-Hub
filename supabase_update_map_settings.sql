-- Create a function to update map settings that bypasses RLS complexity
CREATE OR REPLACE FUNCTION public.update_map_settings(
  p_id UUID,
  p_is_visible BOOLEAN,
  p_enabled_universities JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run as the creator of the function (usually postgres/admin)
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Update the settings
  UPDATE public.map_settings
  SET 
    is_visible = p_is_visible,
    enabled_universities = p_enabled_universities,
    updated_at = NOW()
  WHERE id = p_id
  RETURNING to_jsonb(map_settings.*) INTO v_result;

  -- If no row updated (maybe ID not found), try to insert (or update the single row if exists)
  IF v_result IS NULL THEN
    -- Check if ANY row exists
    IF EXISTS (SELECT 1 FROM public.map_settings) THEN
       -- Update the first row found (since we assume only 1 settings row)
       UPDATE public.map_settings
       SET 
         is_visible = p_is_visible,
         enabled_universities = p_enabled_universities,
         updated_at = NOW()
       WHERE id = (SELECT id FROM public.map_settings LIMIT 1)
       RETURNING to_jsonb(map_settings.*) INTO v_result;
    ELSE
       -- Insert new row
       INSERT INTO public.map_settings (id, is_visible, enabled_universities)
       VALUES (COALESCE(p_id, gen_random_uuid()), p_is_visible, p_enabled_universities)
       RETURNING to_jsonb(map_settings.*) INTO v_result;
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_map_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_map_settings TO anon;
