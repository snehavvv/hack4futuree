import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`glass-panel-premium p-10 flex flex-col justify-between h-full min-h-[350px] min-w-[320px] max-w-[450px] group transition-all duration-500 hover:border-text-primary/40 relative overflow-hidden ${className}`}
      whileHover={{ y: -12, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      data-cursor="EXPLORE"
    >
      {/* 3D Gloss / Shine Effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          transform: "translateZ(50px)",
        }}
      />

      <div className="z-10 relative" style={{ transform: "translateZ(30px)" }}>
        {icon && (
          <motion.div 
            className="w-20 h-20 rounded-2xl bg-bg-surface border border-border-glass flex items-center justify-center mb-8 text-text-primary shadow-glow-premium transition-all duration-500"
            style={{ transform: "translateZ(60px)" }}
          >
            {icon}
          </motion.div>
        )}
        <h3 className="text-3xl font-display font-black mb-6 text-text-primary tracking-tighter uppercase leading-none">
          {title}
        </h3>
        <p className="text-text-secondary text-xl leading-relaxed font-body font-light opacity-70">
          {description}
        </p>
      </div>
      
      {/* Decorative corner accent with 3D depth */}
      <div 
        className="absolute -bottom-10 -right-10 w-40 h-40 bg-text-primary/5 blur-3xl rounded-full group-hover:bg-text-primary/10 transition-colors duration-500 pointer-events-none z-0" 
        style={{ transform: "translateZ(-20px)" }}
      />
    </motion.div>
  );
};
