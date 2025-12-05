import { useState, useEffect } from 'react';
import { supabase, Education } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface EducationFormProps {
  education: Education | null;
  onClose: () => void;
  onSave: () => void;
}

export const EducationForm = ({ education, onClose, onSave }: EducationFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    year: '',
    title_th: '',
    title_en: '',
    subtitle_th: '',
    subtitle_en: '',
    description_th: '',
    description_en: '',
    badge: '',
    order_index: 0,
    is_visible: true,
  });

  useEffect(() => {
    if (education) {
      setFormData({
        year: education.year,
        title_th: education.title_th,
        title_en: education.title_en,
        subtitle_th: education.subtitle_th,
        subtitle_en: education.subtitle_en,
        description_th: education.description_th || '',
        description_en: education.description_en || '',
        badge: education.badge || '',
        order_index: education.order_index,
        is_visible: education.is_visible,
      });
    }
  }, [education]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        badge: formData.badge || null,
      };

      if (education) {
        const { error } = await supabase
          .from('education')
          .update(dataToSave)
          .eq('id', education.id);

        if (error) throw error;
        toast.success('อัพเดทการศึกษาสำเร็จ');
      } else {
        const { error } = await supabase
          .from('education')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('เพิ่มการศึกษาสำเร็จ');
      }

      onSave();
    } catch (error) {
      console.error('Error saving education:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกการศึกษา');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle>{education ? 'แก้ไขการศึกษา' : 'เพิ่มการศึกษาใหม่'}</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลการศึกษา ทั้งภาษาไทยและภาษาอังกฤษ
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="year">ปี/ช่วงเวลา *</Label>
            <Input
              id="year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="2021–2024"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title_th">ชื่อปริญญา (ไทย) *</Label>
              <Input
                id="title_th"
                value={formData.title_th}
                onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
                placeholder="ปริญญาตรี วิทยาศาสตร์"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">ชื่อปริญญา (อังกฤษ) *</Label>
              <Input
                id="title_en"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Bachelor of Science"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle_th">สาขา/มหาวิทยาลัย (ไทย) *</Label>
            <Input
              id="subtitle_th"
              value={formData.subtitle_th}
              onChange={(e) => setFormData({ ...formData, subtitle_th: e.target.value })}
              placeholder="เทคโนโลยีสารสนเทศและการสื่อสาร, มหาวิทยาลัยสงขลานครินทร์"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle_en">สาขา/มหาวิทยาลัย (อังกฤษ) *</Label>
            <Input
              id="subtitle_en"
              value={formData.subtitle_en}
              onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
              placeholder="Information & Communication Technology, Prince of Songkla University"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_th">รายละเอียดเพิ่มเติม (ไทย)</Label>
            <Textarea
              id="description_th"
              value={formData.description_th}
              onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
              rows={3}
              placeholder="GPA > 3.00 | ทุน TKBS รุ่น 4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_en">รายละเอียดเพิ่มเติม (อังกฤษ)</Label>
            <Textarea
              id="description_en"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={3}
              placeholder="GPA > 3.00 | TKBS Scholar Cohort 4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge">Badge (ถ้ามี)</Label>
              <Input
                id="badge"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="In Progress, Graduated"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index">ลำดับการแสดง</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_visible"
              checked={formData.is_visible}
              onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
            />
            <Label htmlFor="is_visible">แสดงบนเว็บไซต์</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {education ? 'บันทึกการแก้ไข' : 'เพิ่มการศึกษา'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
