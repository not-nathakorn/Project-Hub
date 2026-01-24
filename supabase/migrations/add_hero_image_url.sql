-- Add hero_image_url column to site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS hero_image_url TEXT DEFAULT '/Dev.png';

-- Update the update_site_settings RPC function to include hero_image_url AND fix security settings
CREATE OR REPLACE FUNCTION update_site_settings(
  p_id UUID,
  p_maintenance_mode BOOLEAN,
  p_maintenance_message TEXT,
  p_maintenance_title TEXT,
  p_maintenance_detail TEXT,
  p_maintenance_duration TEXT,
  p_site_name TEXT,
  p_site_tagline TEXT,
  p_contact_email TEXT,
  p_google_analytics_id TEXT,
  p_available_for_work BOOLEAN,
  p_social_linkedin TEXT,
  p_social_line TEXT,
  p_hero_image_url TEXT DEFAULT '/Dev.png'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Run as database owner to bypass RLS for this specific update
SET search_path = public, pg_catalog -- Fix for function_search_path_mutable warning
AS $$
DECLARE
  v_updated_data site_settings%ROWTYPE;
BEGIN
  INSERT INTO site_settings (
    id,
    maintenance_mode,
    maintenance_message,
    maintenance_title,
    maintenance_detail,
    maintenance_duration,
    site_name,
    site_tagline,
    contact_email,
    google_analytics_id,
    available_for_work,
    social_linkedin,
    social_line,
    hero_image_url,
    updated_at
  )
  VALUES (
    p_id,
    p_maintenance_mode,
    p_maintenance_message,
    p_maintenance_title,
    p_maintenance_detail,
    p_maintenance_duration,
    p_site_name,
    p_site_tagline,
    p_contact_email,
    p_google_analytics_id,
    p_available_for_work,
    p_social_linkedin,
    p_social_line,
    p_hero_image_url,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    maintenance_mode = EXCLUDED.maintenance_mode,
    maintenance_message = EXCLUDED.maintenance_message,
    maintenance_title = EXCLUDED.maintenance_title,
    maintenance_detail = EXCLUDED.maintenance_detail,
    maintenance_duration = EXCLUDED.maintenance_duration,
    site_name = EXCLUDED.site_name,
    site_tagline = EXCLUDED.site_tagline,
    contact_email = EXCLUDED.contact_email,
    google_analytics_id = EXCLUDED.google_analytics_id,
    available_for_work = EXCLUDED.available_for_work,
    social_linkedin = EXCLUDED.social_linkedin,
    social_line = EXCLUDED.social_line,
    hero_image_url = EXCLUDED.hero_image_url,
    updated_at = NOW()
  RETURNING * INTO v_updated_data;
  
  RETURN to_jsonb(v_updated_data);
END;
$$;
