import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('squintscale-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('squintscale-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-12 rounded-full glass flex items-center justify-center relative overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 group border-white/10 dark:border-white/5 shadow-2xl bg-white/5"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: 15, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -15, opacity: 0, scale: 0.8 }}
          transition={{ 
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative z-10 text-text-primary"
        >
          {theme === 'dark' ? (
            <Moon size={20} strokeWidth={2.5} />
          ) : (
            <Sun size={20} strokeWidth={2.5} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
};
