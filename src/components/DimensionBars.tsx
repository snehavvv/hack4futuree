import React from 'react';
import { motion } from 'framer-motion';
import type { AnalysisDimension } from '../types';
import * as LucideIcons from 'lucide-react';

interface DimensionBarsProps {
  dimensions: AnalysisDimension[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.5
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

export const DimensionBars: React.FC<DimensionBarsProps> = ({ dimensions }) => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-8 w-full"
    >
      {dimensions.map((dim) => {
        const Icon = (LucideIcons as any)[dim.icon.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')] || LucideIcons.BarChart2;
        
        const scoreColor = dim.score >= 80 ? 'text-text-primary' : 'text-text-muted';

        return (
          <motion.div 
            key={dim.name}
            variants={itemVariants}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-text-primary opacity-80">
                <Icon size={16} className="text-text-muted" />
                <span className="font-technical font-black text-[10px] uppercase tracking-[0.3em]">{dim.name}</span>
              </div>
              <span className={`font-technical font-black text-[10px] ${scoreColor}`}>{dim.score}%</span>
            </div>
            
            <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full rounded-full bg-text-primary"
                initial={{ width: 0 }}
                animate={{ width: `${dim.score}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  opacity: dim.score >= 80 ? 1 : 0.4
                }}
              />
            </div>
            <p className="text-[11px] text-text-muted font-body font-light leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{dim.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
