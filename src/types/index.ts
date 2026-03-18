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

// ---- Simulation Presets ----
export type SimulationPreset =
  | 'combined'
  | 'presbyopia'
  | 'myopia'
  | 'bright_sunlight'
  | 'dim_lighting'
  | 'cataract';

export interface PresetConfig {
  label: string;
  description: string;
  blur: number;
  contrast: number;
  brightness: number;
  saturate: number;
}

export const PRESET_CONFIGS: Record<SimulationPreset, PresetConfig> = {
  combined: { label: 'Combined', description: 'Standard readability test', blur: 1.5, contrast: 0.85, brightness: 1.0, saturate: 1.0 },
  presbyopia: { label: 'Presbyopia', description: 'Age-related near vision loss', blur: 2.5, contrast: 0.75, brightness: 0.95, saturate: 0.9 },
  myopia: { label: 'Myopia', description: 'Nearsightedness simulation', blur: 3.0, contrast: 0.9, brightness: 1.0, saturate: 1.0 },
  bright_sunlight: { label: 'Bright Sunlight', description: 'High glare outdoor reading', blur: 0.5, contrast: 0.6, brightness: 1.5, saturate: 0.7 },
  dim_lighting: { label: 'Dim Lighting', description: 'Low-light reading conditions', blur: 1.0, contrast: 0.7, brightness: 0.5, saturate: 0.8 },
  cataract: { label: 'Cataract', description: 'Clouded lens simulation', blur: 3.5, contrast: 0.6, brightness: 1.1, saturate: 0.5 },
};

// ---- API Types ----

export interface MetricsOut {
  ocr_retention_rate: number | null;
  contrast_score: number | null;
  font_size_score: number | null;
  visual_clutter_score: number | null;
  color_accessibility_score: number | null;
  confidence_delta: number | null;
  ocr_text_before: string | null;
  ocr_text_after: string | null;
}

export interface SuggestionItem {
  rank: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  dimension: string | null;
  suggestion_text: string | null;
  expected_score_lift: number | null;
}

export interface WCAGIssueItem {
  criterion: string;
  severity: string;
  description: string;
}

export interface AnalysisOut {
  id: string;
  user_id: string;
  input_type: string | null;
  input_url: string | null;
  original_image_path: string | null;
  degraded_image_path: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error_reason: string | null;
  squint_score: number | null;
  band_label: string | null;
  wcag_level: string;
  simulation_preset: SimulationPreset;
  created_at: string;
  updated_at: string | null;
  
  metrics: MetricsOut | null;
  suggestions: SuggestionItem[] | null;
  wcag_issues: WCAGIssueItem[] | null;
}

export interface AnalysisListItem {
  id: string;
  user_id: string;
  input_type: string | null;
  input_url: string | null;
  original_image_path: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  squint_score: number | null;
  band_label: string | null;
  simulation_preset: string;
  created_at: string;
}

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
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  css_fix?: string;
}

export interface WCAGIssue {
  id: string;
  criterion: string;
  title: string;
  description: string;
  level: 'A' | 'AA' | 'AAA';
  status: 'pass' | 'fail' | 'warning';
}

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
