import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedText } from "./ui/AnimatedText";

import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const navItems = [
  { labelKey: "nav.home", href: "#home" },
  { labelKey: "nav.projects", href: "#projects" },
  { labelKey: "nav.about", href: "#about" },
  { labelKey: "nav.education", href: "#education" },
  { labelKey: "nav.experience", href: "#experience" },
  { labelKey: "nav.contact", href: "#contact" },
];

export const ModernNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:hidden lg:flex pt-safe"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "mt-4 md:mt-6 w-full max-w-7xl pointer-events-auto transition-all duration-500",
          "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md",
          "border border-white/50 dark:border-neutral-700/50",
          "rounded-full shadow-lg",
          isScrolled && "shadow-xl shadow-primary/10"
        )}
      >
        <div className="px-3 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Logo */}
            <motion.a
              href="#home"
              className="h-10 w-40 md:h-12 md:w-48 flex items-center justify-center flex-shrink-0 -my-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TextHoverEffect text="CodeX" />
            </motion.a>

            {/* Horizontal Scrollable Menu - Mobile & Tablet */}
            <div className="flex-1 lg:hidden overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1 min-w-max px-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2.5 text-xs font-medium rounded-full transition-all duration-300 whitespace-nowrap leading-relaxed",
                      "text-neutral-700 dark:text-neutral-300",
                      "hover:bg-primary/10 hover:text-primary dark:hover:text-primary",
                      "active:scale-95"
                    )}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatedText>{t(item.labelKey)}</AnimatedText>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 xl:px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-300 leading-relaxed",
                    "text-neutral-700 dark:text-neutral-300",
                    "hover:bg-primary/10 hover:text-primary dark:hover:text-primary",
                    "relative group"
                  )}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatedText>{t(item.labelKey)}</AnimatedText>
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId="navbar-hover"
                  />
                </motion.a>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              {/* Language Toggle */}
              <motion.button
                onClick={() => setLanguage(language === "th" ? "en" : "th")}
                className={cn(
                  "px-2 md:px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300",
                  "bg-neutral-100/80 dark:bg-neutral-800/80",
                  "hover:bg-primary/20 hover:text-primary",
                  "border border-neutral-200/50 dark:border-neutral-700/50",
                  "flex items-center gap-1 md:gap-1.5"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle language"
              >
                <Languages size={14} className="md:w-4 md:h-4" />
                <span className="text-xs font-bold">
                  <AnimatedText>{language.toUpperCase()}</AnimatedText>
                </span>
              </motion.button>

              {/* Theme Toggle */}
              <div className="scale-90 md:scale-100">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </div>
  );
};
