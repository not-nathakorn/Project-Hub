import { useState, useEffect } from 'react';
import { supabase, Project, Education, Experience, PersonalInfo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, CheckCircle2, XCircle, Globe, EyeOffIcon, Map as MapIcon, Search, Filter, Settings2 } from 'lucide-react';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { EducationForm } from '@/components/admin/EducationForm';
import { ExperienceForm } from '@/components/admin/ExperienceForm';
import { PersonalInfoForm } from '@/components/admin/PersonalInfoForm';
import { MapSettingsManager } from '@/components/admin/MapSettingsManager';
import { SEOSettingsManager } from '@/components/admin/SEOSettingsManager';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');
  
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

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeProject = activeId ? projects.find(p => p.id === activeId) : null;
  const activeEducation = activeId ? education.find(e => e.id === activeId) : null;
  const activeExperience = activeId ? experience.find(e => e.id === activeId) : null;

  // DnD Sensors with activation constraint
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Try RPC first (gets all items including hidden)
    const { data, error } = await supabase.rpc('get_admin_data', { p_table_name: 'projects' });
    
    if (error) {
      console.error('RPC get_admin_data projects error:', error);
      // Fallback to direct select (might miss hidden items if RLS blocks them)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (fallbackError) throw fallbackError;
      
      setProjects(fallbackData as Project[] || []);
      if ((error as any).code === '42803') {
         toast.error('Database Function Error (42803). Using limited fallback view.');
      }
      return;
    }
    
    // RPC returns JSON, cast it to type
    setProjects((data as unknown as Project[]) || []);
  };

  const fetchEducation = async () => {
    const { data, error } = await supabase.rpc('get_admin_data', { p_table_name: 'education' });
    
    if (error) {
      console.error('RPC get_admin_data education error:', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('education')
        .select('*')
        .order('order_index', { ascending: true });

      if (fallbackError) throw fallbackError;
      
      setEducation(fallbackData as Education[] || []);
      return;
    }
    setEducation((data as unknown as Education[]) || []);
  };

  const fetchExperience = async () => {
    const { data, error } = await supabase.rpc('get_admin_data', { p_table_name: 'experience' });
    
    if (error) {
      console.error('RPC get_admin_data experience error:', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('experience')
        .select('*')
        .order('order_index', { ascending: true });

      if (fallbackError) throw fallbackError;
      
      setExperience(fallbackData as Experience[] || []);
      return;
    }
    setExperience((data as unknown as Experience[]) || []);
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

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'visible' && project.is_visible) ||
      (filterStatus === 'hidden' && !project.is_visible);
    
    return matchesSearch && matchesFilter;
  });

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent, type: 'projects' | 'education' | 'experience') => {
    setActiveId(null); // Clear active state
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    let items: Array<{ id: string; order_index: number }>;
    let setItems: (items: Array<{ id: string; order_index: number }>) => void;

    if (type === 'projects') {
      items = [...projects];
      setItems = setProjects as (items: Array<{ id: string; order_index: number }>) => void;
    } else if (type === 'education') {
      items = [...education];
      setItems = setEducation as (items: Array<{ id: string; order_index: number }>) => void;
    } else {
      items = [...experience];
      setItems = setExperience as (items: Array<{ id: string; order_index: number }>) => void;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    
    const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order_index: index
    }));
    setItems(newItems as typeof projects);

    // Update order in database
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from(type)
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      
      toast.success('เรียงลำดับใหม่สำเร็จ!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('เกิดข้อผิดพลาดในการเรียงลำดับ');
      // Refetch to restore original order
      if (type === 'projects') fetchProjects();
      else if (type === 'education') fetchEducation();
      else fetchExperience();
    }
  };

  // Sortable Project Item Component
  const SortableProjectItem = ({ project, index }: { project: Project; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isOver,
    } = useSortable({ id: project.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
          isDragging 
            ? 'opacity-50 scale-[1.02] shadow-2xl z-50 bg-blue-50 dark:bg-blue-950 border-blue-500 ring-2 ring-blue-500/50' 
            : isOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]'
              : project.is_visible 
                ? 'bg-white dark:bg-black/20 border-green-500/30 dark:border-white/5 shadow-sm hover:shadow-md hover:scale-[1.01]' 
                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-80'
        }`}
      >
        {/* Drop Indicator Line */}
        {isOver && !isDragging && (
          <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse" />
        )}

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-2 rounded-lg transition-all ${
            isDragging 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GripVertical className={`w-5 h-5 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
        </div>

        <div className="flex items-center gap-4 flex-1">
          {/* Order Badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-500/20 shadow-inner">
             {index + 1}
          </div>
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
      </div>
    );
  };

  // Sortable Education Item Component
  const SortableEducationItem = ({ education: edu, index }: { education: Education; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isOver,
    } = useSortable({ id: edu.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
          isDragging 
            ? 'opacity-50 scale-[1.02] shadow-2xl z-50 bg-blue-50 dark:bg-blue-950 border-blue-500 ring-2 ring-blue-500/50' 
            : isOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]'
              : edu.is_visible 
                ? 'bg-white dark:bg-black/20 border-blue-500/30 dark:border-white/5 shadow-sm hover:shadow-md' 
                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-80'
        }`}
      >
        {/* Drop Indicator Line */}
        {isOver && !isDragging && (
          <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse" />
        )}

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-2 rounded-lg transition-all ${
            isDragging 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GripVertical className={`w-5 h-5 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
        </div>

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
      </div>
    );
  };

  // Sortable Experience Item Component
  const SortableExperienceItem = ({ experience: exp, index }: { experience: Experience; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
      isOver,
    } = useSortable({ id: exp.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${
          isDragging 
            ? 'opacity-50 scale-[1.02] shadow-2xl z-50 bg-blue-50 dark:bg-blue-950 border-blue-500 ring-2 ring-blue-500/50' 
            : isOver
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.01]'
              : exp.is_visible 
                ? 'bg-white dark:bg-black/20 border-purple-500/30 dark:border-white/5 shadow-sm hover:shadow-md' 
                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-60 hover:opacity-80'
        }`}
      >
        {/* Drop Indicator Line */}
        {isOver && !isDragging && (
          <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full animate-pulse" />
        )}

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab active:cursor-grabbing p-2 rounded-lg transition-all ${
            isDragging 
              ? 'bg-blue-500 text-white' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GripVertical className={`w-5 h-5 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
        </div>

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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards with Glass Effect */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">แสดงบนเว็บ</p>
              <p className="text-2xl sm:text-4xl font-black gradient-text">
                {visibleCount(projects) + visibleCount(education) + visibleCount(experience)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 truncate">รายการที่กำลังแสดงผล</p>
            </div>
            <div className="h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/10">
              <Globe className="w-5 h-5 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-black/40 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1">ซ่อนอยู่</p>
              <p className="text-2xl sm:text-4xl font-black text-foreground">
                {projects.length + education.length + experience.length - 
                 (visibleCount(projects) + visibleCount(education) + visibleCount(experience))}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 truncate">รายการที่ไม่แสดงผล</p>
            </div>
            <div className="h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 flex items-center justify-center border border-neutral-500/30 shadow-lg">
              <EyeOffIcon className="w-5 h-5 sm:w-8 sm:h-8 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="projects" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-slate-100 dark:bg-black/20 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full flex flex-wrap justify-start sm:justify-center gap-0.5 sm:gap-1 border border-slate-200 dark:border-white/5 overflow-x-auto">
          <TabsTrigger 
            value="projects" 
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
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
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
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
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
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
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
          >
            <span className="flex items-center gap-2">
              Personal
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="map" 
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
          >
            <span className="flex items-center gap-2">
              <MapIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              Map
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="seo" 
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-300 rounded-lg sm:rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              SEO
              <Badge variant="secondary" className="ml-1 hidden md:inline-flex bg-green-500/10 text-green-500 border-green-500/20 shadow-sm">
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
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <h2 className="text-2xl font-bold gradient-text">Projects Management</h2>
            <Button 
              onClick={() => setShowProjectForm(true)} 
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10"
          >
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา Projects ตามชื่อหรือ Tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : ''}
              >
                ทั้งหมด ({projects.length})
              </Button>
              <Button
                variant={filterStatus === 'visible' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('visible')}
                className={filterStatus === 'visible' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              >
                <Eye className="w-3 h-3 mr-1" />
                Live ({visibleCount(projects)})
              </Button>
              <Button
                variant={filterStatus === 'hidden' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('hidden')}
                className={filterStatus === 'hidden' ? 'bg-slate-600 hover:bg-slate-700 text-white' : ''}
              >
                <EyeOff className="w-3 h-3 mr-1" />
                Hidden ({projects.length - visibleCount(projects)})
              </Button>
            </div>
          </motion.div>

          {/* Drag & Drop List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={(event) => handleDragEnd(event, 'projects')}
          >
            <SortableContext
              items={filteredProjects.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>ไม่พบ Projects ที่ตรงกับการค้นหา</p>
                  </div>
                ) : (
                  filteredProjects.map((project, index) => (
                    <SortableProjectItem key={project.id} project={project} index={index} />
                  ))
                )}
              </div>
            </SortableContext>

            {/* Drag Overlay - Shows floating preview while dragging */}
            <DragOverlay>
              {activeProject ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-500 bg-white dark:bg-black/90 shadow-2xl scale-105 ring-4 ring-blue-500/30">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <GripVertical className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-3xl shadow-inner border border-blue-500/20">
                    {activeProject.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{activeProject.title}</h3>
                      <Badge variant="default" className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5 h-5">
                        กำลังย้าย...
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{activeProject.description_th}</p>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Drag Hint */}
          {filteredProjects.length > 1 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
              <GripVertical className="w-4 h-4" />
              ลากไอคอน ⋮⋮ เพื่อจัดเรียงลำดับ
            </p>
          )}
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
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </motion.div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={(event) => handleDragEnd(event, 'education')}
          >
            <SortableContext
              items={education.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {education.map((edu, index) => (
                  <SortableEducationItem key={edu.id} education={edu} index={index} />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay for Education */}
            <DragOverlay>
              {activeEducation ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-500 bg-white dark:bg-black/90 shadow-2xl scale-105 ring-4 ring-blue-500/30">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <GripVertical className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg border border-blue-500/20 shadow-inner">
                    #
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{activeEducation.title_th}</h3>
                      <Badge variant="default" className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5 h-5">
                        กำลังย้าย...
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{activeEducation.subtitle_th}</p>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          {/* Drag Hint */}
          {education.length > 1 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2 mt-4">
              <GripVertical className="w-4 h-4" />
              ลากไอคอน ⋮⋮ เพื่อจัดเรียงลำดับ
            </p>
          )}
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
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </motion.div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={(event) => handleDragEnd(event, 'experience')}
          >
            <SortableContext
              items={experience.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {experience.map((exp, index) => (
                  <SortableExperienceItem key={exp.id} experience={exp} index={index} />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay for Experience */}
            <DragOverlay>
              {activeExperience ? (
                <div className="flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-500 bg-white dark:bg-black/90 shadow-2xl scale-105 ring-4 ring-blue-500/30">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <GripVertical className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-lg border border-purple-500/20 shadow-inner">
                    #
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground">{activeExperience.title_th}</h3>
                      <Badge variant="default" className="bg-blue-500 text-white border-0 text-xs px-2 py-0.5 h-5">
                        กำลังย้าย...
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{activeExperience.subtitle_th}</p>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
          
          {/* Drag Hint */}
          {experience.length > 1 && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2 mt-4">
              <GripVertical className="w-4 h-4" />
              ลากไอคอน ⋮⋮ เพื่อจัดเรียงลำดับ
            </p>
          )}
        </TabsContent>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
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

        {/* SEO Tab */}
        <TabsContent value="seo">
          <SEOSettingsManager />
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
          nextOrderIndex={projects.length + 1}
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
