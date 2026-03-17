// ---- Score Bands ----
export type ScoreBand = 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';

export function getScoreBand(score: number): ScoreBand {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'moderate';
  if (score >= 30) return 'poor';
  return 'critical';
}

export function getScoreBandLabel(band: ScoreBand): string {
  return band.charAt(0).toUpperCase() + band.slice(1);
}

// ---- Analysis Types ----
export interface AnalysisDimension {
  name: string;
  score: number;
  description: string;
  icon: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  cssFix?: string;
  category: string;
}

export interface WCAGIssue {
  id: string;
  criterion: string;
  title: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'pass' | 'fail' | 'warning';
  element?: string;
}

export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface AnalysisResult {
  id: string;
  jobId: string;
  userId?: string;
  imageUrl: string;
  simulatedImageUrl?: string;
  squintScore: number;
  dimensions: AnalysisDimension[];
  suggestions: Suggestion[];
  wcagIssues: WCAGIssue[];
  status: AnalysisStatus;
  preset: SimulationPreset;
  createdAt: string;
  fileName?: string;
}

// ---- Simulation Presets ----
export type SimulationPreset =
  | 'default'
  | 'presbyopia'
  | 'myopia'
  | 'bright_sunlight'
  | 'dim_lighting'
  | 'cataracts';

export interface PresetConfig {
  label: string;
  description: string;
  blur: number;
  contrast: number;
  brightness: number;
  saturate: number;
}

export const PRESET_CONFIGS: Record<SimulationPreset, PresetConfig> = {
  default: { label: 'Default', description: 'Standard readability test', blur: 1.5, contrast: 0.85, brightness: 1.0, saturate: 1.0 },
  presbyopia: { label: 'Presbyopia', description: 'Age-related near vision loss', blur: 2.5, contrast: 0.75, brightness: 0.95, saturate: 0.9 },
  myopia: { label: 'Myopia', description: 'Nearsightedness simulation', blur: 3.0, contrast: 0.9, brightness: 1.0, saturate: 1.0 },
  bright_sunlight: { label: 'Bright Sunlight', description: 'High glare outdoor reading', blur: 0.5, contrast: 0.6, brightness: 1.5, saturate: 0.7 },
  dim_lighting: { label: 'Dim Lighting', description: 'Low-light reading conditions', blur: 1.0, contrast: 0.7, brightness: 0.5, saturate: 0.8 },
  cataracts: { label: 'Cataracts', description: 'Clouded lens simulation', blur: 3.5, contrast: 0.6, brightness: 1.1, saturate: 0.5 },
};

// ---- Color Deficiency ----
export type ColorDeficiency = 'deuteranopia' | 'protanopia' | 'tritanopia';

export const COLOR_DEFICIENCY_LABELS: Record<ColorDeficiency, string> = {
  deuteranopia: 'Deuteranopia (Red-Green)',
  protanopia: 'Protanopia (Red-Blind)',
  tritanopia: 'Tritanopia (Blue-Yellow)',
};

// ---- User ----
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

// ---- Share Links ----
export interface ShareLink {
  id: string;
  token: string;
  analysisId: string;
  expiresAt: string;
  createdAt: string;
}
