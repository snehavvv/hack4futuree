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
  ShieldCheck,
  X
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [wcagLevel, setWcagLevel] = useState('AA');
  const [preset, setPreset] = useState('combined');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { status, progress, progressLabel, startAnalysis, reset } = useAnalysis();

  const previewUrlRef = useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      reset();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, [reset]);

  const handleFile = (file: File) => {
    // If there was a previous preview, revoke it
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    previewUrlRef.current = url;
  };

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      startAnalysis(urlInput, preset, wcagLevel);
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleFile(file);
        break; // only handle first image
      }
    }
  }, []);

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
    <div className="max-w-4xl mx-auto space-y-12 py-12" onPaste={handlePaste}>
      <header className="text-center space-y-8">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
          >
            <ShieldCheck size={12} className="text-text-muted" /> Secure Neural Processing
          </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-display font-black text-text-primary tracking-tighter leading-[0.95] uppercase"
        >
          Scale Your <br /><span className="text-text-muted opacity-30">Readability</span>
        </motion.h1>
      </header>

      <div className="grid gap-8">
        {/* Settings Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 relative z-20"
        >
          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border-white/10 shadow-panel">
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-black">Target WCAG</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <select 
              className="bg-transparent text-text-primary text-xs font-bold focus:outline-none cursor-pointer" 
              value={wcagLevel} 
              onChange={e => setWcagLevel(e.target.value)}
            >
              <option value="AA" className="bg-bg-primary">Level AA</option>
              <option value="AAA" className="bg-bg-primary">Level AAA</option>
            </select>
          </div>

          <div className="flex items-center gap-4 glass px-5 py-3 rounded-2xl border-white/10 shadow-panel">
            <span className="text-[9px] uppercase tracking-widest text-text-muted font-black">Simulation</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <select 
              className="bg-transparent text-text-primary text-xs font-bold focus:outline-none cursor-pointer" 
              value={preset} 
              onChange={e => setPreset(e.target.value)}
            >
              <option value="combined" className="bg-bg-primary">Combined (Default)</option>
              <option value="presbyopia" className="bg-bg-primary">Presbyopia</option>
              <option value="myopia" className="bg-bg-primary">Myopia</option>
              <option value="cataract" className="bg-bg-primary">Cataract</option>
              <option value="bright_sunlight" className="bg-bg-primary">Bright Sunlight</option>
              <option value="dim_lighting" className="bg-bg-primary">Low Light</option>
            </select>
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          onDragEnter={!selectedFile ? handleDrag : undefined}
          onDragLeave={!selectedFile ? handleDrag : undefined}
          onDragOver={!selectedFile ? handleDrag : undefined}
          onDrop={!selectedFile ? handleDrop : undefined}
          className={`
            relative aspect-video rounded-[48px] flex flex-col items-center justify-center gap-12
            transition-all duration-1000 border-2 group overflow-hidden bg-grain animate-scan
            ${selectedFile ? 'border-white/10 glass shadow-panel-premium' : dragActive 
              ? 'border-text-primary border-dashed bg-white/[0.03] scale-[1.01] shadow-panel-premium' 
              : 'border-white/5 border-dashed glass hover:border-white/10 hover:bg-white/[0.01] shadow-2xl cursor-pointer'}
          `}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
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

          {selectedFile ? (
            <div className="absolute inset-0 z-10 flex flex-col p-6 pointer-events-auto">
              <div className="flex-1 relative rounded-[32px] overflow-hidden bg-black/40 border border-white/5 mb-6">
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain" />
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (previewUrlRef.current) {
                      URL.revokeObjectURL(previewUrlRef.current);
                      previewUrlRef.current = null;
                    }
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/80 transition-colors"
                >
                  <X size={20} className="text-text-primary" />
                </button>
              </div>

              <div className="flex items-center justify-between px-6 bg-black/20 backdrop-blur-md rounded-3xl p-4 border border-white/5">
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-display font-medium text-text-primary truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB <span className="mx-2 opacity-30">|</span> Ready for Pipeline
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    startAnalysis(selectedFile, preset, wcagLevel);
                  }}
                  className="btn btn-primary px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase flex-shrink-0 shadow-glow-accent"
                >
                  Analyze Image
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative pointer-events-none">
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

              <div className="text-center space-y-6 relative z-10 pointer-events-none">
                <h3 className="text-4xl font-display font-black text-text-primary tracking-tighter uppercase">
                  {dragActive ? 'Initialize Upload' : 'Click to Upload'}
                </h3>
                <p className="text-[10px] text-text-muted font-technical tracking-[0.4em] uppercase font-black opacity-30">
                  SVG, PNG, JPG, PDF, WebP <span className="mx-3 opacity-20">|</span> 10MB Threshold
                </p>
              </div>

              <div className="flex items-center gap-8 pt-6 relative z-10 px-8 py-4 rounded-full glass border-white/5 text-[9px] text-text-muted font-technical font-black tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Clipboard size={14} className="text-text-muted" />
                <span>Cmd + V <span className="opacity-20 mx-3">|</span> Memory Paste</span>
              </div>
            </>
          )}
        </motion.div>

        {/* URL Input */}
        {!selectedFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-8 max-w-2xl mx-auto w-full"
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
                Analyze Target
              </button>
            </form>
          </motion.div>
        )}

        {/* Showcase Grid */}
        {!selectedFile && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-10 pt-10"
          >
            {[
              { icon: Zap, title: "Neural Processing", desc: "Instant scoring based on high-fidelity cognitive models." },
              { icon: Eye, title: "Vision Simulator", desc: "Real-time perception analysis for diverse visual thresholds." },
              { icon: ShieldCheck, title: "WCAG Fidelity", desc: "Automated compliance audit against Level AAA targets." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="glass p-10 border-white/5 shadow-2xl rounded-[32px] group transition-all duration-700 hover:border-white/10"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center mb-8 border border-white/5 group-hover:bg-text-primary transition-all duration-1000">
                  {React.createElement(feature.icon as any, { 
                    size: 24, 
                    className: "text-text-muted group-hover:text-bg-primary transition-all duration-700" 
                  })}
                </div>
                <h3 className="text-xl font-display font-black text-text-primary mb-3 uppercase tracking-tighter">{feature.title}</h3>
                <p className="text-sm text-text-secondary font-body font-light leading-relaxed opacity-40 group-hover:opacity-80 transition-opacity">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
