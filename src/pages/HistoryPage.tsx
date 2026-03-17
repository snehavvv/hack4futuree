import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Filter, 
  Calendar, 
  ExternalLink
} from 'lucide-react';
import { getStoredAnalyses, deleteAnalysis } from '../lib/analysisEngine';
import { copyToClipboard } from '../lib/exportUtils';
import type { AnalysisResult, ScoreBand } from '../types';
import { getScoreBand } from '../types';
import { useToast } from '../components/Toast';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBand, setFilterBand] = useState<ScoreBand | 'all'>('all');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    setAnalyses(getStoredAnalyses());
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteAnalysis(id);
    setAnalyses(getStoredAnalyses());
    addToast('Analysis deleted', 'info');
  };

  const filteredAnalyses = analyses.filter(a => {
    const matchesSearch = a.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.jobId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBand = filterBand === 'all' || getScoreBand(a.squintScore) === filterBand;
    return matchesSearch && matchesBand;
  });

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black text-text-primary uppercase tracking-tighter leading-none">Intelligence <br /><span className="opacity-20">Archives</span></h1>
          <p className="text-xl text-text-secondary font-body font-light max-w-xl opacity-60">Manage and examine your previous readability intelligence reports with high-fidelity analytics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filter by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-14 w-80 h-14 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border-white/5"
            />
          </div>
          
          <div className="flex glass p-1.5 border-white/5 rounded-xl bg-white/[0.02]">
            {(['all', 'excellent', 'good', 'moderate', 'poor', 'critical'] as const).map(band => (
              <button
                key={band}
                onClick={() => setFilterBand(band)}
                className={`
                  px-4 py-2 rounded-lg text-[10px] font-mono font-black uppercase tracking-[0.2em] transition-all
                  ${filterBand === band ? 'bg-text-primary text-bg-primary shadow-2xl' : 'text-text-muted hover:text-text-primary'}
                `}
              >
                {band}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map((item, index) => {
              const band = getScoreBand(item.squintScore);
              const scoreColor = item.squintScore >= 80 ? 'var(--text-primary)' : item.squintScore >= 50 ? 'var(--text-secondary)' : 'var(--text-muted)';
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => navigate(`/results/${item.jobId}`)}
                  className="group relative flex items-center gap-10 p-8 glass glass-hover border-white/5 cursor-pointer transition-all rounded-[40px] bg-white/[0.01] shadow-2xl relative overflow-hidden bg-grain"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 rounded-3xl glass flex-shrink-0 overflow-hidden border-white/5 group-hover:border-white/10 transition-all duration-1000">
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover filter grayscale opacity-20 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-3 relative z-10">
                    <div className="flex items-center gap-6">
                      <h3 className="text-2xl font-display font-black text-text-primary truncate uppercase tracking-tighter">
                        {item.fileName || 'Archive Data'}
                      </h3>
                      <span className="text-[9px] font-mono font-black px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-text-muted uppercase tracking-[0.3em]">
                        {band}
                      </span>
                    </div>
                    <div className="flex items-center gap-8 text-[9px] text-text-muted font-mono font-black uppercase tracking-[0.4em] opacity-40">
                      <span className="flex items-center gap-3">
                        <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <span>SIG: {item.jobId.slice(0, 8)}</span>
                      <span className="px-3 py-1 rounded-lg glass bg-white/[0.02] border border-white/5 font-technical">
                        {item.preset}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right px-12 border-x border-white/5 hidden sm:block relative z-10">
                    <p className="text-5xl font-mono font-black text-text-primary leading-none mb-3 tracking-tighter"
                       style={{ color: scoreColor }}>
                      {item.squintScore}
                    </p>
                    <p className="text-[9px] uppercase font-technical font-black text-text-muted tracking-[0.5em] opacity-20">Intelligence Rank</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pr-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(`${window.location.origin}/results/${item.jobId}`);
                        addToast('Link copied to clipboard', 'info');
                      }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-text-primary hover:bg-white/10 transition-all"
                    >
                      <ExternalLink size={20} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, item.id)}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-24 text-center space-y-6 glass rounded-[40px] border-white/5">
              <div className="w-20 h-20 rounded-[28px] bg-white/5 flex items-center justify-center mx-auto border border-white/10 shadow-2xl">
                <Filter size={32} className="text-text-muted" />
              </div>
              <p className="text-xl text-text-secondary font-body font-light">No records found matching your current parameters.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterBand('all'); }}
                className="text-text-primary text-sm font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
              >
                Reset Filter Control
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
