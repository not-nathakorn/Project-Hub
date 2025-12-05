import { useState, useEffect } from 'react';
import { supabase, MapSettings, MapUniversity } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Map, Save, Loader2, Edit, X, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const REGIONS = [
  { id: 'north', name: 'ภาคเหนือ', color: 'from-blue-500 to-cyan-500' },
  { id: 'northeast', name: 'ภาคอีสาน', color: 'from-orange-500 to-amber-500' },
  { id: 'central', name: 'ภาคกลาง', color: 'from-green-500 to-emerald-500' },
  { id: 'south', name: 'ภาคใต้', color: 'from-purple-500 to-pink-500' },
];

export const MapSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MapSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [enabledUniversities, setEnabledUniversities] = useState<string[]>([]);
  
  // University Data
  const [universities, setUniversities] = useState<MapUniversity[]>([]);
  const [editingUniversity, setEditingUniversity] = useState<MapUniversity | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchUniversities()]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createDefaultSettings();
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data);
        setIsVisible(data.is_visible);
        setEnabledUniversities(data.enabled_universities || []);
      }
    } catch (error: any) {
      console.error('Error fetching map settings:', error);
      toast.error('ไม่สามารถโหลดการตั้งค่าแผนที่ได้');
    }
  };

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('map_universities')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setUniversities(data || []);
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      toast.error('ไม่สามารถโหลดข้อมูลมหาวิทยาลัยได้');
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('map_settings')
        .insert({
          is_visible: true,
          enabled_universities: ['north', 'northeast', 'central', 'south'],
        })
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      setIsVisible(data.is_visible);
      setEnabledUniversities(data.enabled_universities);
    } catch (error: any) {
      console.error('Error creating default settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      console.log('Saving settings...', { isVisible, enabledUniversities });

      // Prepare data payload
      const payload = {
        is_visible: isVisible,
        enabled_universities: enabledUniversities,
        updated_at: new Date().toISOString()
      };

      let error;
      
      if (settings?.id) {
        // Update existing
        console.log('Updating existing settings ID:', settings.id);
        const result = await supabase
          .from('map_settings')
          .update(payload)
          .eq('id', settings.id)
          .select();
        error = result.error;
        console.log('Update result:', result);
      } else {
        // Insert new (should not happen often if fetch works, but good fallback)
        console.log('Inserting new settings row');
        const result = await supabase
          .from('map_settings')
          .insert([payload])
          .select();
        error = result.error;
        console.log('Insert result:', result);
      }

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      toast.success('บันทึกการตั้งค่าแผนที่สำเร็จ');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving map settings:', error);
      toast.error(`ไม่สามารถบันทึกการตั้งค่าได้: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUniversity) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('map_universities')
        .update({
          name_th: editingUniversity.name_th,
          name_en: editingUniversity.name_en,
          year: editingUniversity.year,
          degree_level: editingUniversity.degree_level,
          faculty: editingUniversity.faculty,
          major: editingUniversity.major,
          color: editingUniversity.color,
          logo_url: editingUniversity.logo_url,
          is_visible: editingUniversity.is_visible
        })
        .eq('id', editingUniversity.id);

      if (error) throw error;

      toast.success('อัพเดทข้อมูลมหาวิทยาลัยสำเร็จ');
      await fetchUniversities();
      setShowEditDialog(false);
      setEditingUniversity(null);
    } catch (error: any) {
      console.error('Error updating university:', error);
      toast.error('ไม่สามารถอัพเดทข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  const toggleUniversityEnabled = (region: string) => {
    setEnabledUniversities((prev) => {
      if (prev.includes(region)) {
        if (prev.length === 1) {
          toast.warning('ต้องเลือกแสดงอย่างน้อย 1 ภาค');
          return prev;
        }
        return prev.filter((id) => id !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="flex items-center gap-2 text-2xl gradient-text">
            <Map className="w-6 h-6 text-primary" />
            ตั้งค่าแผนที่หลัก
          </CardTitle>
          <CardDescription className="text-muted-foreground">ควบคุมการแสดงผลภาพรวมของแผนที่</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="space-y-1">
              <Label htmlFor="map-visible" className="text-lg font-medium text-foreground">
                แสดงแผนที่บนหน้าเว็บ
              </Label>
              <p className="text-sm text-muted-foreground">
                เปิด/ปิด Section แผนที่ทั้งหมด
              </p>
            </div>
            <Switch
              id="map-visible"
              checked={isVisible}
              onCheckedChange={setIsVisible}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-medium text-foreground">เลือกภาคที่ต้องการแสดง</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {REGIONS.map((region) => {
                const isSelected = enabledUniversities.includes(region.id);
                return (
                  <motion.div
                    key={region.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center space-x-3 p-4 border rounded-xl transition-all cursor-pointer overflow-hidden ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/5' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => toggleUniversityEnabled(region.id)}
                  >
                    {isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${region.color} opacity-10`} />
                    )}
                    <Checkbox
                      id={region.id}
                      checked={isSelected}
                      onCheckedChange={() => toggleUniversityEnabled(region.id)}
                      className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={region.id} className="cursor-pointer font-medium z-10">
                      {region.name}
                    </Label>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-primary absolute top-2 right-2 opacity-50" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button 
              onClick={handleSaveSettings} 
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              บันทึกการตั้งค่าหลัก
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* University Details */}
      <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-2xl gradient-text">ข้อมูลมหาวิทยาลัย</CardTitle>
          <CardDescription className="text-muted-foreground">จัดการข้อมูลรายละเอียดของแต่ละมหาวิทยาลัย</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {universities.map((uni, index) => (
              <motion.div 
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-all bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800/50"
                style={{ borderLeft: `4px solid ${uni.color}` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                      {uni.logo_url ? (
                        <img src={uni.logo_url} alt={uni.name_en} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No Logo</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-foreground">{uni.name_th}</h3>
                      <p className="text-sm text-muted-foreground">{uni.name_en}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingUniversity(uni);
                      setShowEditDialog(true);
                    }}
                    className="hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-muted-foreground">ระดับ:</span>
                    <span className="font-medium text-foreground">{uni.degree_level}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-muted-foreground">คณะ:</span>
                    <span className="font-medium text-right line-clamp-1 ml-4 text-foreground">{uni.faculty || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-muted-foreground">สาขา:</span>
                    <span className="font-medium text-right line-clamp-1 ml-4 text-foreground">{uni.major || '-'}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">ปีการศึกษา:</span>
                    <span className="font-medium text-foreground">{uni.year}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <Badge 
                    variant={uni.is_visible ? "default" : "secondary"}
                    className={uni.is_visible ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 border-0"}
                  >
                    {uni.is_visible ? 'แสดงผล' : 'ซ่อน'}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-muted-foreground">
                    {uni.region_th}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">แก้ไขข้อมูลมหาวิทยาลัย</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ปรับปรุงข้อมูลรายละเอียดสำหรับ {editingUniversity?.name_th}
            </DialogDescription>
          </DialogHeader>
          
          {editingUniversity && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <form id="edit-uni-form" onSubmit={handleUpdateUniversity} className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ชื่อภาษาไทย</Label>
                    <Input 
                      value={editingUniversity.name_th} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, name_th: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ชื่อภาษาอังกฤษ</Label>
                    <Input 
                      value={editingUniversity.name_en} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, name_en: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ระดับการศึกษา</Label>
                    <Input 
                      value={editingUniversity.degree_level} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, degree_level: e.target.value})}
                      placeholder="เช่น ปริญญาตรี (B.Sc.)"
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ปีการศึกษา</Label>
                    <Input 
                      value={editingUniversity.year} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, year: e.target.value})}
                      placeholder="เช่น 2021 - 2024"
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>คณะ</Label>
                  <Input 
                    value={editingUniversity.faculty || ''} 
                    onChange={(e) => setEditingUniversity({...editingUniversity, faculty: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>สาขาวิชา</Label>
                  <Input 
                    value={editingUniversity.major || ''} 
                    onChange={(e) => setEditingUniversity({...editingUniversity, major: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>สีประจำมหาวิทยาลัย (Hex)</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={editingUniversity.color} 
                        onChange={(e) => setEditingUniversity({...editingUniversity, color: e.target.value})}
                        className="w-12 h-10 p-1 cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      />
                      <Input 
                        value={editingUniversity.color} 
                        onChange={(e) => setEditingUniversity({...editingUniversity, color: e.target.value})}
                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>URL โลโก้</Label>
                    <Input 
                      value={editingUniversity.logo_url || ''} 
                      onChange={(e) => setEditingUniversity({...editingUniversity, logo_url: e.target.value})}
                      className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Switch
                    id="uni-visible"
                    checked={editingUniversity.is_visible}
                    onCheckedChange={(checked) => setEditingUniversity({...editingUniversity, is_visible: checked})}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="uni-visible" className="cursor-pointer">แสดงผลข้อมูลนี้บนแผนที่</Label>
                </div>
              </form>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">ยกเลิก</Button>
            <Button type="submit" form="edit-uni-form" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
