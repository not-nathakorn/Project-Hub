import { useState, useEffect } from 'react';
import { supabase, MapSettings } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Map, Save, Loader2 } from 'lucide-react';

const UNIVERSITIES = [
  { id: 'north', name: 'ภาคเหนือ (CMU)', nameEn: 'North (CMU)' },
  { id: 'northeast', name: 'ภาคอีสาน (KKU)', nameEn: 'Northeast (KKU)' },
  { id: 'central', name: 'ภาคกลาง (RU)', nameEn: 'Central (RU)' },
  { id: 'south', name: 'ภาคใต้ (PSU)', nameEn: 'South (PSU)' },
];

export const MapSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MapSettings | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [enabledUniversities, setEnabledUniversities] = useState<string[]>([
    'north',
    'northeast',
    'central',
    'south',
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .single();

      if (error) {
        // If no settings exist, create default
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
    } finally {
      setLoading(false);
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
      toast.success('สร้างการตั้งค่าเริ่มต้นสำเร็จ');
    } catch (error: any) {
      console.error('Error creating default settings:', error);
      toast.error('ไม่สามารถสร้างการตั้งค่าเริ่มต้นได้');
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('map_settings')
        .update({
          is_visible: isVisible,
          enabled_universities: enabledUniversities,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('บันทึกการตั้งค่าสำเร็จ');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving map settings:', error);
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setSaving(false);
    }
  };

  const toggleUniversity = (universityId: string) => {
    setEnabledUniversities((prev) => {
      if (prev.includes(universityId)) {
        // Don't allow removing all universities
        if (prev.length === 1) {
          toast.warning('ต้องเลือกมหาวิทยาลัยอย่างน้อย 1 แห่ง');
          return prev;
        }
        return prev.filter((id) => id !== universityId);
      } else {
        return [...prev, universityId];
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            จัดการแผนที่การศึกษา
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5" />
          จัดการแผนที่การศึกษา
        </CardTitle>
        <CardDescription>
          ตั้งค่าการแสดงผลแผนที่และเลือกมหาวิทยาลัยที่ต้องการแสดง
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map Visibility Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="map-visible" className="text-base font-medium">
              แสดงแผนที่การศึกษา
            </Label>
            <p className="text-sm text-muted-foreground">
              เปิด/ปิดการแสดงแผนที่บนหน้าเว็บ
            </p>
          </div>
          <Switch
            id="map-visible"
            checked={isVisible}
            onCheckedChange={setIsVisible}
          />
        </div>

        {/* University Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">เลือกมหาวิทยาลัยที่ต้องการแสดง</Label>
            <p className="text-sm text-muted-foreground mt-1">
              เลือกอย่างน้อย 1 มหาวิทยาลัย
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UNIVERSITIES.map((university) => (
              <div
                key={university.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Checkbox
                  id={university.id}
                  checked={enabledUniversities.includes(university.id)}
                  onCheckedChange={() => toggleUniversity(university.id)}
                />
                <Label
                  htmlFor={university.id}
                  className="flex-1 cursor-pointer font-normal"
                >
                  <div className="font-medium">{university.name}</div>
                  <div className="text-sm text-muted-foreground">{university.nameEn}</div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>

        {/* Preview Info */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">สถานะปัจจุบัน:</p>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• แผนที่: {isVisible ? 'แสดง' : 'ซ่อน'}</li>
            <li>
              • มหาวิทยาลัยที่เลือก: {enabledUniversities.length} แห่ง (
              {UNIVERSITIES.filter((u) => enabledUniversities.includes(u.id))
                .map((u) => u.nameEn)
                .join(', ')}
              )
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
