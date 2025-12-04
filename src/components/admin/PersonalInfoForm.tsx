import { useState, useEffect } from 'react';
import { supabase, PersonalInfo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo | null;
  onSave: () => void;
}

export const PersonalInfoForm = ({ personalInfo, onSave }: PersonalInfoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_th: '',
    name_en: '',
    nickname: '',
    title_th: '',
    title_en: '',
    bio_th: '',
    bio_en: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    line_id: '',
    ielts_score: '',
    ielts_validity: '',
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (personalInfo) {
      setFormData({
        name_th: personalInfo.name_th,
        name_en: personalInfo.name_en,
        nickname: personalInfo.nickname || '',
        title_th: personalInfo.title_th,
        title_en: personalInfo.title_en,
        bio_th: personalInfo.bio_th || '',
        bio_en: personalInfo.bio_en || '',
        email: personalInfo.email,
        linkedin_url: personalInfo.linkedin_url || '',
        github_url: personalInfo.github_url || '',
        line_id: personalInfo.line_id || '',
        ielts_score: personalInfo.ielts_score || '',
        ielts_validity: personalInfo.ielts_validity || '',
        skills: personalInfo.skills || [],
      });
    }
  }, [personalInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        nickname: formData.nickname || null,
        bio_th: formData.bio_th || null,
        bio_en: formData.bio_en || null,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        line_id: formData.line_id || null,
        ielts_score: formData.ielts_score || null,
        ielts_validity: formData.ielts_validity || null,
      };

      if (personalInfo) {
        const { error } = await supabase
          .from('personal_info')
          .update(dataToSave)
          .eq('id', personalInfo.id);

        if (error) throw error;
        toast.success('อัพเดทข้อมูลส่วนตัวสำเร็จ');
      } else {
        const { error } = await supabase
          .from('personal_info')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('เพิ่มข้อมูลส่วนตัวสำเร็จ');
      }

      onSave();
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name_th">ชื่อ-นามสกุล (ไทย) *</Label>
          <Input
            id="name_th"
            value={formData.name_th}
            onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
            placeholder="ณฐกร พิกรมสุข"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name_en">ชื่อ-นามสกุล (อังกฤษ) *</Label>
          <Input
            id="name_en"
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            placeholder="Na-thakorn Pikromsuk"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nickname">ชื่อเล่น</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="N'Not"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">อีเมล *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@codex-th.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_th">ตำแหน่ง (ไทย) *</Label>
          <Input
            id="title_th"
            value={formData.title_th}
            onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
            placeholder="Full-Stack Developer"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title_en">ตำแหน่ง (อังกฤษ) *</Label>
          <Input
            id="title_en"
            value={formData.title_en}
            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            placeholder="Full-Stack Developer"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio_th">ประวัติย่อ (ไทย)</Label>
        <Textarea
          id="bio_th"
          value={formData.bio_th}
          onChange={(e) => setFormData({ ...formData, bio_th: e.target.value })}
          rows={3}
          placeholder="นักพัฒนาเว็บและแอปพลิเคชันมือถือ..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio_en">ประวัติย่อ (อังกฤษ)</Label>
        <Textarea
          id="bio_en"
          value={formData.bio_en}
          onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
          rows={3}
          placeholder="Expert Full Stack Developer..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            placeholder="https://github.com/..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line_id">LINE ID</Label>
          <Input
            id="line_id"
            value={formData.line_id}
            onChange={(e) => setFormData({ ...formData, line_id: e.target.value })}
            placeholder="nnot.dev"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ielts_score">คะแนน IELTS</Label>
          <Input
            id="ielts_score"
            value={formData.ielts_score}
            onChange={(e) => setFormData({ ...formData, ielts_score: e.target.value })}
            placeholder="Overall Band 5.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ielts_validity">ระยะเวลาที่ใช้ได้</Label>
          <Input
            id="ielts_validity"
            value={formData.ielts_validity}
            onChange={(e) => setFormData({ ...formData, ielts_validity: e.target.value })}
            placeholder="2024–2026"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>ทักษะ (Skills)</Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            placeholder="เพิ่มทักษะแล้วกด Enter"
          />
          <Button type="button" onClick={addSkill}>เพิ่ม</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          บันทึกข้อมูลส่วนตัว
        </Button>
      </div>
    </form>
  );
};
