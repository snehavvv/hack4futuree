import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useSpring, AnimatePresence } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState('');

  // Smooth springs for cursor position - Start offscreen (-100)
  const cursorX = useSpring(-100, { stiffness: 500, damping: 28, mass: 0.5 });
  const cursorY = useSpring(-100, { stiffness: 500, damping: 28, mass: 0.5 });
  const cursorXSlow = useSpring(-100, { stiffness: 150, damping: 25, mass: 1 });
  const cursorYSlow = useSpring(-100, { stiffness: 150, damping: 25, mass: 1 });

  useEffect(() => {
    const defaultCursor = document.body.style.cursor;
    document.body.style.cursor = 'none'; // Hide default cursor globally

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      cursorXSlow.set(e.clientX);
      cursorYSlow.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if pointing at a clickable element or an element with data-cursor
      const isClickable = target.closest('a') !== null || target.closest('button') !== null;
      const cursorData = target.closest('[data-cursor]');
      
      if (cursorData) {
        setIsHovering(true);
        setHoverText(cursorData.getAttribute('data-cursor') || 'VIEW');
      } else if (isClickable) {
        setIsHovering(true);
        setHoverText(''); // Just expand, no text
      } else {
        setIsHovering(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = defaultCursor;
    };
  }, [cursorX, cursorY, cursorXSlow, cursorYSlow]);

  return createPortal(
    <>
      {/* Outer trailing circle */}
      <motion.div
        className="fixed -top-4 -left-4 w-8 h-8 rounded-full border pointer-events-none z-[99999] flex items-center justify-center overflow-hidden backdrop-blur-md shadow-glow-premium transition-colors"
        style={{
          x: cursorXSlow,
          y: cursorYSlow,
        }}
        animate={{
          scale: isHovering ? (hoverText ? 3 : 2) : 1,
          borderColor: isHovering ? 'var(--text-primary)' : 'rgba(115, 115, 115, 0.3)',
          backgroundColor: hoverText ? 'var(--bg-glass)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <AnimatePresence>
          {hoverText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-[4px] font-mono font-black uppercase text-text-primary tracking-[0.2em]"
            >
              {hoverText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inner precise dot */}
      <motion.div
        className="fixed -top-1 -left-1 w-2 h-2 rounded-full pointer-events-none z-[100000]"
        style={{
          x: cursorX,
          y: cursorY,
          backgroundColor: 'var(--text-primary)',
        }}
        animate={{
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
    </>,
    document.body
  );
};
