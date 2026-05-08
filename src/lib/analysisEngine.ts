import type {
  AnalysisOut,
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
    if (!imageUrl) {
      resolve('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Resize to prevent memory issues and localStorage quota errors
      const MAX_DIM = 1000;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = (height / width) * MAX_DIM;
          width = MAX_DIM;
        } else {
          width = (width / height) * MAX_DIM;
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(imageUrl); return; }

      ctx.filter = `blur(${config.blur}px) contrast(${config.contrast}) brightness(${config.brightness}) saturate(${config.saturate})`;
      ctx.drawImage(img, 0, 0, width, height);

      if (preset === 'bright_sunlight') {
        const grad = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.3, 0, canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.5);
        grad.addColorStop(0, 'rgba(255,255,255,0.4)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (preset === 'cataract') {
        ctx.fillStyle = 'rgba(180, 160, 100, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      try {
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Reduced quality to save space
      } catch (e) {
        console.error('Canvas toDataURL failed:', e);
        resolve(imageUrl);
      }
    };
    img.onerror = (e) => {
      console.error('Image load failed for simulation:', e);
      resolve(imageUrl);
    };
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

export async function runAnalysis(imageUrl: string, preset: SimulationPreset = 'combined', fileName?: string, onProgress?: (s: string, p: number) => void): Promise<AnalysisOut> {
  const id = generateId();
  const jobId = `job-${id}`;
  onProgress?.('Uploading...', 10);
  await delay(100);
  
  onProgress?.('Neural Processing...', 40);
  const simulatedImageUrl = await generateSimulatedImage(imageUrl, preset);
  
  onProgress?.('Calculating Readability...', 70);
  await delay(200);
  
  const squintScore = randomBetween(40, 95);
  return { id, jobId, imageUrl, simulatedImageUrl, squintScore, dimensions: generateDimensions(squintScore), suggestions: generateSuggestions(squintScore), wcagIssues: generateWCAGIssues(squintScore), status: 'complete', preset, createdAt: new Date().toISOString(), fileName };
}

function delay(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms)); }
const STORAGE_KEY = 'squintscale_analyses';
const MAX_STORAGE_ITEMS = 5;

export function saveAnalysis(result: AnalysisOut): void { 
  try {
    const s = getStoredAnalyses(); 
    s.unshift(result); 
    let limited = s.slice(0, MAX_STORAGE_ITEMS);
    
    // Attempt to save, reducing list size if QuotaExceededError occurs
    while (limited.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
        break;
      } catch (e) {
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          if (limited.length > 1) {
            limited.pop(); // Remove oldest analysis
          } else {
            // Even one is too big? Strip images and just save metadata
            const stripped = { ...limited[0], imageUrl: '', simulatedImageUrl: '' };
            localStorage.setItem(STORAGE_KEY, JSON.stringify([stripped]));
            break;
          }
        } else {
          throw e;
        }
      }
    }
  } catch (e) {
    console.error('Failed to save analysis to storage', e);
  }
}

export function getStoredAnalyses(): AnalysisOut[] { 
  try { 
    const r = localStorage.getItem(STORAGE_KEY); 
    return r ? JSON.parse(r) : []; 
  } catch (e) { 
    console.error('Failed to read analyses from storage', e);
    return []; 
  } 
}

export function getAnalysisById(id: string): AnalysisOut | undefined { 
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