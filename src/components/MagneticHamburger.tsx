import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface MagneticHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
}

export const MagneticHamburger: React.FC<MagneticHamburgerProps> = ({ isOpen, onClick }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    // Magnetic pull strength (closer to 1 = stronger)
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const resetMouse = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    controls.start({
      x: position.x,
      y: position.y,
      transition: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 }
    });
  }, [position, controls]);

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      onClick={onClick}
      animate={controls}
      className={`
        relative w-14 h-14 rounded-full flex items-center justify-center
        transition-colors duration-500 overflow-hidden group border border-white/5
        ${isOpen ? 'bg-white/10' : 'glass hover:bg-white/[0.03]'}
      `}
      aria-label="Toggle Menu"
    >
      {/* Hover background expanding effect */}
      <motion.div 
        initial={false}
        animate={{ scale: position.x !== 0 ? 1 : 0 }}
        className="absolute inset-0 bg-white/5 rounded-full z-0"
        transition={{ duration: 0.3 }}
      />

      {/* SVG Morphing Hamburger */}
      <div className="w-6 h-6 flex flex-col justify-center items-center gap-1.5 relative z-10">
        <motion.div
          animate={isOpen ? { rotate: 45, y: 8, backgroundColor: "#fff" } : { rotate: 0, y: 0, backgroundColor: "currentColor" }}
          className="w-6 h-0.5 rounded-full origin-center text-text-primary"
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          className="w-6 h-0.5 bg-current rounded-full text-text-primary origin-left"
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          animate={isOpen ? { rotate: -45, y: -8, backgroundColor: "#fff" } : { rotate: 0, y: 0, backgroundColor: "currentColor" }}
          className="w-6 h-0.5 rounded-full origin-center text-text-primary"
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        />
      </div>
    </motion.button>
  );
};
