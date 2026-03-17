import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Split } from 'lucide-react';

interface ImageComparisonProps {
  original: string;
  simulated: string;
}

export const ImageComparison: React.FC<ImageComparisonProps> = ({ original, simulated }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizing || !containerRef.current || viewMode === 'side-by-side') return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pos = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  useEffect(() => {
    const handleUp = () => setIsResizing(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-white uppercase tracking-widest">Visual Comparison</h3>
        <div className="flex glass p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setViewMode('slider')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'slider' ? 'bg-white/10 text-cyan shadow-glow' : 'text-text-muted hover:text-white'}`}
            title="Slider View"
          >
            <Split size={18} />
          </button>
          <button 
            onClick={() => setViewMode('side-by-side')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'side-by-side' ? 'bg-white/10 text-cyan shadow-glow' : 'text-text-muted hover:text-white'}`}
            title="Side by Side"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`relative overflow-hidden glass aspect-video w-full cursor-col-resize ${viewMode === 'side-by-side' ? 'flex' : ''}`}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {viewMode === 'slider' ? (
          <>
            {/* Original Image */}
            <div className="absolute inset-0">
              <img src={original} alt="Original" className="w-full h-full object-contain" />
              <div className="absolute top-4 left-4 glass px-3 py-1 text-[10px] font-mono font-bold text-neon-success border-neon-success/30 rounded-full">ORIGINAL</div>
            </div>

            {/* Simulated Image */}
            <div 
              className="absolute inset-0" 
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <img src={simulated} alt="Simulated" className="w-full h-full object-contain" />
              <div className="absolute top-4 right-4 glass px-3 py-1 text-[10px] font-mono font-bold text-neon-danger border-neon-danger/30 rounded-full">SIMULATED</div>
            </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-cyan z-20 cursor-col-resize shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsResizing(true)}
              onTouchStart={() => setIsResizing(true)}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass text-cyan flex items-center justify-center shadow-glow border-white/20">
                <Split size={20} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 relative border-r border-white/5">
              <img src={original} alt="Original" className="w-full h-full object-contain" />
              <div className="absolute top-2 left-2 glass px-2 py-0.5 text-[8px] font-mono font-bold text-neon-success rounded-full">ORIGINAL</div>
            </div>
            <div className="flex-1 relative">
              <img src={simulated} alt="Simulated" className="w-full h-full object-contain" />
              <div className="absolute top-2 left-2 glass px-2 py-0.5 text-[8px] font-mono font-bold text-neon-danger rounded-full">SIMULATED</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};