import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Filter, 
  Calendar, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileImage
} from 'lucide-react';
import apiClient from '../lib/apiClient';
import { copyToClipboard } from '../lib/exportUtils';
import type { AnalysisListItem, ScoreBand } from '../types';
import { getScoreBand } from '../types';
import { useToast } from '../components/Toast';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterBand, setFilterBand] = useState<ScoreBand | 'all'>('all');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const LIMIT = 10;

  const fetchAnalyses = async (pageNum: number) => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<AnalysisListItem[]>(`/analyses/?page=${pageNum}&limit=${LIMIT}`);
      setAnalyses(data);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Failed to fetch analyses', error);
      addToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses(page);
  }, [page]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/analyses/${id}`);
      setAnalyses(analyses.filter(a => a.id !== id));
      addToast('Analysis deleted', 'info');
    } catch (error) {
      addToast('Failed to delete analysis', 'error');
    }
  };

  const filteredAnalyses = analyses.filter(a => {
    if (filterBand === 'all') return true;
    if (a.squint_score === null) return false;
    return getScoreBand(a.squint_score) === filterBand;
  });

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-black text-text-primary uppercase tracking-tighter leading-none">Intelligence <br /><span className="opacity-20">Archives</span></h1>
          <p className="text-xl text-text-secondary font-body font-light max-w-xl opacity-60">Manage and examine your previous readability intelligence reports with high-fidelity analytics.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
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

      {loading && analyses.length === 0 ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-text-primary animate-spin" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-24 glass rounded-[40px] border-white/5">
          <div className="w-20 h-20 rounded-[28px] bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
            <Filter size={32} className="text-text-muted" />
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary mb-4 uppercase tracking-tight">Archives Empty</h2>
          <p className="text-text-secondary mb-10 font-body font-light">Your history telemetry indicates no previous analyses.</p>
          <button 
            onClick={() => navigate('/upload')}
            className="btn btn-primary px-8 py-3 text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAnalyses.length > 0 ? (
              filteredAnalyses.map((item, index) => {
                const band = item.squint_score !== null ? getScoreBand(item.squint_score) : 'pending';
                const scoreColor = item.squint_score && item.squint_score >= 80 ? 'var(--text-primary)' : 
                                   item.squint_score && item.squint_score >= 50 ? 'var(--text-secondary)' : 'var(--text-muted)';
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => navigate(`/results/${item.id}`)}
                    className="group relative flex items-center gap-10 p-8 glass glass-hover border-white/5 cursor-pointer transition-all rounded-[40px] bg-white/[0.01] shadow-2xl relative overflow-hidden bg-grain"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-3xl glass flex-shrink-0 overflow-hidden border-white/5 bg-black/40 group-hover:border-white/10 transition-all duration-1000 relative">
                      {item.original_image_path ? (
                        <img 
                          src={item.original_image_path} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover filter grayscale opacity-20 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                        />
                      ) : (
                        <FileImage className="absolute inset-0 m-auto text-text-muted/30" size={24} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-3 relative z-10">
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-mono font-black px-3 py-1 rounded-full border ${
                          item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          item.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-white/5 text-text-muted border-white/10'
                        } uppercase tracking-[0.2em]`}>
                          {item.status}
                        </span>
                        <h3 className="text-2xl font-display font-black text-text-primary truncate uppercase tracking-tighter">
                          {item.simulation_preset} Scan
                        </h3>
                        {item.status === 'completed' && (
                          <span className="text-[9px] font-mono font-black px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-text-muted uppercase tracking-[0.3em]">
                            {band}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-8 text-[9px] text-text-muted font-mono font-black uppercase tracking-[0.4em] opacity-40">
                        <span className="flex items-center gap-3">
                          <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <span>ID: {item.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right px-12 border-x border-white/5 hidden sm:block relative z-10">
                      <p className="text-5xl font-mono font-black text-text-primary leading-none mb-3 tracking-tighter"
                         style={{ color: item.status === 'completed' ? scoreColor : 'var(--text-muted)' }}>
                        {item.status === 'completed' && item.squint_score !== null ? item.squint_score : '--'}
                      </p>
                      <p className="text-[9px] uppercase font-technical font-black text-text-muted tracking-[0.5em] opacity-20">Intelligence Rank</p>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 pr-2 relative z-20">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(`${window.location.origin}/results/${item.id}`);
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
                <p className="text-xl text-text-secondary font-body font-light">No records found matching your current filters.</p>
                <button 
                  onClick={() => setFilterBand('all')}
                  className="text-text-primary text-sm font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </AnimatePresence>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between glass p-4 rounded-3xl border-white/5 mt-8">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-xs font-black uppercase tracking-[0.2em] text-text-muted"
            >
              <ChevronLeft size={16} /> Previous Page
            </button>
            <span className="text-[10px] font-mono tracking-widest text-text-muted">Page {page}</span>
            <button 
              disabled={!hasMore}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl glass hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-xs font-black uppercase tracking-[0.2em] text-text-muted"
            >
              Next Page <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
