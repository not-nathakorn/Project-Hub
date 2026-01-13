-- Create SEO Settings Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.seo_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_name TEXT UNIQUE NOT NULL,
    meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '',
    og_title TEXT DEFAULT '',
    og_description TEXT DEFAULT '',
    og_image TEXT DEFAULT '',
    keywords TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (SEO data should be public)
CREATE POLICY "Allow public read access to seo_settings"
    ON public.seo_settings
    FOR SELECT
    USING (true);

-- Create policy for authenticated users to update
CREATE POLICY "Allow authenticated users to manage seo_settings"
    ON public.seo_settings
    FOR ALL
    USING (true);

-- Grant permissions
GRANT SELECT ON public.seo_settings TO anon;
GRANT ALL ON public.seo_settings TO authenticated;

-- Create updated_at trigger function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default SEO settings for common pages
INSERT INTO public.seo_settings (page_name, meta_title, meta_description) VALUES
    ('home', 'Na-thakorn Pikromsuk - Portfolio', 'Welcome to my portfolio website. I am a developer passionate about creating amazing web experiences.'),
    ('projects', 'Projects - Na-thakorn', 'Explore my projects and work.'),
    ('about', 'About Me - Na-thakorn', 'Learn more about me and my journey.'),
    ('contact', 'Contact - Na-thakorn', 'Get in touch with me.')
ON CONFLICT (page_name) DO NOTHING;
