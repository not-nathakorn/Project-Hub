import { motion } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";

interface ModernProjectCardProps {
  title: string;
  description: string;
  url: string;
  icon?: string;
  tags?: string[];
  index: number;
}

export const ModernProjectCard = ({
  title,
  description,
  url,
  icon,
  tags,
  index,
}: ModernProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        {/* Card */}
        <motion.div
          className="relative glass rounded-2xl p-4 md:p-6 overflow-hidden border border-border/50 transition-all duration-500"
          whileHover={{
            scale: 1.02,
            y: -5,
          }}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              animate={{
                x: isHovered ? ["-100%", "200%"] : "0%",
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute -inset-1 bg-gradient-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10"
            animate={{
              scale: isHovered ? 1.05 : 1,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                {icon && (
                  <motion.span
                    className="text-3xl md:text-4xl"
                    animate={{
                      rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {icon}
                  </motion.span>
                )}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:gradient-text transition-all flex items-center gap-2">
                    {title}
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>
              </div>
              <motion.div
                animate={{
                  x: isHovered ? 5 : 0,
                  y: isHovered ? -5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </div>

            <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
              {description}
            </p>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + i * 0.05 }}
                    className="px-2 md:px-3 py-1 text-xs rounded-full glass-strong border border-primary/20 text-primary font-medium backdrop-blur-sm"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* Corner Accent */}
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 bg-gradient-primary opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500"
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </a>
    </motion.div>
  );
};
