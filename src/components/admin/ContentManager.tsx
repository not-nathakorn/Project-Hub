import { useState, useEffect } from 'react';
import { supabase, Project, Education, Experience, PersonalInfo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, CheckCircle2, XCircle, Globe, EyeOffIcon, Map as MapIcon } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { EducationForm } from '@/components/admin/EducationForm';
import { ExperienceForm } from '@/components/admin/ExperienceForm';
import { PersonalInfoForm } from '@/components/admin/PersonalInfoForm';
import { MapSettingsManager } from '@/components/admin/MapSettingsManager';
import { motion } from 'framer-motion';
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
    <div className="space-y-6">
      {/* Stats Cards with Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">แสดงบนเว็บ</p>
              <p className="text-4xl font-black gradient-text">
                {visibleCount(projects) + visibleCount(education) + visibleCount(experience)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">รายการที่กำลังแสดงผล</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/10">
              <Globe className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">ซ่อนอยู่</p>
              <p className="text-4xl font-black text-foreground">
                {projects.length + education.length + experience.length - 
                 (visibleCount(projects) + visibleCount(education) + visibleCount(experience))}
              </p>
              <p className="text-xs text-muted-foreground mt-2">รายการที่ไม่แสดงผล</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 flex items-center justify-center border border-neutral-500/30 shadow-lg">
              <EyeOffIcon className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="glass p-1.5 rounded-2xl w-full grid grid-cols-2 lg:grid-cols-5 gap-1 border border-white/20 dark:border-white/10 shadow-lg">
          <TabsTrigger 
            value="projects" 
            className="data-[state=active]:glass-strong data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 transition-all duration-300 rounded-xl"
          >
            <span className="flex items-center gap-2">
              Projects
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex bg-primary/10 text-primary border-primary/20 shadow-sm">
                {visibleCount(projects)}/{projects.length}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="education" 
            className="data-[state=active]:glass-strong data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 transition-all duration-300 rounded-xl"
          >
            <span className="flex items-center gap-2">
              Education
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex bg-primary/10 text-primary border-primary/20 shadow-sm">
                {visibleCount(education)}/{education.length}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="experience" 
            className="data-[state=active]:glass-strong data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 transition-all duration-300 rounded-xl"
          >
            <span className="flex items-center gap-2">
              Experience
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex bg-primary/10 text-primary border-primary/20 shadow-sm">
                {visibleCount(experience)}/{experience.length}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="personal" 
            className="data-[state=active]:glass-strong data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 transition-all duration-300 rounded-xl"
          >
            <span className="flex items-center gap-2">
              Personal
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="map" 
            className="data-[state=active]:glass-strong data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-white/30 transition-all duration-300 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <MapIcon className="w-4 h-4" />
              Map
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex bg-red-500/10 text-red-500 border-red-500/20 shadow-sm">
                New
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <h2 className="text-2xl font-bold gradient-text">Projects Management</h2>
            <Button 
              onClick={() => setShowProjectForm(true)} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </motion.div>
          <div className="grid gap-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                  project.is_visible 
                    ? 'glass border-green-500/30 shadow-lg shadow-green-500/5 hover:shadow-green-500/10' 
                    : 'glass border-white/10 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-3xl shadow-inner border border-blue-500/20">
                    {project.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{project.title}</h3>
                      {project.is_visible && (
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-0.5 h-5 shadow-sm">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description_th}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-primary/5 border-primary/20">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('projects', project.id, project.is_visible)}
                    className={`hover:scale-110 transition-transform ${project.is_visible ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}
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
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:scale-110 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'projects', id: project.id })}
                    className="hover:bg-red-500/10 hover:text-red-500 hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <h2 className="text-2xl font-bold gradient-text">Education History</h2>
            <Button 
              onClick={() => setShowEducationForm(true)} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </motion.div>
          <div className="grid gap-4">
            {education.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                  edu.is_visible 
                    ? 'glass border-blue-500/30 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10' 
                    : 'glass border-white/10 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-500/20 shadow-inner">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg text-foreground">{edu.title_th}</h3>
                      <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">{edu.year}</Badge>
                      {edu.is_visible && (
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-0.5 h-5 shadow-sm">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{edu.subtitle_th}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('education', edu.id, edu.is_visible)}
                    className={`hover:scale-110 transition-transform ${edu.is_visible ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}
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
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:scale-110 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'education', id: edu.id })}
                    className="hover:bg-red-500/10 hover:text-red-500 hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <h2 className="text-2xl font-bold gradient-text">Work Experience</h2>
            <Button 
              onClick={() => setShowExperienceForm(true)} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </motion.div>
          <div className="grid gap-4">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                  exp.is_visible 
                    ? 'glass border-purple-500/30 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10' 
                    : 'glass border-white/10 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg border border-purple-500/20 shadow-inner">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg text-foreground">{exp.title_th}</h3>
                      <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">{exp.year}</Badge>
                      {exp.is_visible && (
                        <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs px-2 py-0.5 h-5 shadow-sm">
                          Live
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{exp.subtitle_th}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleVisibility('experience', exp.id, exp.is_visible)}
                    className={`hover:scale-110 transition-transform ${exp.is_visible ? "text-green-500 hover:bg-green-500/10" : "text-muted-foreground hover:bg-white/10"}`}
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
                    className="hover:bg-blue-500/10 hover:text-blue-500 hover:scale-110 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, type: 'experience', id: exp.id })}
                    className="hover:bg-red-500/10 hover:text-red-500 hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass border-white/20 dark:border-white/10 shadow-xl">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-2xl gradient-text">Personal Information</CardTitle>
                <CardDescription className="text-muted-foreground">Edit your personal details and skills</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PersonalInfoForm 
                  personalInfo={personalInfo} 
                  onSave={() => fetchPersonalInfo()} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Map Tab */}
        <TabsContent value="map">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MapSettingsManager />
          </motion.div>
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
