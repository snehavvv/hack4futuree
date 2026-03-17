import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  Link as LinkIcon, 
  Loader2,
  Image as ImageIcon,
  Clipboard,
  Zap,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.4
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

export const UploadPage: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { status, progress, progressLabel, startAnalysis } = useAnalysis();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startAnalysis(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      startAnalysis(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      startAnalysis(urlInput);
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) startAnalysis(file);
      }
    }
  }, [startAnalysis]);

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 max-w-2xl mx-auto px-4">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border-4 border-white/5 border-t-text-primary flex items-center justify-center shadow-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-text-muted" size={32} />
          </div>
        </div>
        
        <div className="text-center space-y-4 w-full">
          <h2 className="text-3xl font-display font-bold text-text-primary tracking-tight">{progressLabel}</h2>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-text-primary shadow-glow-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.3em]">{progress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12" onPaste={handlePaste}>
      <header className="text-center space-y-8">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
          >
            <ShieldCheck size={12} className="text-text-muted" /> Secure Neural Processing
          </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-display font-black text-text-primary tracking-tighter leading-[0.95] uppercase"
        >
          Scale Your <br /><span className="text-text-muted opacity-30">Readability</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto font-body font-light opacity-60 leading-relaxed"
        >
          Initialize the neural core by uploading your design assets. Instant accessibility intelligence with zero configurations.
        </motion.p>
      </header>

      <div className="grid gap-16">
        {/* Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative aspect-video rounded-[48px] flex flex-col items-center justify-center gap-12 cursor-pointer
            transition-all duration-1000 border-2 border-dashed group overflow-hidden bg-grain animate-scan
            ${dragActive 
              ? 'border-text-primary bg-white/[0.03] scale-[1.01] shadow-panel-premium' 
              : 'border-white/5 glass hover:border-white/10 hover:bg-white/[0.01] shadow-2xl'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-dot-grid opacity-[0.2] pointer-events-none" />
          <div className={`absolute inset-0 transition-opacity duration-1000 bg-radial-at-c from-white/[0.03] to-transparent ${dragActive ? 'opacity-100' : 'opacity-0'}`} />
          
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*,.pdf,.svg" 
            onChange={handleChange}
          />
          
          <div className="relative">
            <motion.div 
              className="w-32 h-32 rounded-[32px] bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all duration-1000 shadow-glow-premium"
              whileHover={{ rotate: [0, -2, 2, 0], scale: 1.05 }}
            >
              <UploadIcon size={48} className={`transition-colors duration-1000 ${dragActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
            </motion.div>
            
            <motion.div 
              animate={{ 
                y: dragActive ? [-20, -40, -20] : [0, -25, 0],
                rotate: dragActive ? [0, 8, -8, 0] : 0
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-20 h-20 rounded-3xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-panel"
            >
              <ImageIcon size={32} className="text-text-muted" />
            </motion.div>
          </div>

          <div className="text-center space-y-6 relative z-10">
            <h3 className="text-4xl font-display font-black text-text-primary tracking-tighter uppercase">
              {dragActive ? 'Initialize Upload' : 'Click to Upload'}
            </h3>
            <p className="text-[10px] text-text-muted font-technical tracking-[0.4em] uppercase font-black opacity-30">
              SVG, PNG, JPG, or WebP <span className="mx-3 opacity-20">|</span> 10MB Threshold
            </p>
          </div>

          <div className="flex items-center gap-8 pt-6 relative z-10 px-8 py-4 rounded-full glass border-white/5 text-[9px] text-text-muted font-technical font-black tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
            <Clipboard size={14} className="text-text-muted" />
            <span>Cmd + V <span className="opacity-20 mx-3">|</span> Memory Paste</span>
          </div>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-6">
            <div className="h-[1px] flex-1 bg-white/5" />
            <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-text-muted opacity-40">Or analyze from URL</p>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          
          <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-primary transition-colors" size={20} />
              <input 
                type="url" 
                placeholder="https://example.com/screenshot.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="glass-input pl-14 h-16 text-base focus:ring-0 transition-all border-white/10"
              />
            </div>
            <button 
              type="submit" 
              disabled={!urlInput}
              className="btn btn-primary whitespace-nowrap px-12 h-16 text-xs font-black tracking-[0.3em] uppercase rounded-2xl transition-all disabled:opacity-30"
            >
              Start Analysis
            </button>
          </form>
        </motion.div>

        {/* Showcase Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-10 pt-20"
        >
          {[
            { icon: Zap, title: "Neural Processing", desc: "Instant scoring based on high-fidelity cognitive models." },
            { icon: Eye, title: "Vision Simulator", desc: "Real-time perception analysis for diverse visual thresholds." },
            { icon: ShieldCheck, title: "WCAG Fidelity", desc: "Automated compliance audit against Level AAA targets." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              whileHover={{ y: -15, scale: 1.02 }}
              className="glass p-12 border-white/5 shadow-2xl rounded-[40px] group transition-all duration-700 hover:border-white/10"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-10 border border-white/5 group-hover:bg-text-primary transition-all duration-1000">
                {React.createElement(feature.icon as any, { 
                  size: 32, 
                  className: "text-text-muted group-hover:text-bg-primary transition-all duration-700" 
                })}
              </div>
              <h3 className="text-2xl font-display font-black text-text-primary mb-5 uppercase tracking-tighter">{feature.title}</h3>
              <p className="text-lg text-text-secondary font-body font-light leading-relaxed opacity-40 group-hover:opacity-80 transition-opacity">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
