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
  images?: string[];
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

export interface MapSettings {
  id: string;
  is_visible: boolean;
  enabled_universities: string[]; // ['north', 'northeast', 'central', 'south']
  created_at: string;
  updated_at: string;
}

export interface MapUniversity {
  id: string;
  region: string; // 'north', 'northeast', 'central', 'south'
  name_th: string;
  name_en: string;
  region_th: string;
  year: string;
  degree_level: string;
  faculty?: string;
  major?: string;
  logo_url?: string;
  color: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  contact_email: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_title: string;
  maintenance_detail: string;
  maintenance_duration: string;
  google_analytics_id: string;
  available_for_work: boolean;
  social_linkedin?: string;
  social_line?: string;
  hero_image_url?: string;
  created_at: string;
  updated_at: string;
}
