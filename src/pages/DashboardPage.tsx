import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, FileImage, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/apiClient';
import { Link } from 'react-router-dom';
import type { AnalysisListItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    avgScore: 0,
    recentScore: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await apiClient.get<AnalysisListItem[]>('/analyses/?limit=5');
        setAnalyses(data);
        
        if (data.length > 0) {
          const completed = data.filter(a => a.status === 'completed' && a.squint_score !== null);
          const total = completed.length;
          const sum = completed.reduce((acc, a) => acc + (a.squint_score || 0), 0);
          
          setMetrics({
            total: data.length, // total including pending
            avgScore: total > 0 ? Math.round(sum / total) : 0,
            recentScore: completed[0]?.squint_score || 0
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-display font-black text-text-primary tracking-tighter uppercase">
          Welcome back, <br /><span className="text-text-muted opacity-50">{user?.displayName}</span>
        </h1>
        <p className="text-text-muted font-body font-light max-w-2xl">
          Here is the current state of your neural readability analyses.
        </p>
      </header>

      {/* Metrics Array */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Total Scans', value: metrics.total.toString(), icon: Activity, color: 'text-cyan' },
          { label: 'Avg Network Score', value: metrics.avgScore > 0 ? metrics.avgScore.toString() : '--', icon: Zap, color: 'text-purple' },
          { label: 'Latest Fidelity', value: metrics.recentScore > 0 ? metrics.recentScore.toString() : '--', icon: Clock, color: 'text-text-primary' }
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="glass p-8 rounded-3xl border-white/5 space-y-4 shadow-panel group hover:border-white/10 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5 ${metric.color}`}>
              <metric.icon size={24} className="stroke-[1.5]" />
            </div>
            <div>
              <p className="text-[10px] font-technical font-black tracking-[0.3em] uppercase text-text-muted opacity-50 mb-2">
                {metric.label}
              </p>
              <p className="text-4xl font-display font-black text-text-primary">
                {loading ? <span className="animate-pulse">...</span> : metric.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-text-primary uppercase tracking-tighter">Recent Telemetry</h2>
          <Link to="/history" className="text-xs font-technical uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors flex items-center gap-2">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="glass rounded-3xl border-white/5 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-text-primary animate-spin" />
            </div>
          ) : analyses.length === 0 ? (
            <div className="p-16 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/5">
                <FileImage size={32} className="text-text-muted opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-display font-medium text-text-primary">No scans detected</p>
                <p className="text-sm text-text-muted font-light">Initialize your first neural analysis.</p>
              </div>
              <Link to="/upload" className="btn btn-primary inline-flex mt-4">
                Start Analysis
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {analyses.map(analysis => (
                <Link 
                  key={analysis.id} 
                  to={`/results/${analysis.id}`}
                  className="flex items-center gap-6 p-6 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden border border-white/5 flex-shrink-0 relative">
                    {analysis.original_image_path ? (
                      <img src={analysis.original_image_path} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <FileImage className="absolute inset-0 m-auto text-text-muted/30" size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border ${
                        analysis.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        analysis.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-white/5 text-text-muted border-white/10'
                      }`}>
                        {analysis.status}
                      </span>
                      <span className="text-xs text-text-muted font-mono">{new Date(analysis.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-display font-bold text-text-primary truncate uppercase tracking-tight">
                      {analysis.simulation_preset} Analysis
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-technical uppercase tracking-widest text-text-muted mb-1 opacity-50">Score</p>
                    <p className="text-2xl font-display font-black text-text-primary">
                      {analysis.status === 'completed' && analysis.squint_score !== null ? analysis.squint_score : '--'}
                    </p>
                  </div>
                  
                  <ArrowRight className="text-text-muted opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
