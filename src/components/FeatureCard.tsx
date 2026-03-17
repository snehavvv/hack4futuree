import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, className = '' }) => {
  return (
    <motion.div
      className={`glass-panel-premium p-8 flex flex-col justify-between h-full min-h-[300px] min-w-[320px] max-w-[400px] group transition-all duration-500 hover:border-text-primary/30 relative overflow-hidden ${className}`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      data-cursor="EXPLORE"
    >
      {/* Subtle glow effect behind the card content */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="z-10 relative">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-bg-surface border border-border-glass flex items-center justify-center mb-6 text-text-primary shadow-glow-premium group-hover:scale-110 transition-transform duration-500">
            {icon}
          </div>
        )}
        <h3 className="text-2xl font-display font-bold mb-4 text-text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed font-body">
          {description}
        </p>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-text-primary/5 blur-2xl rounded-full group-hover:bg-text-primary/10 transition-colors duration-500 pointer-events-none z-0" />
    </motion.div>
  );
};
