import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { PageTransitionLoader } from './PageTransitionLoader';
import { MagneticHamburger } from './MagneticHamburger';
import { CustomCursor } from './CustomCursor';
import { ReactLenis } from 'lenis/react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Set theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('squintscale-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Set default sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide layout for auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthPage) return (
    <ReactLenis root>
      <CustomCursor />
      <PageTransitionLoader />
      <div className="relative z-10">
        <Outlet />
      </div>
    </ReactLenis>
  );

  return (
    <ReactLenis root>
      <div className="flex min-h-screen bg-transparent text-text-primary overflow-hidden relative font-body cursor-none">
        <CustomCursor />
        <PageTransitionLoader />
        {/* Background System */}
      <div className="bg-nebula pointer-events-none absolute inset-0 -z-10">
        <div className="nebula-blob w-[600px] h-[600px] -top-40 -right-40 animate-nebula opacity-[0.05]" />
        <div className="nebula-blob w-[800px] h-[800px] -bottom-60 -left-60 animate-nebula opacity-[0.05]" style={{ animationDelay: '-5s' }} />
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.2]" />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="h-[90px] flex items-center justify-between px-8 md:px-12 border-b border-white/5 glass sticky top-0 z-[60] rounded-none border-x-0 border-t-0 bg-bg-base/60 backdrop-blur-3xl">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="lg:hidden relative z-[1000] -ml-2">
              <MagneticHamburger isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
            </div>
            <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
              <img src="/logo.png" alt="SquintScale Logo" className="w-11 h-11 object-contain shadow-glow-premium rounded-xl group-hover:scale-110 transition-transform duration-500" />
              <h2 className="text-3xl font-display font-black text-text-primary tracking-tighter leading-none flex items-center gap-2 uppercase">
                Squint<span className="text-text-primary opacity-50 group-hover:opacity-100 transition-opacity">Scale</span>
                <span className="text-[10px] pb-1.5 opacity-20 font-mono tracking-tighter ml-1">v2.2</span>
              </h2>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button className="p-3 text-text-muted hover:text-text-primary transition-colors glass border-white/5 rounded-2xl">
              <Bell size={20} className="stroke-[1.5]" />
            </button>
            <button className="flex items-center gap-4 p-2 pr-5 rounded-2xl glass border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all font-body group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-text-primary via-white/80 to-text-muted flex items-center justify-center text-[10px] font-black text-bg-primary shadow-glow-premium group-hover:rotate-12 transition-transform">
                AI
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-1 opacity-50">Identity</span>
                <span className="text-xs font-bold text-text-primary tracking-tight">Premium Operative</span>
              </div>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-4 md:px-10 py-12 relative bg-grain">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
    </ReactLenis>
  );
};
