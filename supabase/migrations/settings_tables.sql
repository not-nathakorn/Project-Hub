-- ============================================================================
-- Settings Tables for Admin Panel
-- ============================================================================

-- 1. Site Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name VARCHAR(255) DEFAULT 'CodeX',
    site_tagline VARCHAR(500) DEFAULT 'Developer Portfolio',
    contact_email VARCHAR(255),
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT DEFAULT 'เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
    google_analytics_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings if not exists
INSERT INTO site_settings (site_name, site_tagline)
SELECT 'CodeX', 'Developer Portfolio'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- 2. Appearance Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS appearance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'system'
    accent_color VARCHAR(20) DEFAULT '#3B82F6',
    language VARCHAR(10) DEFAULT 'th', -- 'th', 'en'
    font_size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Login Activity Table (for Security tab)
-- ============================================================================
CREATE TABLE IF NOT EXISTS login_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'failed'
    ip_address VARCHAR(50),
    user_agent TEXT,
    device VARCHAR(100),
    browser VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activity_created_at ON login_activity(created_at DESC);

-- 4. Active Sessions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(500),
    device VARCHAR(100) DEFAULT 'Desktop',
    browser VARCHAR(100),
    ip_address VARCHAR(50),
    location VARCHAR(255),
    is_current BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON active_sessions(user_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appearance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Site Settings: Anyone can read, only authenticated can update
DROP POLICY IF EXISTS "Anyone can read site_settings" ON site_settings;
CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can update site_settings" ON site_settings;
CREATE POLICY "Authenticated users can update site_settings" ON site_settings 
    FOR ALL USING (auth.role() = 'authenticated');

-- Appearance Settings: Users can only see/edit their own
DROP POLICY IF EXISTS "Users can manage own appearance_settings" ON appearance_settings;
CREATE POLICY "Users can manage own appearance_settings" ON appearance_settings 
    FOR ALL USING (auth.uid() = user_id);

-- Login Activity: Users can only see their own
DROP POLICY IF EXISTS "Users can view own login_activity" ON login_activity;
CREATE POLICY "Users can view own login_activity" ON login_activity 
    FOR SELECT USING (auth.uid() = user_id);

-- Active Sessions: Users can only see their own
DROP POLICY IF EXISTS "Users can manage own sessions" ON active_sessions;
CREATE POLICY "Users can manage own sessions" ON active_sessions 
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appearance_settings_updated_at ON appearance_settings;
CREATE TRIGGER update_appearance_settings_updated_at
    BEFORE UPDATE ON appearance_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
