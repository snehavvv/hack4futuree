import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollytellingSectionProps {
  children: React.ReactNode;
}

export const ScrollytellingSection: React.FC<ScrollytellingSectionProps> = ({ children }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // The outer container dictates how much we have to scroll vertically
  // The inner targetRef is pinned (sticky) while we scroll the outer container
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Calculate the horizontal translation. 
  // -100% means we move it entirely to the left. 
  // Adjust the end value based on how much horizontal content there is.
  // Using -66% usually works well for 3-4 side-by-side cards taking up 300vw.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-bg-base">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden w-full">
        {/* Optional Section Header pinned to the left while cards scroll */}
        <div className="absolute top-24 left-8 md:left-24 z-20 pointer-events-none">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text-primary opacity-20 uppercase tracking-widest">
            Capabilities
          </h2>
        </div>

        {/* The horizontal scrolling motion track */}
        <motion.div style={{ x }} className="flex gap-8 px-8 md:px-24 items-center">
          {children}
        </motion.div>
      </div>
    </section>
  );
};
