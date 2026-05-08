import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollytellingSectionProps {
  children: React.ReactNode;
  mode?: 'horizontal' | 'vertical';
}

export const ScrollytellingSection: React.FC<ScrollytellingSectionProps> = ({ children, mode = 'horizontal' }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <section ref={targetRef} className={`relative ${mode === 'horizontal' ? 'h-[300vh]' : 'h-auto'} bg-bg-base`}>
      <div className={`${mode === 'horizontal' ? 'sticky top-0 h-screen flex flex-col justify-center' : 'relative'} overflow-hidden w-full perspective-[2000px]`}>
        {/* Optional Section Header */}
        <div className="absolute top-24 left-8 md:left-24 z-20 pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text-primary opacity-20 uppercase tracking-[0.3em]">
            Capabilities
          </h2>
        </div>

        {mode === 'horizontal' ? (
          <motion.div style={{ x }} className="flex gap-12 px-8 md:px-24 items-center">
            {children}
          </motion.div>
        ) : (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};
