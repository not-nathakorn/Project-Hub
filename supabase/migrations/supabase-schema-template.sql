-- ========================================
-- CodeX Portfolio Database Schema (Template)
-- ========================================
-- This is a template file safe to commit to git
-- For actual data, use supabase-schema.sql (gitignored)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. Personal Information Table
-- ========================================
CREATE TABLE IF NOT EXISTS personal_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  nickname TEXT,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  bio_th TEXT,
  bio_en TEXT,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  github_url TEXT,
  line_id TEXT,
  ielts_score TEXT,
  ielts_validity TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. Universities Table
-- ========================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th TEXT NOT NULL,
  name_en TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  logo_url TEXT,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Projects Table
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description_th TEXT NOT NULL,
  description_en TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT '🚀',
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. Education Table
-- ========================================
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_th TEXT NOT NULL,
  subtitle_en TEXT NOT NULL,
  description_th TEXT,
  description_en TEXT,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  badge TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. Experience Table
-- ========================================
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  title_th TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_th TEXT NOT NULL,
  subtitle_en TEXT NOT NULL,
  description_th TEXT,
  description_en TEXT,
  badge TEXT,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Create Indexes for Performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index, is_visible);
CREATE INDEX IF NOT EXISTS idx_education_order ON education(order_index, is_visible);
CREATE INDEX IF NOT EXISTS idx_experience_order ON experience(order_index, is_visible);
CREATE INDEX IF NOT EXISTS idx_universities_visible ON universities(is_visible);

-- ========================================
-- Update Timestamp Trigger Function
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Apply Update Triggers
-- ========================================
CREATE TRIGGER update_personal_info_updated_at BEFORE UPDATE ON personal_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_universities_updated_at BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS
ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Allow public read access" ON personal_info FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON universities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON projects FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read access" ON education FOR SELECT USING (is_visible = true);
CREATE POLICY "Allow public read access" ON experience FOR SELECT USING (is_visible = true);

-- ========================================
-- NOTES:
-- ========================================
-- 1. This template creates the database structure only
-- 2. Add your own data through the Admin Dashboard at /admin
-- 3. For admin write access, set up Supabase Auth and update RLS policies
-- 4. Never commit files with actual data or credentials to git
