import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface KineticTextProps {
  text: string;
  el?: React.ElementType;
  className?: string;
  delay?: number;
  highlightWords?: string[];
}

export const KineticText: React.FC<KineticTextProps> = ({ 
  text, 
  el: Wrapper = 'p', 
  className = '',
  delay = 0,
  highlightWords = []
}) => {
  const textArray = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -40,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="inline-block perspective-[1000px]"
      >
        {textArray.map((word, index) => {
          const isHighlight = highlightWords.includes(word.replace(/[^a-zA-Z]/g, ''));
          return (
            <motion.span 
              variants={child} 
              key={index} 
              className={`inline-block mr-[0.25em] ${isHighlight ? 'text-text-muted opacity-50' : ''}`}
              style={{ transformOrigin: "bottom center" }}
            >
              {word}
            </motion.span>
          );
        })}
      </motion.span>
    </Wrapper>
  );
};
