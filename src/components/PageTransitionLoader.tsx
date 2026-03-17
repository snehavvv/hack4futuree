import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

export const PageTransitionLoader: React.FC = () => {
  const location = useLocation();
  const [isPresent, setIsPresent] = useState(false);

  useEffect(() => {
    setIsPresent(true);
    const timer = setTimeout(() => setIsPresent(false), 1200); // Loader duration
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isPresent && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-bg-base flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent to-bg-base pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-text-primary rounded-3xl flex items-center justify-center shadow-glow-premium">
              <Eye size={40} className="text-bg-primary" />
            </div>
            
            <div className="overflow-hidden">
              <motion.h2 
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase text-text-primary"
              >
                Initializing <span className="opacity-30">Neural Core</span>
              </motion.h2>
            </div>
            
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
                className="w-1/2 h-full bg-text-primary rounded-full shadow-[0_0_10px_currentColor]"
              />
            </div>
          </motion.div>
          
          <div className="absolute bottom-10 left-10 text-[10px] uppercase font-technical font-black tracking-[0.4em] text-text-muted opacity-40">
            SquintScale Web Interface v2.3
          </div>
          <div className="absolute bottom-10 right-10 text-[10px] uppercase font-technical font-black tracking-[0.4em] text-text-muted opacity-40">
            Establishing Secure Link
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
