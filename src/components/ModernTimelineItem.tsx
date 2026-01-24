import { motion } from "framer-motion";

interface ModernTimelineItemProps {
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  index: number;
  onClick?: () => void;
}

export const ModernTimelineItem = ({
  year,
  title,
  subtitle,
  description,
  badge,
  index,
  onClick,
}: ModernTimelineItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative pl-6 md:pl-8 pb-6 md:pb-8 last:pb-0 group"
    >
      {/* Timeline dot */}
      <motion.div
        className="absolute left-0 top-2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-primary shadow-lg"
        whileInView={{ scale: [0, 1.2, 1] }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-primary"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Timeline line */}
      <div className="absolute left-[5px] md:left-[7px] top-6 w-0.5 h-full bg-gradient-to-b from-border via-border/50 to-transparent" />

      <motion.div
        onClick={onClick}
        className={`glass rounded-xl p-4 md:p-6 border border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
        whileHover={{ scale: 1.02, x: 5 }}
      >
        <div className="flex items-start justify-between mb-2 md:mb-3 flex-wrap gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider px-2 md:px-3 py-1 rounded-full glass-strong border border-primary/20">
            {year}
          </span>
          {badge && (
            <motion.span
              className="px-2 md:px-3 py-1 text-xs rounded-full bg-gradient-primary text-primary-foreground font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  "0 0 20px hsla(var(--primary), 0.3)",
                  "0 0 30px hsla(var(--primary), 0.5)",
                  "0 0 20px hsla(var(--primary), 0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {badge}
            </motion.span>
          )}
        </div>

        <h4 className="text-base md:text-lg font-bold text-foreground mb-2 group-hover:gradient-text transition-all">
          {title}
        </h4>

        {subtitle && (
          <p className="text-xs md:text-sm text-primary/80 mb-2 md:mb-3 font-medium">{subtitle}</p>
        )}

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </motion.div>
    </motion.div>
  );
};
