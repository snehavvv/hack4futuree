import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="text-excellent" size={20} />,
    error: <AlertCircle className="text-poor" size={20} />,
    warning: <AlertCircle className="text-moderate" size={20} />,
    info: <Info className="text-cyan" size={20} />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="glass-card flex items-center gap-3 p-4 pr-10 min-w-[300px] shadow-lg relative border-l-4"
      style={{ 
        borderLeftColor: type === 'success' ? 'var(--color-excellent)' : 
                         type === 'error' ? 'var(--color-poor)' : 
                         type === 'warning' ? 'var(--color-moderate)' : 
                         'var(--color-cyan)'
      }}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium text-text-primary">{message}</p>
      <button 
        onClick={() => onClose(id)}
        className="absolute right-2 top-2 p-1 text-text-tertiary hover:text-text-primary transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: ToastType }[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const ToastContext = React.createContext<{ addToast: (msg: string, type?: ToastType) => void } | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
