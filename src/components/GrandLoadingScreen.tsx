import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrandLoadingScreenProps {
  onComplete: () => void;
}

export const GrandLoadingScreen: React.FC<GrandLoadingScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 0: Initial setup (brief)
    const t1 = setTimeout(() => setStage(1), 500);
    // Stage 1: Typography scale & flare
    const t2 = setTimeout(() => setStage(2), 2500);
    // Stage 2: Neural linking bars
    const t3 = setTimeout(() => setStage(3), 4000);
    // Stage 3: Fade out and complete
    const t4 = setTimeout(() => {
      setStage(4);
      setTimeout(onComplete, 800); // Wait for fade out
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage < 4 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(20px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-bg-base flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Ambient Lighting */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 1 ? 0.3 : 0 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-primary)_0%,transparent_50%)] bg-no-repeat bg-center mix-blend-plus-lighter"
            style={{ backgroundSize: '150% 150%' }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* Core Typography */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(20px)' }}
              animate={{ 
                scale: stage === 1 ? 1.1 : stage >= 2 ? 1 : 0.8,
                opacity: stage >= 1 ? 1 : 0,
                filter: stage >= 1 ? 'blur(0px)' : 'blur(20px)',
                letterSpacing: stage >= 2 ? '0.1em' : '-0.05em'
              }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-display font-black uppercase text-text-primary tracking-tighter mb-4 text-glow"
            >
              Squint<span className="opacity-20">Scale</span>
            </motion.div>

            {/* Neural Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: stage >= 1 ? 0.6 : 0, y: stage >= 1 ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-sm md:text-base font-technical font-black tracking-[0.4em] uppercase text-text-secondary mb-16"
            >
              Initializing Neural Core
            </motion.div>

            {/* Loading Mechanism */}
            <div className="w-64 md:w-96 relative h-[2px] bg-white/10 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: stage >= 2 ? '0%' : stage === 1 ? '-40%' : '-100%' }}
                transition={{ duration: stage >= 2 ? 1.5 : 2, ease: "easeInOut" }}
                className="absolute inset-0 bg-text-primary shadow-[0_0_20px_var(--text-primary)] rounded-full"
              />
            </div>
            
            {/* System Status Numbers */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 1 : 0 }}
              className="mt-6 flex justify-between w-64 md:w-96 text-[10px] font-mono text-text-muted"
            >
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>SYS_BOOT_SEQ</motion.span>
              <motion.span>{stage >= 2 ? '100%' : '42%'}</motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
