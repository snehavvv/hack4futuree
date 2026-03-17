import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { WCAGIssue } from '../types';

interface WCAGChecklistProps {
  issues: WCAGIssue[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

export const WCAGChecklist: React.FC<WCAGChecklistProps> = ({ issues }) => {
  const [filter, setFilter] = useState<'all' | 'fail' | 'pass'>('all');
  
  const stats = {
    total: issues.length,
    passed: issues.filter(i => i.status === 'pass').length,
    failed: issues.filter(i => i.status === 'fail').length,
    warnings: issues.filter(i => i.status === 'warning').length,
  };

  const filteredIssues = issues.filter(i => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-technical font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Compliance Matrix</h3>
          <div className="flex gap-6 text-[9px] font-technical font-black uppercase tracking-[0.3em] opacity-40">
            <span className="text-text-primary opacity-100">{stats.passed} Pass</span>
            <span>{stats.failed} Fail</span>
            <span>{stats.warnings} Flag</span>
          </div>
        </div>

        <div className="flex gap-3">
          {(['all', 'fail', 'pass'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-technical font-black uppercase tracking-[0.3em] transition-all border ${
                filter === f 
                  ? 'bg-text-primary text-bg-primary border-transparent shadow-panel-premium' 
                  : 'bg-white/[0.02] text-text-muted border-white/5 hover:border-white/20'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar"
      >
        <AnimatePresence mode="popLayout">
          {filteredIssues.map((issue) => (
            <motion.div
              key={issue.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 20 }}
              className="group flex items-start gap-6 p-6 glass border-white/5 transition-all hover:bg-white/[0.03] rounded-[32px] hover:border-white/20"
            >
              <div className="mt-1 opacity-70 group-hover:opacity-100 transition-opacity text-text-primary">
                {issue.status === 'pass' && <CheckCircle2 size={20} />}
                {issue.status === 'fail' && <XCircle size={20} className="text-text-muted" />}
                {issue.status === 'warning' && <AlertTriangle size={20} className="text-text-secondary" />}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-technical font-black text-text-muted opacity-30 group-hover:opacity-60 transition-opacity tracking-[0.2em] uppercase">{issue.criterion}</span>
                  <span className="text-[9px] font-technical font-black px-3 py-1 rounded-full border border-white/5 bg-white/[0.02] text-text-muted uppercase tracking-[0.2em] opacity-40">
                    Lvl {issue.level}
                  </span>
                </div>
                <p className="text-base font-display font-black text-text-primary leading-tight uppercase tracking-tighter mb-2">{issue.title}</p>
                <p className="text-[13px] text-text-secondary font-body font-light leading-relaxed opacity-60 group-hover:opacity-80 transition-opacity">{issue.description}</p>
                
                {issue.element && (
                  <div className="pt-4">
                    <span className="text-[9px] uppercase font-technical font-black text-text-muted tracking-[0.4em] opacity-30">Segment Context</span>
                    <div className="mt-3 px-4 py-3 bg-white/[0.02] rounded-2xl border border-white/5 text-[10px] font-mono text-text-muted/60 break-all leading-relaxed shadow-inner">
                      {issue.element}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
