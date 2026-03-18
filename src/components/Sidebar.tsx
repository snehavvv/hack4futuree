import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  History,  Settings, 
  LogOut, 
  X,
  Search,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Direct Upload' },
    { to: '/history', icon: History, label: 'Analysis History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -300,
          width: isOpen ? 260 : 0
        }}
        className="fixed lg:sticky top-0 left-0 bottom-0 z-[500] glass border-r border-white/5 h-screen flex flex-col transition-all duration-300 overflow-hidden rounded-none border-y-0 border-l-0"
      >
        <div className="p-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-text-primary rounded-2xl flex items-center justify-center shadow-2xl">
              <Eye size={28} className="text-bg-primary" />
            </div>
            <span className="text-3xl font-display font-black tracking-tighter text-text-primary uppercase leading-none">
              Squint<span className="opacity-20">Scale</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-3 text-text-muted hover:text-text-primary glass rounded-xl border-white/5">
            <X size={24} />
          </button>
        </div>

          <motion.nav 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 px-6 py-6 space-y-3 overflow-y-auto custom-scrollbar"
          >
            <motion.div variants={itemVariants} className="px-3 mb-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Intelligence Search..." 
                  className="w-full glass bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs font-technical focus:outline-none focus:border-white/20 transition-all placeholder:text-text-muted/40 uppercase tracking-widest"
                />
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="px-5 text-[9px] uppercase font-technical font-black text-text-muted tracking-[0.5em] mb-6 opacity-30">Neural Hub</motion.p>
            
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) => `
                  relative flex items-center gap-5 px-6 py-5 rounded-[24px] transition-all group border
                  ${isActive 
                    ? 'glass bg-white/[0.03] text-text-primary border-white/10 shadow-panel' 
                    : 'text-text-muted hover:bg-white/[0.015] hover:text-text-primary border-transparent'}
                `}
              >
                <motion.div variants={itemVariants} className="flex items-center gap-5 w-full">
                  <item.icon size={20} className={`transition-transform group-hover:scale-110 ${location.pathname === item.to ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                  <span className="font-display font-black tracking-tighter text-[13px] uppercase">{item.label}</span>
                  
                  {location.pathname === item.to && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute right-0 w-1 h-8 bg-text-primary rounded-l-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            ))}
          </motion.nav>

        <div className="p-10 border-t border-white/5 bg-white/[0.01]">
          {user && (
            <div className="flex items-center gap-5 mb-10 px-2">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-primary font-display font-black text-xl">{user.displayName[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-black text-text-primary truncate tracking-tighter uppercase leading-none mb-1.5">{user.displayName}</p>
                <p className="text-[9px] font-technical text-text-muted truncate uppercase tracking-[0.3em] opacity-30">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="w-full flex items-center gap-5 px-6 py-5 rounded-[24px] text-text-muted hover:bg-white/[0.03] hover:text-text-primary border border-transparent hover:border-white/10 transition-all group font-display font-black tracking-widest text-[9px] uppercase"
          >
            <LogOut size={20} className="group-hover:translate-x-2 transition-transform stroke-[2]" />
            <span>Sign Out Access</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};
