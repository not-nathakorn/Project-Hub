import { motion } from "framer-motion";
import { Mail, Sparkles, Globe } from "lucide-react";
import { LiquidBackground } from "./effects/LiquidBackground";
import { InfiniteMarquee } from "./InfiniteMarquee";
import { Spotlight } from "./effects/Spotlight";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedText } from "./ui/AnimatedText";
import { PinContainer } from "./ui/3d-pin";
import { useSiteSettings } from "@/hooks/useSupabaseRealtime";

export const ModernHero = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();

  const handleScroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center pt-48 md:pt-44 overflow-hidden">
      {/* Background Effects */}
      {/* LiquidBackground is global in App.tsx */}
      <Spotlight className="hidden md:block opacity-50" />

      {/* Content - z-0 เพื่อให้อยู่ใต้ Navbar (z-50) */}
      <div className="container mx-auto max-w-5xl relative z-0 px-4">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-8"
          >
            <div className="relative" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
              <motion.div
                className="absolute -inset-2 bg-blue-400 opacity-30 blur-xl rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ willChange: 'transform, opacity' }}
              />
              <span 
                className="relative px-6 py-2 bg-white/50 backdrop-blur-md rounded-full text-sm font-bold text-blue-600 border border-blue-200 inline-flex items-center gap-2 shadow-sm"
                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
              >
                <Sparkles className="w-4 h-4" />
                <AnimatedText>{language === 'th' ? 'สวัสดีครับ 👋' : 'Hello World 👋'}</AnimatedText>
              </span>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full border border-blue-200 dark:border-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Portfolio + Project Hub
                  </span>
                </div>
              </motion.div>

              {/* Rank - Thai Only */}
              {language === 'th' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="lg:text-left mb-2"
                >
                  <span className="inline-block px-3 py-1 text-sm font-bold text-white bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg shadow-md">
                    ว่าที่ ร้อยตรี
                  </span>
                </motion.div>
              )}

              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-2"
                style={{ 
                  lineHeight: language === 'th' ? '1.2' : '1.1',
                }}
              >
                {language === 'th' ? 'ณฐกร พิกรมสุข' : 'Na-thakorn Phikromsuk'}
              </motion.h1>

              {/* Role - Premium Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="relative inline-flex group">
                  {/* Gradient border glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl opacity-60 group-hover:opacity-100 blur-sm transition-all duration-300"></div>
                  
                  {/* Main badge */}
                  <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        settings.available_for_work ? "bg-emerald-400" : "bg-red-400"
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 shadow-lg ${
                        settings.available_for_work ? "bg-emerald-500 shadow-emerald-500/50" : "bg-red-500 shadow-red-500/50"
                      }`}></span>
                    </span>
                    <span className="text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {t("hero.role")}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Buttons - Premium Design */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                {/* Primary Button - Sleek Gradient with Shine */}
                <motion.button
                  onClick={() => handleScroll("projects")}
                  className="group relative px-8 py-4 text-base font-bold rounded-full overflow-hidden text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 shine-effect"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                  <div className="relative flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <AnimatedText>{t("viewProjects")}</AnimatedText>
                  </div>
                </motion.button>

                {/* Secondary Button - Glassmorphism */}
                <motion.button
                  onClick={() => handleScroll("contact")}
                  className="group relative px-8 py-4 text-base font-bold rounded-full overflow-hidden text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/50 dark:border-slate-700/50 group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 transition-colors duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Mail className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <AnimatedText>{t("getInTouch")}</AnimatedText>
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            </div>

            {/* Right Column - 3D Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="hidden lg:flex justify-center items-center h-[40rem]"
            >
              <PinContainer
                title="Portfolio Hub"
                href="#projects"
                containerClassName="glassmorphism-pin"
                imageUrl={settings.hero_image_url || '/Dev.png'}
              >
                <div className="relative flex basis-full flex-col p-10 tracking-tight w-[26rem] h-[32rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl justify-between group/card">
                  {/* Profile Icon with Gradient */}
                  <div className="relative w-32 h-32 mx-auto mt-2 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full blur-2xl opacity-60 group-hover:opacity-90 transition-opacity"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                      <Globe className="w-16 h-16 text-white" />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col items-center justify-center -mt-4 space-y-2">
                    {/* Title */}
                    <h3 className="max-w-xs !pb-0 !m-0 font-extrabold text-3xl text-center text-slate-900 dark:text-white tracking-tight" style={{ lineHeight: language === 'th' ? '1.4' : '1.2' }}>
                      {language === 'th' ? 'ณต' : "N'Not"}
                    </h3>
                    
                    {/* Subtitle with gradient */}
                    <div className="text-lg !m-0 !p-0 font-semibold text-center">
                      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Full-Stack Developer
                      </span>
                    </div>
                  </div>

                  {/* Stats with glassmorphism */}
                  <div className="grid grid-cols-3 gap-4 w-full px-2 my-2">
                    <div className="text-center space-y-1 py-4 px-2 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-blue-700/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">6+</div>
                      <div className="text-[10px] font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider">Projects</div>
                    </div>
                    <div className="text-center space-y-1 py-4 px-2 bg-indigo-50/50 dark:bg-indigo-900/20 backdrop-blur-sm rounded-2xl border border-indigo-100/50 dark:border-indigo-700/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">3+</div>
                      <div className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-wider">Years</div>
                    </div>
                    <div className="text-center space-y-1 py-4 px-2 bg-purple-50/50 dark:bg-purple-900/20 backdrop-blur-sm rounded-2xl border border-purple-100/50 dark:border-purple-700/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">∞</div>
                      <div className="text-[10px] font-bold text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wider">Ideas</div>
                    </div>
                  </div>

                  {/* Tech Stack Icons with glassmorphism */}
                  <div className="flex justify-center gap-6 mb-2 px-4">
                    <div className="group relative w-14 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 dark:border-slate-700/50 hover:scale-110 hover:-rotate-3 transition-all cursor-default shadow-lg hover:shadow-xl">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <svg className="w-8 h-8 text-[#61DAFB] relative z-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/>
                      </svg>
                    </div>
                    
                    <div className="group relative w-14 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 dark:border-slate-700/50 hover:scale-110 hover:rotate-3 transition-all cursor-default shadow-lg hover:shadow-xl">
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <svg className="w-8 h-8 text-black dark:text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/>
                      </svg>
                    </div>
                    
                    <div className="group relative w-14 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 dark:border-slate-700/50 hover:scale-110 hover:-rotate-3 transition-all cursor-default shadow-lg hover:shadow-xl">
                      <div className="absolute inset-0 bg-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </svg>
                    </div>
                    
                    <div className="group relative w-14 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40 dark:border-slate-700/50 hover:scale-110 hover:rotate-3 transition-all cursor-default shadow-lg hover:shadow-xl">
                      <div className="absolute inset-0 bg-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <svg className="w-8 h-8 text-pink-600 dark:text-pink-400 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </PinContainer>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="w-full relative z-10 pb-24">
        <InfiniteMarquee />
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-slate-400/50 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-slate-600"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};
