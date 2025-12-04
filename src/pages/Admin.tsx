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
import { MapSettingsManager } from '@/components/admin/MapSettingsManager';
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

const Admin = () => {
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
    console.log('📚 Education data fetched:', data);
    console.log('📊 Total education records:', data?.length);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 glass rounded-2xl p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">จัดการข้อมูลทั้งหมดของเว็บไซต์</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center glass-strong rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium">แสดงบนเว็บ</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {visibleCount(projects) + visibleCount(education) + visibleCount(experience)}
                </p>
              </div>
              <div className="text-center glass-strong rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <EyeOffIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">ซ่อนอยู่</span>
                </div>
                <p className="text-2xl font-bold mt-1">
                  {projects.length + education.length + experience.length - 
                   (visibleCount(projects) + visibleCount(education) + visibleCount(experience))}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 glass-strong p-1">
            <TabsTrigger value="personal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ข้อมูลส่วนตัว
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              โครงการ 
              <Badge variant="secondary" className="ml-2">{visibleCount(projects)}/{projects.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              การศึกษา
              <Badge variant="secondary" className="ml-2">{visibleCount(education)}/{education.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              ประสบการณ์
              <Badge variant="secondary" className="ml-2">{visibleCount(experience)}/{experience.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              แผนที่
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  ข้อมูลส่วนตัว
                </CardTitle>
                <CardDescription>แก้ไขข้อมูลส่วนตัวและทักษะของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalInfoForm 
                  personalInfo={personalInfo} 
                  onSave={() => fetchPersonalInfo()} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      โครงการทั้งหมด
                      <Badge variant="outline">{projects.length} รายการ</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        แสดงบนเว็บ: {visibleCount(projects)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="w-3 h-3" />
                        ซ่อนอยู่: {projects.length - visibleCount(projects)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowProjectForm(true)} className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มโครงการ
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>ยังไม่มีโครงการ</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowProjectForm(true)}>
                      เพิ่มโครงการแรก
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project, index) => (
                      <div
                        key={project.id}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          project.is_visible 
                            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10' 
                            : 'border-border/30 bg-muted/30 hover:border-border/50'
                        }`}
                      >
                        {/* Visibility Indicator */}
                        <div className={`absolute top-2 right-2 ${project.is_visible ? 'block' : 'hidden group-hover:block'}`}>
                          {project.is_visible ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <Globe className="w-3 h-3 mr-1" />
                              แสดงบนเว็บ
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              ซ่อนอยู่
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{project.icon}</span>
                            <h3 className="font-bold text-lg">{project.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description_th}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant={project.is_visible ? "default" : "outline"}
                            size="icon"
                            onClick={() => toggleVisibility('projects', project.id, project.is_visible)}
                            className={project.is_visible ? "bg-green-600 hover:bg-green-700" : ""}
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, type: 'projects', id: project.id })}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🎓</span>
                      การศึกษา
                      <Badge variant="outline">{education.length} รายการ</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        แสดงบนเว็บ: {visibleCount(education)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="w-3 h-3" />
                        ซ่อนอยู่: {education.length - visibleCount(education)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowEducationForm(true)} className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มการศึกษา
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {education.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>ยังไม่มีข้อมูลการศึกษา</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowEducationForm(true)}>
                      เพิ่มการศึกษาแรก
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {education.map((edu, index) => (
                      <div
                        key={edu.id}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          edu.is_visible 
                            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10' 
                            : 'border-border/30 bg-muted/30 hover:border-border/50'
                        }`}
                      >
                        <div className={`absolute top-2 right-2 ${edu.is_visible ? 'block' : 'hidden group-hover:block'}`}>
                          {edu.is_visible ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <Globe className="w-3 h-3 mr-1" />
                              แสดงบนเว็บ
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              ซ่อนอยู่
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-lg">{edu.title_th}</h3>
                            <Badge variant="outline" className="text-xs">{edu.year}</Badge>
                            {edu.badge && (
                              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                                {edu.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{edu.subtitle_th}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant={edu.is_visible ? "default" : "outline"}
                            size="icon"
                            onClick={() => toggleVisibility('education', edu.id, edu.is_visible)}
                            className={edu.is_visible ? "bg-green-600 hover:bg-green-700" : ""}
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, type: 'education', id: edu.id })}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience">
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">💼</span>
                      ประสบการณ์
                      <Badge variant="outline">{experience.length} รายการ</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                        แสดงบนเว็บ: {visibleCount(experience)}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="w-3 h-3" />
                        ซ่อนอยู่: {experience.length - visibleCount(experience)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowExperienceForm(true)} className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มประสบการณ์
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {experience.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>ยังไม่มีข้อมูลประสบการณ์</p>
                    <Button variant="outline" className="mt-4" onClick={() => setShowExperienceForm(true)}>
                      เพิ่มประสบการณ์แรก
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {experience.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          exp.is_visible 
                            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10' 
                            : 'border-border/30 bg-muted/30 hover:border-border/50'
                        }`}
                      >
                        <div className={`absolute top-2 right-2 ${exp.is_visible ? 'block' : 'hidden group-hover:block'}`}>
                          {exp.is_visible ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <Globe className="w-3 h-3 mr-1" />
                              แสดงบนเว็บ
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              ซ่อนอยู่
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-lg">{exp.title_th}</h3>
                            <Badge variant="outline" className="text-xs">{exp.year}</Badge>
                            {exp.badge && (
                              <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                                {exp.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{exp.subtitle_th}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant={exp.is_visible ? "default" : "outline"}
                            size="icon"
                            onClick={() => toggleVisibility('experience', exp.id, exp.is_visible)}
                            className={exp.is_visible ? "bg-green-600 hover:bg-green-700" : ""}
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
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, type: 'experience', id: exp.id })}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Map Settings Tab */}
          <TabsContent value="map">
            <MapSettingsManager />
          </TabsContent>
        </Tabs>
      </div>

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

export default Admin;
