import { MAITENANCE_PRESETS, getMaintenanceTranslation } from '@/constants/maintenancePresets';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { clearOldLoginActivity, clearOldSessions } from '@/lib/securityLogger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Loader2, 
  Save, 
  Palette, 
  Globe, 
  User, 
  Shield, 
  Settings2, 
  Database,
  Moon,
  Sun,
  Languages,
  Key,
  LogOut,
  History,
  Mail,
  Building,
  AlertTriangle,
  Download,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Smartphone
} from 'lucide-react';
import { SEOSettingsManager } from './SEOSettingsManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SiteSettings {
  id?: string;
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
}

interface AdminProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
}

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  created_at: string;
  is_current: boolean;
}

interface LoginHistory {
  id: string;
  email: string;
  status: 'success' | 'failed';
  ip_address: string;
  device: string;
  created_at: string;
}

const settingsTabs = [
  { id: 'appearance', label: 'รูปลักษณ์', labelEn: 'Appearance', icon: Palette },
  { id: 'seo', label: 'SEO', labelEn: 'SEO', icon: Globe },
  { id: 'profile', label: 'โปรไฟล์', labelEn: 'Profile', icon: User },
  { id: 'security', label: 'ความปลอดภัย', labelEn: 'Security', icon: Shield },
  { id: 'site', label: 'ตั้งค่าเว็บ', labelEn: 'Site', icon: Settings2 },
  { id: 'backup', label: 'สำรองข้อมูล', labelEn: 'Backup', icon: Database },
];

export const SettingsManager = () => {
  // const { language, setLanguage } = useLanguage();
  const language = 'th';
  const setLanguage = (lang: 'th' | 'en') => console.log('Set language:', lang);
  const { refreshAuth } = useAuth();
  const [presetLang, setPresetLang] = useState<'th' | 'en'>('th');
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Appearance states
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [accentColor, setAccentColor] = useState('#3B82F6');
  
  // Profile states
  const [profile, setProfile] = useState<AdminProfile>({
    id: '',
    email: '',
    display_name: 'Admin User',
    avatar_url: '',
    created_at: new Date().toISOString(),
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Site settings states
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    site_name: 'CodeX',
    site_tagline: 'Developer Portfolio',
    contact_email: '',
    maintenance_mode: false,
    maintenance_message: 'เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
    maintenance_title: 'Under Maintenance',
    maintenance_detail: 'ขออภัยในความไม่สะดวก เรากำลังพัฒนาระบบเพื่อให้ดียิ่งขึ้น กรุณากลับมาใหม่ในภายหลัง',
    maintenance_duration: 'A few hours',
    google_analytics_id: '',
    available_for_work: true,
    social_linkedin: '',
    social_line: '',
    hero_image_url: '/Dev.png',
  });
  
  // Security states
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  
  // Export states
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load admin profile from personal_info table (not Supabase Auth)
      const { data: personalInfo, error: personalInfoError } = await supabase
        .from('personal_info')
        .select('id, display_name, updated_at')
        .limit(1)
        .maybeSingle();
      
      if (personalInfoError) {
        console.warn('Could not load personal_info:', personalInfoError.message);
      }
      
      // Get user info from AuthContext cache
      const cachedUser = localStorage.getItem('bb_user_cache');
      let userEmail = 'admin@codex.th';
      let userId = '';
      let createdAt = new Date().toISOString();
      
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          userEmail = parsed.email || userEmail;
          userId = parsed.id || '';
          createdAt = parsed.cached_at ? new Date(parsed.cached_at).toISOString() : createdAt;
        } catch (e) {
          console.warn('Could not parse cached user');
        }
      }
      
      setProfile({
        id: personalInfo?.id || userId,
        email: userEmail,
        display_name: personalInfo?.display_name || 'Admin User',
        avatar_url: '', // Not implemented yet
        created_at: createdAt,
      });

      // Load site settings
      const { data: siteData } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (siteData) {
        setSiteSettings(siteData);
      }

      // Load active sessions from database
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('active_sessions')
        .select('*')
        .order('last_active', { ascending: false })
        .limit(10);
      
      if (sessionsError) {
        console.warn('Could not load sessions:', sessionsError.message);
      } else if (sessionsData) {
        setSessions(sessionsData.map(s => ({
          id: s.id,
          device: s.device || 'Unknown',
          browser: s.browser || 'Unknown',
          ip_address: s.ip_address || 'Unknown',
          location: s.location || 'Unknown',
          created_at: s.created_at,
          is_current: s.is_current || false,
        })));
      }

      // Load login history from database
      const { data: historyData, error: historyError } = await supabase
        .from('login_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (historyError) {
        console.warn('Could not load login history:', historyError.message);
      } else if (historyData) {
        setLoginHistory(historyData.map(h => ({
          id: h.id,
          email: h.email || 'Unknown',
          status: (h.status === 'success' ? 'success' : 'failed') as 'success' | 'failed',
          ip_address: h.ip_address || 'Unknown',
          device: `${h.device || 'Unknown'} - ${h.browser || 'Unknown'}`,
          created_at: h.created_at,
        })));
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Appearance handlers
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast.success(newMode ? 'เปิดใช้งาน Dark Mode' : 'ปิดใช้งาน Dark Mode');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as 'th' | 'en');
    localStorage.setItem('language', lang);
    toast.success(`เปลี่ยนภาษาเป็น ${lang === 'th' ? 'ภาษาไทย' : 'English'}`);
  };

  // Profile handlers - Save to personal_info table using RPC (bypasses RLS)
  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('update_personal_info', {
        p_display_name: profile.display_name
      });

      if (error) throw error;
      
      console.log('Profile updated:', data);
      
      // Dispatch event to notify other components (like Sidebar) to refresh
      window.dispatchEvent(new CustomEvent('displayNameUpdated', { 
        detail: { displayName: profile.display_name } 
      }));
      
      toast.success('อัปเดตโปรไฟล์สำเร็จ!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์: ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setSaving(false);
    }
  };

  // Site settings handlers
  const handleSiteSettingsSave = async () => {
    setSaving(true);
    try {
      let settingId = siteSettings.id;
      
      // Strict ID check: If we don't have an ID in state, fetch the latest one
      if (!settingId) {
         const { data: existing } = await supabase
           .from('site_settings')
           .select('id')
           .order('updated_at', { ascending: false })
           .limit(1)
           .maybeSingle();
           
         if (existing) {
           settingId = existing.id;
         } else {
           // Only generate new ID if absolutely no record exists
           settingId = crypto.randomUUID();
         }
      }

      // Use RPC for secure update avoiding RLS issues
      const { data: savedData, error: upsertError } = await supabase
        .rpc('update_site_settings', {
          p_id: settingId,
          p_maintenance_mode: siteSettings.maintenance_mode,
          p_maintenance_message: siteSettings.maintenance_message,
          p_maintenance_title: siteSettings.maintenance_title,
          p_maintenance_detail: siteSettings.maintenance_detail,
          p_maintenance_duration: siteSettings.maintenance_duration,
          p_site_name: siteSettings.site_name,
          p_site_tagline: siteSettings.site_tagline,
          p_contact_email: siteSettings.contact_email,
          p_google_analytics_id: siteSettings.google_analytics_id,
          p_available_for_work: siteSettings.available_for_work,
          p_social_linkedin: siteSettings.social_linkedin,
          p_social_line: siteSettings.social_line,
          p_hero_image_url: siteSettings.hero_image_url
        });

      console.log('RPC Result Data:', savedData);
      console.log('RPC Error:', upsertError);

      if (upsertError) throw upsertError;
      
      if (!savedData) {
        throw new Error('No data returned from save operation');
      }

      toast.success('บันทึกการตั้งค่าเว็บไซต์สำเร็จ!');
      
      // Update local state with the returned data (savedData is alrady the object)
      // Note: RPC returns the JSONB object directly
      setSiteSettings(savedData as unknown as SiteSettings);

    } catch (err) {
      console.error('Error saving site settings:', err);
      toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Security handlers
  const handleLogoutAllSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('ออกจากระบบทุกอุปกรณ์สำเร็จ');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  // Export handlers
  const handleExportData = async (format: 'json' | 'csv') => {
    setExporting(true);
    try {
      // Fetch all data
      const [projectsRes, educationRes, experienceRes, personalInfoRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('education').select('*'),
        supabase.from('experience').select('*'),
        supabase.from('personal_info').select('*'),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        projects: projectsRes.data || [],
        education: educationRes.data || [],
        experience: experienceRes.data || [],
        personalInfo: personalInfoRes.data || [],
      };

      let blob: Blob;
      let filename: string;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `codex-backup-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // Simple CSV export for projects
        const csvRows = ['title,description_th,url,tags'];
        exportData.projects.forEach((p: { title: string; description_th: string; url: string; tags: string[] }) => {
          csvRows.push(`"${p.title}","${p.description_th}","${p.url}","${p.tags?.join(', ')}"`);
        });
        blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        filename = `codex-projects-${new Date().toISOString().split('T')[0]}.csv`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`ส่งออกข้อมูลเป็น ${format.toUpperCase()} สำเร็จ!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setExporting(false);
    }
  };

  const accentColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Cyan', value: '#06B6D4' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Navigation */}
      <div className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Horizontal scroll tabs */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <TabsList className="w-full h-auto p-1.5 bg-transparent flex justify-start flex-nowrap overflow-x-auto gap-1 scrollbar-hide">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 
                      data-[state=active]:text-white data-[state=active]:shadow-lg
                      data-[state=inactive]:text-slate-600 data-[state=inactive]:dark:text-slate-400
                      data-[state=inactive]:hover:bg-slate-100 data-[state=inactive]:dark:hover:bg-white/5"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.labelEn}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <div className="min-h-[400px]">
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <TabsContent value="appearance" key="appearance" className="mt-0">
                <div className="animate-fade-in">
                  <Card className="border-slate-200 dark:border-white/10 bg-white dark:bg-black/20">
                    <CardHeader className="pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">รูปลักษณ์</CardTitle>
                          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">ปรับแต่งการแสดงผลของเว็บไซต์</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Theme Mode */}
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800 dark:text-slate-200">ธีม</Label>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-indigo-900/40' : 'bg-amber-100'}`}>
                              {isDarkMode ? (
                                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              ) : (
                                <Sun className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{isDarkMode ? 'ธีมมืดสบายตา' : 'ธีมสว่างชัดเจน'}</p>
                            </div>
                          </div>
                          <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800 dark:text-slate-200">สีหลักของเว็บไซต์</Label>
                        <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                          <div className="flex flex-wrap gap-3">
                            {accentColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => {
                                  setAccentColor(color.value);
                                  toast.success(`เปลี่ยนสีหลักเป็น ${color.name}`);
                                }}
                                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                                  accentColor === color.value
                                    ? 'bg-white dark:bg-white/10 shadow-md ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500'
                                    : 'hover:bg-white dark:hover:bg-white/5'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full shadow-inner transition-transform group-hover:scale-110 ${
                                    accentColor === color.value ? 'ring-2 ring-offset-2' : ''
                                  }`}
                                  style={{ 
                                    backgroundColor: color.value,
                                    '--tw-ring-color': color.value
                                  } as React.CSSProperties}
                                />
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                  {color.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hero Image */}
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800 dark:text-slate-200">รูปภาพหน้าปก (Hero Image)</Label>
                        <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 space-y-3">
                          <div className="flex gap-4 items-center">
                             <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-600">
                                <img src={siteSettings.hero_image_url || '/Dev.png'} alt="Preview" className="w-full h-full object-contain object-bottom" onError={(e) => (e.currentTarget.src = '/Dev.png')} />
                             </div>
                             <div className="flex-1 space-y-2">
                                <Input 
                                  value={siteSettings.hero_image_url || ''}
                                  onChange={(e) => setSiteSettings({ ...siteSettings, hero_image_url: e.target.value })}
                                  placeholder="/Dev.png"
                                  className="bg-white dark:bg-black/20 text-slate-900 dark:text-slate-100"
                                />
                                <p className="text-xs text-slate-500">ใส่ URL ของรูปภาพ หรือ path เช่น /Dev.png</p>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Language */}
                      <div className="space-y-3">
                        <Label className="text-base font-bold text-slate-800 dark:text-slate-200">ภาษา</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleLanguageChange('th')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                              language === 'th'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span className="text-2xl">🇹🇭</span>
                            <div className="text-left">
                              <p className="font-bold text-slate-800 dark:text-slate-200">ภาษาไทย</p>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Thai</p>
                            </div>
                            {language === 'th' && (
                              <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />
                            )}
                          </button>
                          <button
                            onClick={() => handleLanguageChange('en')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                              language === 'en'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span className="text-2xl">🇺🇸</span>
                            <div className="text-left">
                              <p className="font-bold text-slate-800 dark:text-slate-200">English</p>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">English</p>
                            </div>
                            {language === 'en' && (
                              <CheckCircle2 className="w-5 h-5 text-blue-500 ml-auto" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                          onClick={() => toast.success('บันทึกการตั้งค่าสำเร็จ!')}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          บันทึกการตั้งค่า
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TabsContent>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <TabsContent value="seo" key="seo" className="mt-0">
                <div className="animate-fade-in">
                  <SEOSettingsManager />
                </div>
                </TabsContent>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <TabsContent value="profile" key="profile" className="mt-0 space-y-6">
                <div className="animate-fade-in space-y-6">
                  {/* Profile Info Card */}
                  <Card className="border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">ข้อมูลส่วนตัว</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">จัดการข้อมูลโปรไฟล์ของคุณ</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-6 p-4 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                          {profile.display_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">{profile.display_name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{profile.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              สมาชิกตั้งแต่: {new Date(profile.created_at).toLocaleDateString('th-TH')}
                            </p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="display_name" className="text-slate-700 dark:text-slate-300">Display Name</Label>
                          <Input
                            id="display_name"
                            value={profile.display_name || ''}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            className="bg-white dark:bg-black/20 dark:border-white/10 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email || ''}
                            disabled
                            className="bg-slate-100 dark:bg-white/5 dark:border-white/10 cursor-not-allowed text-slate-900 dark:text-slate-100"
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">Email ไม่สามารถเปลี่ยนได้</p>
                        </div>
                      </div>

                      <Button 
                        onClick={handleProfileUpdate} 
                        disabled={saving}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        บันทึกข้อมูล
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Change Password Card - Hidden: Uses BlackBox Auth, not Supabase Auth
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    ... Password change UI hidden ...
                  </Card>
                  */}
                </div>
                </TabsContent>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <TabsContent value="security" key="security" className="mt-0 space-y-6">
                <div className="animate-fade-in space-y-6">
                  {/* Active Sessions Card */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                            <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">อุปกรณ์ที่เข้าสู่ระบบ</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">จัดการ sessions ที่กำลังใช้งาน</CardDescription>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                              <LogOut className="w-4 h-4 mr-2" />
                              ออกจากระบบทุกอุปกรณ์
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการออกจากระบบทุกอุปกรณ์?</AlertDialogTitle>
                              <AlertDialogDescription>
                                การดำเนินการนี้จะทำให้คุณต้องเข้าสู่ระบบใหม่ในทุกอุปกรณ์
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={handleLogoutAllSessions} className="bg-red-600 hover:bg-red-700">
                                ออกจากระบบทั้งหมด
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-3"
                          >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                              {session.device === 'Desktop' ? (
                                <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 flex-shrink-0" />
                              ) : (
                                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base">{session.browser} - {session.device}</p>
                                    {session.is_current && (
                                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full whitespace-nowrap">
                                        ปัจจุบัน
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                    {session.location} • {session.ip_address}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    {new Date(session.created_at).toLocaleString('th-TH')}
                                  </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Login History Card */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
                            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-slate-900 dark:text-slate-100">ประวัติการเข้าสู่ระบบ</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">รายการเข้าสู่ระบบล่าสุด ({loginHistory.length} รายการ)</CardDescription>
                          </div>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              ล้างข้อมูลเก่า
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ล้างประวัติการเข้าสู่ระบบเก่า?</AlertDialogTitle>
                              <AlertDialogDescription>
                                ลบประวัติที่เก่ากว่า 30 วัน และ sessions ที่ไม่ active เกิน 7 วัน เพื่อประหยัดพื้นที่ฐานข้อมูล
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={async () => {
                                  const activityDeleted = await clearOldLoginActivity(30);
                                  const sessionsDeleted = await clearOldSessions(7);
                                  toast.success(`ลบประวัติ ${activityDeleted} รายการ และ sessions ${sessionsDeleted} รายการ`);
                                  // Reload settings to refresh the lists
                                  loadSettings();
                                }} 
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                ล้างข้อมูลเก่า
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {loginHistory.map((history) => (
                          <div
                            key={history.id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 gap-2"
                          >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                              {history.status === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                              ) : (
                                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{history.device}</p>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{history.ip_address}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end sm:flex-col gap-2 pl-8 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                              <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${
                                history.status === 'success'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              }`}>
                                {history.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                              </span>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(history.created_at).toLocaleString('th-TH')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TabsContent>
              )}

              {/* Site Settings Tab */}
              {activeTab === 'site' && (
                <TabsContent value="site" key="site" className="mt-0 space-y-6">
                <div className="animate-fade-in space-y-6">
                  {/* General Site Settings */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                          <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">ข้อมูลเว็บไซต์</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">ตั้งค่าข้อมูลพื้นฐานของเว็บไซต์</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="site_name" className="text-slate-700 dark:text-slate-300">ชื่อเว็บไซต์</Label>
                          <Input
                            id="site_name"
                            value={siteSettings.site_name || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="site_tagline" className="text-slate-700 dark:text-slate-300">Tagline</Label>
                          <Input
                            id="site_tagline"
                            value={siteSettings.site_tagline || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, site_tagline: e.target.value })}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${siteSettings.available_for_work ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-800'}`}>
                            {siteSettings.available_for_work ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">Available for Work</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">แสดงสถานะว่าคุณพร้อมรับงานหรือไม่</p>
                          </div>
                        </div>
                        <Switch 
                          checked={siteSettings.available_for_work} 
                          onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, available_for_work: checked })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email" className="text-slate-700 dark:text-slate-300">Contact Email</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={siteSettings.contact_email || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                         <div className="space-y-2">
                          <Label htmlFor="social_line" className="text-slate-700 dark:text-slate-300">Line URL</Label>
                          <Input
                            id="social_line"
                            value={siteSettings.social_line || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, social_line: e.target.value })}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            placeholder="https://line.me/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="social_linkedin" className="text-slate-700 dark:text-slate-300">LinkedIn URL</Label>
                          <Input
                            id="social_linkedin"
                            value={siteSettings.social_linkedin || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, social_linkedin: e.target.value })}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            placeholder="https://linkedin.com/..."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics Settings */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                          <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Google Analytics</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">เชื่อมต่อกับ Google Analytics</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ga_id" className="text-slate-700 dark:text-slate-300">Measurement ID</Label>
                        <Input
                          id="ga_id"
                          value={siteSettings.google_analytics_id || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, google_analytics_id: e.target.value })}
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                          placeholder="G-XXXXXXXXXX"
                        />
                        <p className="text-xs text-muted-foreground">
                          ใส่ Measurement ID จาก Google Analytics 4
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Maintenance Mode */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${
                          siteSettings.maintenance_mode
                            ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30'
                            : 'bg-gradient-to-br from-slate-500/20 to-slate-500/20 border-slate-500/30'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            siteSettings.maintenance_mode ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">Maintenance Mode</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">ปิดเว็บไซต์ชั่วคราวเพื่อปรับปรุง</CardDescription>
                        </div>
                        <Switch
                          checked={siteSettings.maintenance_mode}
                          onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, maintenance_mode: checked })}
                        />
                      </div>
                    </CardHeader>
                    {siteSettings.maintenance_mode && (
                      <CardContent className="space-y-4">
                        <div className="flex justify-end space-x-2 mb-4">
                          <span className="text-sm text-slate-500 flex items-center">Preset Language:</span>
                          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button
                              onClick={() => setPresetLang('th')}
                              className={`px-3 py-1 text-xs rounded-md transition-all ${presetLang === 'th' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                              ไทย
                            </button>
                            <button
                              onClick={() => setPresetLang('en')}
                              className={`px-3 py-1 text-xs rounded-md transition-all ${presetLang === 'en' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                              English
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="maintenance_title" className="text-slate-700 dark:text-slate-300">Title</Label>
                          <Input
                            id="maintenance_title"
                            value={siteSettings.maintenance_title || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, maintenance_title: e.target.value })}
                            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            placeholder="Under Maintenance"
                          />
                          <div className="flex flex-wrap gap-2">
                            {MAITENANCE_PRESETS.titles.map((item) => (
                              <button
                                key={item.en}
                                onClick={() => setSiteSettings({ ...siteSettings, maintenance_title: presetLang === 'en' ? item.en : item.th })}
                                className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                              >
                              {presetLang === 'en' ? item.en : item.th}
                                </button>
                              ))}
                            </div>
                          </div>
  
                          <div className="space-y-4">
                            <Label htmlFor="maintenance_message" className="text-slate-700 dark:text-slate-300">Message</Label>
                            <Input
                              id="maintenance_message"
                              value={siteSettings.maintenance_message || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, maintenance_message: e.target.value })}
                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              placeholder="Website is under maintenance..."
                            />
                            <div className="flex flex-wrap gap-2">
                              {MAITENANCE_PRESETS.messages.map((item) => (
                                <button
                                  key={item.en}
                                  onClick={() => setSiteSettings({ ...siteSettings, maintenance_message: presetLang === 'en' ? item.en : item.th })}
                                  className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                >
                                  {presetLang === 'en' ? item.en : item.th}
                                </button>
                              ))}
                            </div>
                          </div>
  
                          <div className="space-y-4">
                            <Label htmlFor="maintenance_detail" className="text-slate-700 dark:text-slate-300">Detail</Label>
                            <Input
                              id="maintenance_detail"
                              value={siteSettings.maintenance_detail || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, maintenance_detail: e.target.value })}
                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              placeholder="We apologize for the inconvenience..."
                            />
                             <div className="flex flex-wrap gap-2">
                              {MAITENANCE_PRESETS.details.map((item) => (
                                <button
                                  key={item.en}
                                  onClick={() => setSiteSettings({ ...siteSettings, maintenance_detail: presetLang === 'en' ? item.en : item.th })}
                                  className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                >
                                  {presetLang === 'en' ? item.en : item.th}
                                </button>
                              ))}
                            </div>
                          </div>
  
                          <div className="space-y-4">
                            <Label htmlFor="maintenance_duration" className="text-slate-700 dark:text-slate-300">Estimated Duration</Label>
                            <Input
                              id="maintenance_duration"
                              value={siteSettings.maintenance_duration || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, maintenance_duration: e.target.value })}
                              className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              placeholder="A few hours"
                            />
                            <div className="flex flex-wrap gap-2">
                              {MAITENANCE_PRESETS.durations.map((item) => (
                                <button
                                  key={item.en}
                                  onClick={() => setSiteSettings({ ...siteSettings, maintenance_duration: presetLang === 'en' ? item.en : item.th })}
                                  className="px-3 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                                >
                                  {presetLang === 'en' ? item.en : item.th}
                              </button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSiteSettingsSave} 
                      disabled={saving}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      บันทึกการตั้งค่า
                    </Button>
                  </div>
                </div>
                </TabsContent>
              )}

              {/* Backup Tab */}
              {activeTab === 'backup' && (
                <TabsContent value="backup" key="backup" className="mt-0 space-y-6">
                <div className="animate-fade-in space-y-6">
                  {/* Export Data Card */}
                  <Card className="border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
                          <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">ส่งออกข้อมูล</CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">ดาวน์โหลดข้อมูลทั้งหมดในรูปแบบที่ต้องการ</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <button
                          onClick={() => handleExportData('json')}
                          disabled={exporting}
                          className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group"
                        >
                          <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">📦</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">Export as JSON</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">ดาวน์โหลดข้อมูลครบถ้วนในรูปแบบ JSON</p>
                        </button>
                        <button
                          onClick={() => handleExportData('csv')}
                          disabled={exporting}
                          className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all text-left group"
                        >
                          <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-2xl">📊</span>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">Export as CSV</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">ดาวน์โหลดโปรเจกต์ในรูปแบบ CSV</p>
                        </button>
                      </div>
                      {exporting && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          กำลังส่งออกข้อมูล...
                        </div>
                      )}
                    </CardContent>
                  </Card>


                </div>
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
