import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  Link as LinkIcon, 
  Loader2,
  Clipboard,
  Zap,
  Eye,
  ShieldCheck,
  Camera as CameraIcon,
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
      const file = e.dataTransfer.files[0];
      handleFile(file);
      startAnalysis(file, preset, wcagLevel);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('[SquintScale] File selected:', file.name);
      handleFile(file);
      startAnalysis(file, preset, wcagLevel);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      startAnalysis(urlInput, preset, wcagLevel).catch(err => {
        console.error("URL analysis failed", err);
      });
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFile(file);
          startAnalysis(file, preset, wcagLevel);
        }
        break; // only handle first image
      }
    }
  }, [preset, wcagLevel, startAnalysis]);

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraActive(false);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    console.log('[SquintScale] Capture requested...');
    if (videoRef.current && canvasRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          console.log('[SquintScale] Image captured, converting to blob...');
          
          // Manual conversion to avoid fetch() issues with data URLs in some browsers
          const base64Data = dataUrl.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          console.log('[SquintScale] Photo ready, starting analysis...');
          stopCamera();
          startAnalysis(file, preset, wcagLevel);
        }
      } catch (err) {
        console.error('[SquintScale] Capture failed:', err);
        addToast('Failed to capture image. Please try again.', 'error');
      }
    } else {
      console.error('[SquintScale] Video or canvas ref missing');
    }
  };

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
          <p className="text-text-muted font-mono text-xs uppercase tracking-[0.2em]">{progress}% Complete</p>
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
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-text-muted text-xs font-bold uppercase tracking-[0.3em] mb-4"
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
            <span className="text-xs uppercase tracking-widest text-text-muted font-black">Target WCAG</span>
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
            <span className="text-xs uppercase tracking-widest text-text-muted font-black">Simulation</span>
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

        {/* Upload/Camera Zone */}
        <div className="relative aspect-video rounded-[48px] overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {isCameraActive ? (
              <motion.div 
                key="camera-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black flex flex-col z-50"
              >
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="flex-1 w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute top-8 right-8 flex gap-4">
                  <button 
                    onClick={stopCamera}
                    className="p-4 rounded-2xl glass bg-black/40 border-white/10 text-white hover:bg-black/60 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
                  <button 
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full border-4 border-white p-1 hover:scale-110 transition-transform"
                  >
                    <div className="w-full h-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="upload-zone"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                onDragEnter={!selectedFile ? handleDrag : undefined}
                onDragLeave={!selectedFile ? handleDrag : undefined}
                onDragOver={!selectedFile ? handleDrag : undefined}
                onDrop={!selectedFile ? handleDrop : undefined}
                className={`
                  absolute inset-0 flex flex-col items-center justify-center gap-12
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
                        <p className="text-xs text-text-muted font-mono uppercase tracking-widest mt-1">
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
                    <div className="relative flex gap-8 z-10">
                      <motion.div 
                        className="w-32 h-32 rounded-[32px] bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all duration-1000 shadow-glow-premium"
                        whileHover={{ rotate: [0, -2, 2, 0], scale: 1.05 }}
                      >
                        <UploadIcon size={48} className={`transition-colors duration-1000 ${dragActive ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                      </motion.div>
                      
                      <motion.div 
                        onClick={(e) => { e.stopPropagation(); startCamera(); }}
                        className="w-32 h-32 rounded-[32px] bg-white/[0.02] flex items-center justify-center border border-white/5 hover:border-text-primary transition-all duration-1000 shadow-glow-premium group/cam"
                        whileHover={{ rotate: [0, 2, -2, 0], scale: 1.05 }}
                      >
                        <CameraIcon size={48} className="text-text-muted group-hover/cam:text-text-primary transition-colors" />
                      </motion.div>
                    </div>

                    <div className="text-center space-y-6 relative z-10">
                      <h3 className="text-4xl font-display font-black text-text-primary tracking-tighter uppercase">
                        {dragActive ? 'Initialize Upload' : 'Upload or Scan'}
                      </h3>
                      <p className="text-xs text-text-muted font-technical tracking-[0.3em] uppercase font-black opacity-60">
                        File Drop <span className="mx-3 opacity-20">|</span> Camera Scan <span className="mx-3 opacity-20">|</span> Memory Paste
                      </p>
                    </div>

                    <div className="flex items-center gap-8 pt-6 relative z-10 px-8 py-4 rounded-full glass border-white/5 text-xs text-text-muted font-technical font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">
                      <Clipboard size={14} className="text-text-muted" />
                      <span>Cmd + V <span className="opacity-20 mx-3">|</span> Memory Paste</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL Input */}
        {!selectedFile && !isCameraActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-8 max-w-2xl mx-auto w-full"
          >
            <div className="flex items-center gap-6">
              <div className="h-[1px] flex-1 bg-white/5" />
              <p className="text-xs font-mono font-black uppercase tracking-[0.3em] text-text-muted opacity-60">Or analyze from URL</p>
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
                  required
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
                <p className="text-sm text-text-secondary font-body font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
