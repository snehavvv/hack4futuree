-- Migration: add missing columns for full analysis pipeline

-- 1. Add wcag_level and simulation_preset to analyses
ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS wcag_level TEXT DEFAULT 'AA',
  ADD COLUMN IF NOT EXISTS simulation_preset TEXT DEFAULT 'combined';

-- 2. Add id (auto-gen), ocr_text_before, ocr_text_after, confidence_delta to analysis_metrics
-- Note: analysis_metrics already has analysis_id as PK, but schemas expect an 'id' column
ALTER TABLE public.analysis_metrics
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS ocr_text_before TEXT,
  ADD COLUMN IF NOT EXISTS ocr_text_after TEXT;

-- Ensure confidence_delta exists (it's in the init migration but let's be safe)
-- ALTER TABLE public.analysis_metrics ADD COLUMN IF NOT EXISTS confidence_delta FLOAT;

-- 3. Add dimension, rank, and suggestion_text alias to suggestions
ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS dimension TEXT,
  ADD COLUMN IF NOT EXISTS rank INT,
  ADD COLUMN IF NOT EXISTS suggestion_text TEXT;

-- 4. Expand severity check to include 'low'
ALTER TABLE public.suggestions DROP CONSTRAINT IF EXISTS suggestions_severity_check;
ALTER TABLE public.suggestions ADD CONSTRAINT suggestions_severity_check 
  CHECK (severity IN ('critical', 'high', 'medium', 'low'));
