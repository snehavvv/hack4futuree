import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Share2,
  Plus,
  ChevronLeft,
  Layers,
  Settings2,
  FileJson,
  FileText
} from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { DimensionBars } from '../components/DimensionBars';
import { SuggestionsPanel } from '../components/SuggestionsPanel';
import { WCAGChecklist } from '../components/WCAGChecklist';
import { ImageComparison } from '../components/ImageComparison';
import { OnboardingTour } from '../components/OnboardingTour';
import { useToast } from '../components/Toast';
import { exportAsJSON, copyToClipboard } from '../lib/exportUtils';
import apiClient from '../lib/apiClient';
import type { AnalysisOut, AnalysisDimension, Suggestion, WCAGIssue } from '../types';
import { PRESET_CONFIGS } from '../types';

type ResultsData = AnalysisOut & {
  dimensions: AnalysisDimension[];
  mappedSuggestions: Suggestion[];
  mappedWcagIssues: WCAGIssue[];
};

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [result, setResult] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const heroScale = 1;
  const heroOpacity = 1;

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) return;
      try {
        const { data } = await apiClient.get<AnalysisOut>(`/analyses/${id}`);
        
        // Adapt backend shapes to frontend components
        const dimensions: AnalysisDimension[] = [
          { name: 'OCR Retention', score: Math.round(data.metrics?.ocr_retention_rate || 0), description: 'Text recognized vs original', icon: 'Type' },
          { name: 'Contrast', score: Math.round(data.metrics?.contrast_score || 0), description: 'Luminance distinguishability', icon: 'Sun' },
          { name: 'Font Size', score: Math.round(data.metrics?.font_size_score || 0), description: 'Legibility scaled sizing', icon: 'Type' },
          { name: 'Clutter', score: Math.round(data.metrics?.visual_clutter_score || 0), description: 'Edge density distraction', icon: 'Layout' },
          { name: 'Color', score: Math.round(data.metrics?.color_accessibility_score || 0), description: 'Distinguishability under deficiency', icon: 'Palette' },
        ];

        const mappedSuggestions: Suggestion[] = (data.suggestions || []).map((s, i) => ({
          id: String(s.rank || i),
          title: `Improve ${s.dimension || 'Readability'}`,
          description: s.suggestion_text || '',
          impact: (s.severity as any) || 'medium',
          category: s.dimension || 'General'
        }));

        const mappedWcagIssues: WCAGIssue[] = (data.wcag_issues || []).map((w, i) => ({
          id: `wcag-${i}`,
          criterion: w.criterion,
          title: `WCAG ${w.criterion} Issue`,
          description: w.description,
          level: data.wcag_level as any,
          status: (w.severity as any) || 'fail'
        }));

        setResult({
          ...data,
          dimensions,
          mappedSuggestions,
          mappedWcagIssues
        });
      } catch (err) {
        console.error('Failed to load analysis', err);
        addToast('Failed to load analysis results', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, addToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-2 border-white/10 border-t-text-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result || result.status !== 'completed') {
    return (
      <div className="text-center py-24 glass rounded-[40px] border-white/5 max-w-2xl mx-auto mt-12">
        <h2 className="text-3xl font-display font-bold text-text-primary mb-4 uppercase tracking-tight">Report Unavailable</h2>
        <p className="text-text-secondary mb-10 text-lg font-body font-light">
          {result?.status === 'failed' ? result.error_reason : 'The requested analysis intelligence could not be retrieved from the system core.'}
        </p>
        <button 
          onClick={() => navigate('/upload')}
          className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl"
        >
          Initiate New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto py-8">
      <OnboardingTour />
      {/* Header Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-8 sticky top-[-1px] z-40 glass py-10 px-12 border-x-0 border-t-0 rounded-none mb-20 bg-bg-base/40 backdrop-blur-3xl"
      >
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate('/history')}
            className="p-4 rounded-2xl glass bg-white/[0.01] border-white/5 text-text-muted hover:text-text-primary transition-all shadow-2xl"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-display font-black text-text-primary truncate max-w-[200px] md:max-w-none uppercase tracking-tighter leading-none mb-2">
              Neural Report
            </h1>
            <p className="text-[10px] text-text-muted font-technical font-black tracking-[0.5em] uppercase opacity-30">{result.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => {
            copyToClipboard(window.location.href);
            addToast('Intelligence link copied', 'info');
          }} className="p-4 rounded-2xl glass bg-white/[0.01] border-white/5 text-text-muted hover:text-text-primary transition-all">
            <Share2 size={24} />
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-4 px-8 py-4 glass bg-white/[0.01] border-white/5 text-[9px] font-black uppercase tracking-[0.4em] rounded-2xl text-text-muted hover:text-text-primary transition-all">
              <Download size={20} /> <span className="hidden sm:inline">Export Report</span>
            </button>
            <div className="absolute top-[calc(100%+12px)] right-0 w-64 hidden group-hover:block glass bg-bg-surface/80 shadow-panel z-50 overflow-hidden border-white/10 rounded-[24px]">
              <button 
                disabled={isGeneratingPDF}
                onClick={async () => {
                  setIsGeneratingPDF(true);
                  try {
                    // Try to GET first incase it exists
                    try {
                      const { data } = await apiClient.get(`/reports/${result.id}`);
                      window.open(data.report_url, '_blank');
                      setIsGeneratingPDF(false);
                      return;
                    } catch (err: any) {
                      if (err.response?.status !== 404) throw err;
                    }
                    
                    // Generate it
                    addToast('Generating Neural PDF Report...', 'info');
                    const { data } = await apiClient.post(`/reports`, { analysis_id: result.id });
                    window.open(data.report_url, '_blank');
                    addToast('Report generated successfully!', 'success');
                  } catch (err) {
                    console.error("PDF Export failed", err);
                    addToast('Failed to generate PDF Report. Note: PDF generation limits reached.', 'error');
                  } finally {
                    setIsGeneratingPDF(false);
                  }
                }}
                className="w-full flex items-center gap-5 px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 text-left transition-colors text-text-primary"
              >
                {isGeneratingPDF ? (
                   <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                   <FileText size={20} /> 
                )}
                {isGeneratingPDF ? 'Compiling...' : 'PDF Intelligence'}
              </button>
              <button 
                onClick={() => exportAsJSON(result)}
                className="w-full flex items-center gap-5 px-8 py-6 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 text-left transition-colors text-text-primary border-t border-white/5"
              >
                <FileJson size={20} /> JSON Data Core
              </button>
            </div>
          </div>

          <button 
            onClick={() => navigate('/upload')}
            className="btn btn-primary px-10 py-5 text-[9px] font-black uppercase tracking-[0.4em] rounded-2xl flex items-center gap-4 shadow-panel"
          >
            <Plus size={20} /> <span className="hidden sm:inline">New Analysis</span>
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grid lg:grid-cols-12 gap-10"
      >
        {/* Left Column: Visuals */}
        <div className="lg:col-span-8 space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-8 border-white/10 rounded-[40px] shadow-2xl"
          >
            <ImageComparison original={result.original_image_path || ''} simulated={result.degraded_image_path || result.original_image_path || ''} />
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-8 border-white/10 rounded-[32px] shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8 text-text-muted">
                <Settings2 size={20} className="opacity-50" />
                <h3 className="text-[11px] font-technical font-black uppercase tracking-[0.5em] opacity-40">Simulation Parameters</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(PRESET_CONFIGS).map(([key, config]) => (
                  <div
                    key={key}
                    className={`
                      px-4 py-5 rounded-2xl text-left transition-all border
                      ${result.simulation_preset === key 
                        ? 'bg-text-primary text-bg-primary border-transparent shadow-2xl scale-[1.02]' 
                        : 'bg-white/[0.02] text-text-secondary border-white/5 opacity-40'}
                    `}
                  >
                    <p className="text-xs font-black uppercase tracking-tight leading-tight">{config.label}</p>
                    <p className={`text-[9px] mt-1.5 leading-tight font-medium ${result.simulation_preset === key ? 'opacity-70' : 'opacity-40'}`}>
                      {config.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-8 border-white/10 rounded-[32px] shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8 text-text-muted">
                <Layers size={20} className="opacity-50" />
                <h3 className="text-[11px] font-technical font-black uppercase tracking-[0.5em] opacity-40">Intelligence Vectors</h3>
              </div>
              <DimensionBars dimensions={result.dimensions} />
            </motion.div>
          </div>
        </div>

        {/* Right Column: Analysis Panels */}
        <div className="lg:col-span-4 space-y-12">
          <motion.div 
            style={{ scale: heroScale, opacity: heroOpacity }}
            className="glass p-16 flex flex-col items-center justify-center bg-radial-at-t from-white/[0.03] to-transparent border-white/10 text-center rounded-[60px] shadow-panel-premium relative overflow-hidden bg-dot-grid animate-scan"
          >
            <div className="absolute inset-0 bg-grain pointer-events-none" />
            <ScoreGauge score={result.squint_score || 0} size={300} />
            <div className="mt-16 pt-16 border-t border-white/5 w-full relative z-10">
              <p className="text-[10px] text-text-muted mb-6 font-technical font-black uppercase tracking-[0.5em] opacity-30">Neural Readability Rank</p>
              <div className="flex items-center justify-center gap-6">
                <div className="h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${result.squint_score || 0}%` }}
                    className="h-full bg-text-primary" 
                    transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="font-technical text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">PR {result.squint_score}</span>
              </div>
            </div>
          </motion.div>

          <SuggestionsPanel suggestions={result.mappedSuggestions} />
          
          <WCAGChecklist issues={result.mappedWcagIssues} />
        </div>
      </motion.div>
    </div>
  );
};
