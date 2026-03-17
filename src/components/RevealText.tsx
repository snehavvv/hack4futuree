import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface RevealTextProps {
  text: string;
  className?: string;
}

export const RevealText: React.FC<RevealTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this specific text container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 45%"], // Start revealing when it enters bottom 85%, fully revealed by middle 45%
  });

  const words = text.split(' ');

  return (
    <div ref={containerRef} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        // Calculate a staggered reveal range for each word based on its index
        const start = i / words.length;
        const end = start + (1 / words.length);
        
        // Transform the global scroll progress of the container into specific properties for this word
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
        const filter = useTransform(scrollYProgress, [start, end], ['blur(8px)', 'blur(0px)']);
        const color = useTransform(
          scrollYProgress, 
          [start, end], 
          ['var(--text-muted)', 'var(--text-primary)']
        );

        return (
          <motion.span
            key={i}
            className="mr-[0.25em] mb-[0.1em]"
            style={{
              opacity,
              filter,
              color,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};
