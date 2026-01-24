-- Add images column to experience table
ALTER TABLE experience 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Allow public read of images (already covered by existing policies usually, but good to check)
-- No RLS update needed if 'SELECT USING (true)' is already set.

COMMENT ON COLUMN experience.images IS 'Array of image URLs for the experience gallery';
