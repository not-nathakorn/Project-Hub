import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ModernNavigation } from "@/components/ModernNavigation";
import { ModernHero } from "@/components/ModernHero";
import { ModernFooter } from "@/components/ModernFooter";
import { Award, BookOpen, Globe, Mail, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { LineButton } from "@/components/LineButton";
import { MessageCircle } from "lucide-react";
import { Project, Education, Experience } from "@/types";
import { PortfolioService } from "@/services";
import { useSiteSettings } from "@/hooks/useSupabaseRealtime";
import { lazyWithRetry } from "@/lib/lazyLoad";

// Lazy Load Components (Code Splitting) with Auto-Retry
const ModernProjectCard = lazyWithRetry(() => import("@/components/ModernProjectCard").then(m => ({ default: m.ModernProjectCard })));
const ModernTimelineItem = lazyWithRetry(() => import("@/components/ModernTimelineItem").then(m => ({ default: m.ModernTimelineItem })));
const Meteors = lazyWithRetry(() => import("@/components/effects/Meteors").then(m => ({ default: m.Meteors })));

const ThailandEducationMap = lazyWithRetry(() => import("@/components/ThailandEducationMap"));
const ToolsShowcase = lazyWithRetry(() => import("@/components/ToolsShowcase"));
const GlowingFeatures = lazyWithRetry(() => import("@/components/GlowingFeatures"));

const skills = [
  "React & TypeScript",
  "System Architecture",
  "Frontend Development",
  "C/C# Programming",
  "Network Design",
  "Educational Technology",
  "Project Management",
  "Technical Teaching",
];

const Index = () => {
  const { language, t } = useLanguage();
  const { settings } = useSiteSettings();
  
  // State for Supabase data
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data using Service Pattern
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, educationData, experienceData] = await Promise.all([
          PortfolioService.getProjects(),
          PortfolioService.getEducation(),
          PortfolioService.getExperience()
        ]);

        setProjects(projectsData || []);
        setEducation(educationData || []);
        setExperience(experienceData || []);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime changes via Service
    const unsubscribe = PortfolioService.subscribeToChanges(fetchData);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);



  return (
    <div className="min-h-screen relative z-10">
      <ModernNavigation />

      {/* Hero Section */}
      <ModernHero />

      {/* Projects Section */}
      <section id="projects" className="relative py-8 md:py-12 lg:py-16 px-4 overflow-hidden scroll-mt-40">
        <Suspense fallback={null}>
          <Meteors number={15} />
        </Suspense>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("nav.projects")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("projects.title")}</AnimatedText>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              <AnimatedText block>{t("projects.description")}</AnimatedText>
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              // Skeleton Loading for Projects
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden bg-white/5 border border-white/10 h-[400px] animate-pulse">
                  <div className="h-48 bg-white/10" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : (
              <Suspense fallback={null}>
                {projects.map((project, index) => (
                  <ModernProjectCard
                    key={project.id}
                    {...project}
                    description={language === "th" ? project.description_th : project.description_en}
                    index={index}
                  />
                ))}
              </Suspense>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-8 md:py-12 lg:py-16 px-4 scroll-mt-40">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("nav.about")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("about.title")}</AnimatedText>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 md:p-8 lg:p-12 border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
                
                {/* Text Content */}
                <div className="flex-1 order-2 md:order-1">
                  {language === 'th' ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-4 gradient-text"><AnimatedText>{t("about.thaiTitle")}</AnimatedText></h3>
                      <p className="text-foreground font-semibold mb-4"><AnimatedText>{t("about.thaiName")}</AnimatedText></p>
                      {/* <p className="text-muted-foreground leading-relaxed mb-4">
                        <AnimatedText block>{t("about.thaiDesc1")}</AnimatedText>
                      </p> */}
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        <AnimatedText block>{t("about.thaiDesc2")}</AnimatedText>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold mb-4 gradient-text"><AnimatedText>{t("about.englishTitle")}</AnimatedText></h3>
                      <p className="text-foreground font-semibold mb-4"><AnimatedText>{t("about.englishName")}</AnimatedText></p>
                      {/* <p className="text-muted-foreground leading-relaxed mb-4">
                        <AnimatedText block>{t("about.englishDesc1")}</AnimatedText>
                      </p> */}
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        <AnimatedText block>{t("about.englishDesc2")}</AnimatedText>
                      </p>
                    </div>
                  )}
                </div>

                {/* Profile Image - Playful Design */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 order-1 md:order-2 flex justify-center">
                  <div className="relative w-48 h-48 md:w-64 md:h-64">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                    
                    {/* Image Container */}
                    <motion.div 
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl glass-strong flex items-center justify-center p-2 group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img 
                        src="/Dev.png" 
                        alt="Profile" 
                        className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform transition-transform duration-500 hover:scale-110" 
                      />
                    </motion.div>
                    
                    {/* Floating Badge */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-2 -right-2 md:bottom-2 md:-right-2 bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-lg border border-white/20 flex items-center gap-2 z-10"
                    >
                       <span className="text-xl">💻</span>
                       <span className="text-xs font-bold gradient-text">Coding...</span>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-bold text-foreground"><AnimatedText>{t("about.englishProf")}</AnimatedText></h4>
              </div>
              <p className="text-muted-foreground">IELTS Overall Band 5.5 (Valid: 2024–2026)</p>
            </div>

            <div className="relative z-10 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="text-lg font-bold text-foreground"><AnimatedText>{t("about.skills")}</AnimatedText></h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-2 glass-strong rounded-full text-sm font-medium text-foreground border border-border/30 hover:border-primary/50 transition-colors"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>

            <div className="relative z-10 mt-12 flex justify-center">
              <Suspense fallback={<div className="h-40 w-full animate-pulse bg-white/5 rounded-xl" />}>
                <ToolsShowcase />
              </Suspense>
            </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-8 md:py-12 lg:py-16 px-4 scroll-mt-40">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("services.title")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("services.heading")}</AnimatedText>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
              <AnimatedText block>{t("services.description")}</AnimatedText>
            </p>
          </motion.div>

          <Suspense fallback={<div className="h-96 w-full animate-pulse bg-white/5 rounded-xl" />}>
            <GlowingFeatures />
          </Suspense>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="relative py-8 md:py-12 lg:py-16 px-4 scroll-mt-40">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("nav.education")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("education.title")}</AnimatedText>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg"><AnimatedText block>{t("education.description")}</AnimatedText></p>
          </motion.div>

          <div>
            {loading ? (
              // Skeleton Loading for Education
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="mb-8 pl-8 relative border-l border-white/10 animate-pulse">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-6 bg-white/10 rounded w-1/4" />
                    <div className="h-8 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              <Suspense fallback={null}>
                {education.map((item, index) => (
                  <ModernTimelineItem
                    key={item.id}
                    year={item.year}
                    title={language === "th" ? item.title_th : item.title_en}
                    subtitle={language === "th" ? item.subtitle_th : item.subtitle_en}
                    description={language === "th" ? item.description_th : item.description_en}
                    badge={item.badge}
                    index={index}
                  />
                ))}
              </Suspense>
            )}
          </div>
        </div>
      </section>


      {/* Thailand Education Map */}
      <section className="relative py-8 md:py-12 lg:py-16 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-white/5 rounded-xl" />}>
            <ThailandEducationMap />
          </Suspense>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="relative py-8 md:py-12 lg:py-16 px-4 scroll-mt-40">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("nav.experience")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("experience.title")}</AnimatedText>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg"><AnimatedText block>{t("experience.description")}</AnimatedText></p>
          </motion.div>

          <div>
            {loading ? (
              // Skeleton Loading for Experience
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="mb-8 pl-8 relative border-l border-white/10 animate-pulse">
                  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-white/10" />
                  <div className="space-y-3">
                    <div className="h-6 bg-white/10 rounded w-1/4" />
                    <div className="h-8 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              <Suspense fallback={null}>
                {experience.map((item, index) => (
                  <ModernTimelineItem
                    key={item.id}
                    year={item.year}
                    title={language === "th" ? item.title_th : item.title_en}
                    subtitle={language === "th" ? item.subtitle_th : item.subtitle_en}
                    description={language === "th" ? item.description_th : item.description_en}
                    badge={item.badge}
                    index={index}
                  />
                ))}
              </Suspense>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-8 md:py-12 lg:py-16 px-4 scroll-mt-40 overflow-hidden">
        <Suspense fallback={null}>
          <Meteors number={10} />
        </Suspense>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12 pt-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-3 glass-strong rounded-full text-sm font-bold text-primary border border-primary/30 mb-4 leading-relaxed"
            >
              <AnimatedText>{t("nav.contact")}</AnimatedText>
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-4 md:mb-6 gradient-text leading-loose py-4">
              <AnimatedText>{t("contact.title")}</AnimatedText>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg"><AnimatedText block>{t("contact.description")}</AnimatedText></p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8 md:p-12 lg:p-16 border border-border/50 relative overflow-hidden"
          >
            {/* Animated background gradient */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 15, repeat: Infinity }}
              style={{ backgroundSize: '200% 200%' }}
            />

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Column: Text & Status */}
              <div className="text-center lg:text-left space-y-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                  settings.available_for_work 
                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      settings.available_for_work ? "animate-ping bg-green-400" : "animate-ping bg-red-400"
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      settings.available_for_work ? "bg-green-500" : "bg-red-500"
                    }`}></span>
                  </span>
                  <AnimatedText>{settings.available_for_work ? t("contact.available") : t("contact.unavailable")}</AnimatedText>
                </div>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black gradient-text leading-tight">
                  <AnimatedText>{t("contact.letsConnect")}</AnimatedText>
                </h3>

                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                  <AnimatedText block>{t("contact.message")}</AnimatedText>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <motion.a
                    href="mailto:contact@codex-th.com"
                    className="group px-6 py-3 rounded-xl font-bold bg-gradient-primary text-white inline-flex items-center gap-2 justify-center shadow-lg hover:shadow-2xl hover:shadow-primary/50 transition-all relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-5 h-5" />
                    <span><AnimatedText>{t("contact.emailMe")}</AnimatedText></span>
                  </motion.a>
                  
                  <CopyEmailButton t={t} />

                  <LineButton t={t} />

                  <motion.a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group px-6 py-3 rounded-xl font-bold glass-strong border border-border/50 hover:border-primary/50 inline-flex items-center gap-2 justify-center transition-all text-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span>LinkedIn</span>
                  </motion.a>
                </div>
              </div>

              {/* Right Column: Visuals */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Globe Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Globe className="w-32 h-32 md:w-40 md:h-40 text-primary/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" strokeWidth={1} />
                  </div>
                  
                  {/* Orbiting Elements */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-8 glass rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-8 h-8 glass rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 glass rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
};

export default Index;
