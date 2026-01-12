import { useState, useEffect, useCallback } from 'react';
import { supabase, Project, Education, Experience, PersonalInfo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, 
  LayoutDashboard, User, Briefcase, GraduationCap, Map as MapIcon,
  LogOut, ChevronRight, Settings
} from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { EducationForm } from '@/components/admin/EducationForm';
import { ExperienceForm } from '@/components/admin/ExperienceForm';
import { PersonalInfoForm } from '@/components/admin/PersonalInfoForm';
import { MapSettingsManager } from '@/components/admin/MapSettingsManager';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  
  // Form States
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string }>({
    open: false, type: '', id: '',
  });




  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('order_index');
    setProjects(data || []);
  };

  const fetchEducation = async () => {
    const { data } = await supabase.from('education').select('*').order('order_index');
    setEducation(data || []);
  };

  const fetchExperience = async () => {
    const { data } = await supabase.from('experience').select('*').order('order_index');
    setExperience(data || []);
  };

  const fetchPersonalInfo = async () => {
    const { data } = await supabase.from('personal_info').select('*').single();
    setPersonalInfo(data || null);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  const fetchAllData = useCallback(async () => {
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
  }, []); // Include dependencies properly or suppress if intent is to use latest refs


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);



  const toggleVisibility = async (type: 'projects' | 'education' | 'experience', id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from(type).update({ is_visible: !currentVisibility }).eq('id', id);
      if (error) throw error;
      toast.success(currentVisibility ? 'ซ่อนรายการแล้ว' : 'แสดงรายการแล้ว');
      if (type === 'projects') fetchProjects();
      else if (type === 'education') fetchEducation();
      else fetchExperience();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleDelete = async () => {
    const { type, id } = deleteDialog;
    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;
      toast.success('ลบรายการสำเร็จ');
      if (type === 'projects') fetchProjects();
      else if (type === 'education') fetchEducation();
      else fetchExperience();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการลบ');
    } finally {
      setDeleteDialog({ open: false, type: '', id: '' });
    }
  };

  const visibleCount = (items: Array<{ is_visible: boolean }>) => items.filter(item => item.is_visible).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
    { id: 'personal', label: 'ข้อมูลส่วนตัว', icon: User },
    { id: 'projects', label: 'โครงการ', icon: Briefcase, count: projects.length },
    { id: 'education', label: 'การศึกษา', icon: GraduationCap, count: education.length },
    { id: 'experience', label: 'ประสบการณ์', icon: Briefcase, count: experience.length },
    { id: 'map', label: 'จัดการแผนที่', icon: MapIcon, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Admin Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">Content Management System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-slate-500'
                }`}>
                  {item.count}
                </span>
              )}
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          ))}
        </nav>


      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลของคุณได้ที่นี่</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-blue-100 text-sm font-medium mb-1">รายการที่แสดงผล</p>
                          <h3 className="text-3xl font-bold">
                            {visibleCount(projects) + visibleCount(education) + visibleCount(experience)}
                          </h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-500 text-sm font-medium mb-1">รายการที่ซ่อนอยู่</p>
                          <h3 className="text-3xl font-bold text-slate-800">
                            {projects.length + education.length + experience.length - 
                             (visibleCount(projects) + visibleCount(education) + visibleCount(experience))}
                          </h3>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <EyeOff className="w-6 h-6 text-slate-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-500 text-sm font-medium mb-1">โครงการทั้งหมด</p>
                          <h3 className="text-3xl font-bold text-slate-800">{projects.length}</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle>ยินดีต้อนรับสู่ระบบจัดการเนื้อหา</CardTitle>
                    <CardDescription>เลือกเมนูทางด้านซ้ายเพื่อเริ่มจัดการข้อมูลส่วนต่างๆ ของเว็บไซต์</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.slice(1).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group text-left"
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                            <item.icon className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 group-hover:text-blue-700">{item.label}</h4>
                            <p className="text-xs text-slate-400">จัดการข้อมูล {item.label}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-400" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'personal' && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                  <CardDescription>แก้ไขข้อมูลส่วนตัวและช่องทางการติดต่อ</CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalInfoForm personalInfo={personalInfo} onSave={fetchPersonalInfo} />
                </CardContent>
              </Card>
            )}

            {activeTab === 'projects' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>โครงการทั้งหมด</CardTitle>
                    <CardDescription>จัดการผลงานและโปรเจกต์ของคุณ</CardDescription>
                  </div>
                  <Button onClick={() => setShowProjectForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> เพิ่มโครงการ
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
                          {project.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{project.title}</h3>
                          <p className="text-sm text-slate-500 line-clamp-1">{project.description_th}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleVisibility('projects', project.id, project.is_visible)}>
                            {project.is_visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingProject(project); setShowProjectForm(true); }}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'projects', id: project.id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'education' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>ประวัติการศึกษา</CardTitle>
                    <CardDescription>จัดการข้อมูลการศึกษา</CardDescription>
                  </div>
                  <Button onClick={() => setShowEducationForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> เพิ่มการศึกษา
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {education.map((edu, idx) => (
                      <div key={edu.id} className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{edu.title_th}</h3>
                          <p className="text-sm text-slate-500">{edu.subtitle_th}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleVisibility('education', edu.id, edu.is_visible)}>
                            {edu.is_visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingEducation(edu); setShowEducationForm(true); }}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'education', id: edu.id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'experience' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>ประสบการณ์ทำงาน</CardTitle>
                    <CardDescription>จัดการข้อมูลประสบการณ์</CardDescription>
                  </div>
                  <Button onClick={() => setShowExperienceForm(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> เพิ่มประสบการณ์
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experience.map((exp, idx) => (
                      <div key={exp.id} className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition-all">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{exp.title_th}</h3>
                          <p className="text-sm text-slate-500">{exp.subtitle_th}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleVisibility('experience', exp.id, exp.is_visible)}>
                            {exp.is_visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingExperience(exp); setShowExperienceForm(true); }}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'experience', id: exp.id })}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'map' && (
              <div className="space-y-6">
                <MapSettingsManager />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Forms */}
        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
            onSave={() => { fetchProjects(); setShowProjectForm(false); setEditingProject(null); }}
          />
        )}
        {showEducationForm && (
          <EducationForm
            education={editingEducation}
            onClose={() => { setShowEducationForm(false); setEditingEducation(null); }}
            onSave={() => { fetchEducation(); setShowEducationForm(false); setEditingEducation(null); }}
          />
        )}
        {showExperienceForm && (
          <ExperienceForm
            experience={editingExperience}
            onClose={() => { setShowExperienceForm(false); setEditingExperience(null); }}
            onSave={() => { fetchExperience(); setShowExperienceForm(false); setEditingExperience(null); }}
          />
        )}

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, type: '', id: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
              <AlertDialogDescription>ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">ยืนยันลบ</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Admin;
