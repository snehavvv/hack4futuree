import type {
  AnalysisResult,
  AnalysisDimension,
  Suggestion,
  WCAGIssue,
  SimulationPreset,
} from '../types';

import { PRESET_CONFIGS as PRESETS } from '../types';

let analysisCounter = 0;

function generateId(): string {
  analysisCounter++;
  return `analysis-${Date.now()}-${analysisCounter}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function generateSimulatedImage(
  imageUrl: string,
  preset: SimulationPreset
): Promise<string> {
  const config = PRESETS[preset];
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(imageUrl); return; }

      ctx.filter = `blur(${config.blur}px) contrast(${config.contrast}) brightness(${config.brightness}) saturate(${config.saturate})`;
      ctx.drawImage(img, 0, 0);

      if (preset === 'bright_sunlight') {
        const grad = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.3, 0, canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.5);
        grad.addColorStop(0, 'rgba(255,255,255,0.4)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (preset === 'cataracts') {
        ctx.fillStyle = 'rgba(180, 160, 100, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

function generateDimensions(score: number): AnalysisDimension[] {
  const variance = 15;
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return [
    { name: 'OCR Retention', score: clamp(score + randomBetween(-variance, variance)), description: 'Text recognition clarity', icon: 'type' },
    { name: 'Contrast Ratio', score: clamp(score + randomBetween(-variance, variance)), description: 'WCAG contrast benchmarks', icon: 'contrast' },
    { name: 'Font Legibility', score: clamp(score + randomBetween(-variance, variance)), description: 'Readability assessment', icon: 'a-large-small' },
    { name: 'Visual Clutter', score: clamp(score + randomBetween(-variance, variance)), description: 'Information density', icon: 'layout-grid' },
    { name: 'Color Accessibility', score: clamp(score + randomBetween(-variance, variance)), description: 'Vision deficiency simulation', icon: 'palette' },
  ];
}

function generateSuggestions(score: number): Suggestion[] {
  const all: Suggestion[] = [
    { id: 's1', title: 'Increase contrast', description: 'Body text fails WCAG AA.', impact: 'high', category: 'Contrast' },
    { id: 's2', title: 'Scalable fonts', description: 'Some fonts too small.', impact: 'high', category: 'Typography' },
  ];
  return all.slice(0, score > 80 ? 1 : 2);
}

function generateWCAGIssues(score: number): WCAGIssue[] {
  return [
    { id: 'w1', criterion: '1.4.3', title: 'Contrast (Minimum)', description: 'Text contrast fails 4.5:1', level: 'AA', status: score >= 70 ? 'pass' : 'fail' },
  ];
}

export async function runAnalysis(imageUrl: string, preset: SimulationPreset = 'default', fileName?: string, onProgress?: (s: string, p: number) => void): Promise<AnalysisResult> {
  const id = generateId();
  const jobId = `job-${id}`;
  onProgress?.('Uploading...', 10);
  await delay(100);
  const simulatedImageUrl = await generateSimulatedImage(imageUrl, preset);
  const squintScore = randomBetween(40, 95);
  return { id, jobId, imageUrl, simulatedImageUrl, squintScore, dimensions: generateDimensions(squintScore), suggestions: generateSuggestions(squintScore), wcagIssues: generateWCAGIssues(squintScore), status: 'complete', preset, createdAt: new Date().toISOString(), fileName };
}

function delay(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms)); }
const STORAGE_KEY = 'squintscale_analyses';
const MAX_STORAGE_ITEMS = 5;

export function saveAnalysis(result: AnalysisResult): void { 
  try {
    const s = getStoredAnalyses(); 
    s.unshift(result); 
    const limited = s.slice(0, MAX_STORAGE_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited)); 
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      console.warn('Analysis storage quota exceeded, purging old records...');
      const s = getStoredAnalyses();
      // Purge half and try again
      const purged = s.slice(0, Math.floor(MAX_STORAGE_ITEMS / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(purged));
      } catch (finalError) {
        console.error('Failed to save analysis even after purge', finalError);
      }
    }
  }
}

export function getStoredAnalyses(): AnalysisResult[] { 
  try { 
    const r = localStorage.getItem(STORAGE_KEY); 
    return r ? JSON.parse(r) : []; 
  } catch (e) { 
    console.error('Failed to read analyses from storage', e);
    return []; 
  } 
}

export function getAnalysisById(id: string): AnalysisResult | undefined { 
  return getStoredAnalyses().find(a => a.id === id || a.jobId === id); 
}

export function deleteAnalysis(id: string): void { 
  try {
    const s = getStoredAnalyses().filter(a => a.id !== id); 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); 
  } catch (e) {
    console.error('Failed to delete analysis', e);
  }
}