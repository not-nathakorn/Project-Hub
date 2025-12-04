import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Project {
  id: string;
  title: string;
  description_th: string;
  description_en: string;
  url: string;
  icon: string;
  tags: string[];
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: string;
  year: string;
  title_th: string;
  title_en: string;
  subtitle_th: string;
  subtitle_en: string;
  description_th: string;
  description_en: string;
  badge?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  year: string;
  title_th: string;
  title_en: string;
  subtitle_th: string;
  subtitle_en: string;
  description_th: string;
  description_en: string;
  badge?: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  id: string;
  name_th: string;
  name_en: string;
  nickname: string;
  title_th: string;
  title_en: string;
  bio_th: string;
  bio_en: string;
  email: string;
  linkedin_url?: string;
  github_url?: string;
  line_id?: string;
  ielts_score?: string;
  ielts_validity?: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name_th: string;
  name_en: string;
  abbreviation: string;
  logo_url?: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}
