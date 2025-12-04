import { useState, useEffect } from 'react';
import { supabase, Project, Education, Experience, PersonalInfo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, CheckCircle2, XCircle, Globe, EyeOffIcon } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { EducationForm } from '@/components/admin/EducationForm';
import { ExperienceForm } from '@/components/admin/ExperienceForm';
import { PersonalInfoForm } from '@/components/admin/PersonalInfoForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ContentManager = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string }>({
    open: false,
    type: '',
    id: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProjects(),
        fetchEducation(),
        fetchExperience(),
        fetchPersonalInfo(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    setProjects(data || []);
  };

  const fetchEducation = async () => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    setEducation(data || []);
  };

  const fetchExperience = async () => {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    setExperience(data || []);
  };

  const fetchPersonalInfo = async () => {
    const { data, error } = await supabase
      .from('personal_info')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    setPersonalInfo(data || null);
  };

  const toggleVisibility = async (type: 'projects' | 'education' | 'experience', id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from(type)
        .update({ is_visible: !currentVisibility })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentVisibility ? '✅ ซ่อนรายการแล้ว - ไม่แสดงบนเว็บ' : '🌐 แสดงรายการแล้ว - แสดงบนเว็บ');
      
      if (type === 'projects') fetchProjects();
      else if (type === 'education') fetchEducation();
      else fetchExperience();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแสดง');
    }
  };

  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('ลบรายการสำเร็จ');
      
      if (type === 'projects') fetchProjects();
      else if (type === 'education') fetchEducation();
      else fetchExperience();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('เกิดข้อผิดพลาดในการลบรายการ');
    } finally {
      setDeleteDialog({ open: false, type: '', id: '' });
    }
  };

  const visibleCount = (items: Array<{ is_visible: boolean }>) => 
    items.filter(item => item.is_visible).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">แสดงบนเว็บ</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {visibleCount(projects) + visibleCount(education) + visibleCount(experience)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
            <Globe className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">ซ่อนอยู่</p>
            <p className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 mt-1">
              {projects.length + education.length + experience.length - 
               (visibleCount(projects) + visibleCount(education) + visibleCount(experience))}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <EyeOffIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="bg-white/40 dark:bg-black/40 backdrop-blur-md p-1 rounded-xl w-full flex overflow-x-auto border border-white/20 dark:border-white/10">
          <TabsTrigger value="projects" className="flex-1 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 rounded-lg">
            Projects 
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex bg-primary/10 text-primary border-primary/20">{visibleCount(projects)}/{projects.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex-1 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 rounded-lg">
            Education
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex bg-primary/10 text-primary border-primary/20">{visibleCount(education)}/{education.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex-1 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 rounded-lg">
            Experience
            <Badge variant="secondary" className="ml-2 hidden md:inline-flex bg-primary/10 text-primary border-primary/20">{visibleCount(experience)}/{experience.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex-1 data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 rounded-lg">
            Personal Info
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold gradient-text">Projects Management</h2>
            <Button onClick={() => setShowProjectForm(true)} className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                  project.is_visible 
                    ? 'bg-white/60 dark:bg-black/40 border-green-500/30 shadow-lg shadow-green-500/5' 
                    : 'bg-white/40 dark:bg-black/20 border-white/10 opacity-75 grayscale'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center text-2xl shadow-inner border border-white/10">
                    {project.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{project.title}</h3>
                      {project.is_visible && (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] px-2 py-0.5 h-5 shadow-none">
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description_th}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('projects', project.id, project.is_visible)}
                    className={`hover:bg-white/20 ${project.is_visible ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingProject(project);
                      setShowProjectForm(true);
                    }}
                    className="hover:bg-blue-500/10 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'projects', id: project.id })}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold gradient-text">Education History</h2>
            <Button onClick={() => setShowEducationForm(true)} className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>
          <div className="grid gap-4">
            {education.map((edu, index) => (
              <div
                key={edu.id}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                  edu.is_visible 
                    ? 'bg-white/60 dark:bg-black/40 border-blue-500/30 shadow-lg shadow-blue-500/5' 
                    : 'bg-white/40 dark:bg-black/20 border-white/10 opacity-75 grayscale'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{edu.title_th}</h3>
                      <Badge variant="outline" className="text-xs border-white/20 bg-white/5">{edu.year}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{edu.subtitle_th}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('education', edu.id, edu.is_visible)}
                    className={`hover:bg-white/20 ${edu.is_visible ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {edu.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingEducation(edu);
                      setShowEducationForm(true);
                    }}
                    className="hover:bg-blue-500/10 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'education', id: edu.id })}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold gradient-text">Work Experience</h2>
            <Button onClick={() => setShowExperienceForm(true)} className="glass-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>
          <div className="grid gap-4">
            {experience.map((exp, index) => (
              <div
                key={exp.id}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
                  exp.is_visible 
                    ? 'bg-white/60 dark:bg-black/40 border-purple-500/30 shadow-lg shadow-purple-500/5' 
                    : 'bg-white/40 dark:bg-black/20 border-white/10 opacity-75 grayscale'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold border border-purple-500/20">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{exp.title_th}</h3>
                      <Badge variant="outline" className="text-xs border-white/20 bg-white/5">{exp.year}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{exp.subtitle_th}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('experience', exp.id, exp.is_visible)}
                    className={`hover:bg-white/20 ${exp.is_visible ? "text-green-500" : "text-muted-foreground"}`}
                  >
                    {exp.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingExperience(exp);
                      setShowExperienceForm(true);
                    }}
                    className="hover:bg-blue-500/10 hover:text-blue-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'experience', id: exp.id })}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card className="glass border-white/20 dark:border-white/10 shadow-lg bg-white/40 dark:bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="gradient-text">Personal Information</CardTitle>
              <CardDescription>Edit your personal details and skills</CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm 
                personalInfo={personalInfo} 
                onSave={() => fetchPersonalInfo()} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms and Dialogs */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
          onSave={() => {
            fetchProjects();
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {showEducationForm && (
        <EducationForm
          education={editingEducation}
          onClose={() => {
            setShowEducationForm(false);
            setEditingEducation(null);
          }}
          onSave={() => {
            fetchEducation();
            setShowEducationForm(false);
            setEditingEducation(null);
          }}
        />
      )}

      {showExperienceForm && (
        <ExperienceForm
          experience={editingExperience}
          onClose={() => {
            setShowExperienceForm(false);
            setEditingExperience(null);
          }}
          onSave={() => {
            fetchExperience();
            setShowExperienceForm(false);
            setEditingExperience(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: '', id: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ รายการนี้จะถูกลบออกจากฐานข้อมูลอย่างถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
