import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Code } from 'lucide-react';
import type { Suggestion } from '../types';
import { useToast } from './Toast';
import { copyToClipboard } from '../lib/exportUtils';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as any
    }
  }
};

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions }) => {
  const [expandedId, setExpandedId] = useState<string | null>(suggestions[0]?.id || null);
  const { addToast } = useToast();

  const handleCopy = async (code: string) => {
    await copyToClipboard(code);
    addToast('CSS snippet captured', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6 px-2">
        <Zap size={18} className="text-text-primary opacity-50 shadow-glow-premium" />
        <h3 className="text-[11px] font-technical font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Intelligence Fixes</h3>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-4"
      >
        {suggestions.map((s) => (
          <motion.div 
            key={s.id}
            variants={itemVariants}
            className={`glass overflow-hidden transition-all duration-500 border-white/5 rounded-3xl ${expandedId === s.id ? 'border-white/20 bg-white/[0.04] shadow-2xl' : 'hover:border-white/10'}`}
          >
            <button 
              onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
              className="w-full flex items-center justify-between p-6 text-left group"
            >
              <div className="flex items-center gap-5">
                <span className={`text-[9px] font-technical font-black px-3 py-1 rounded-full border border-white/10 bg-white/5 uppercase tracking-[0.3em] ${s.impact === 'high' ? 'text-text-primary' : 'text-text-muted opacity-40'}`}>
                  {s.impact}
                </span>
                <span className="font-display font-black text-text-primary text-sm group-hover:opacity-70 transition-opacity uppercase tracking-tighter">{s.title}</span>
              </div>
              <motion.div
                animate={{ rotate: expandedId === s.id ? 180 : 0 }}
                className="text-text-muted group-hover:text-text-primary transition-colors"
              >
                <ChevronDown size={18} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedId === s.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="p-6 pt-0 space-y-6 border-t border-white/5 mt-2">
                    <p className="text-sm text-text-secondary font-body font-light leading-relaxed opacity-80">
                      {s.description}
                    </p>
                    
                    {s.cssFix && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-technical font-black uppercase tracking-[0.4em] text-text-muted flex items-center gap-2 opacity-40">
                            <Code size={14} className="opacity-50" /> Suggested fix payload
                          </span>
                          <button 
                            onClick={() => handleCopy(s.cssFix!)}
                            className="text-[9px] font-technical font-black uppercase tracking-[0.4em] text-text-primary hover:opacity-100 opacity-40 transition-opacity flex items-center gap-2"
                          >
                            Copy Logic
                          </button>
                        </div>
                        <pre className="glass bg-white/[0.02] p-6 rounded-2xl border border-white/5 text-[11px] font-mono overflow-x-auto text-text-primary/70 whitespace-pre-wrap leading-relaxed shadow-inner">
                          {s.cssFix}
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
