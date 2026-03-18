-- 1. PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    account_tier TEXT DEFAULT 'free' CHECK (account_tier IN ('free', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for auto-inserting profiles on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ANALYSES
CREATE TABLE public.analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    input_type TEXT CHECK (input_type IN ('upload', 'url')),
    input_url TEXT,
    original_image_path TEXT,
    degraded_image_path TEXT,
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    error_reason TEXT,
    squint_score FLOAT,
    squint_band TEXT CHECK (squint_band IN ('excellent', 'good', 'moderate', 'poor', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ANALYSIS_METRICS
CREATE TABLE public.analysis_metrics (
    analysis_id UUID PRIMARY KEY REFERENCES public.analyses(id) ON DELETE CASCADE,
    contrast_score FLOAT,
    font_size_score FLOAT,
    visual_clutter_score FLOAT,
    color_accessibility_score FLOAT,
    ocr_retention_rate FLOAT,
    confidence_delta FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SUGGESTIONS
CREATE TABLE public.suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium')),
    suggestion TEXT NOT NULL,
    expected_lift FLOAT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REPORTS
CREATE TABLE public.reports (
    analysis_id UUID PRIMARY KEY REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;


-- RLS POLICIES (Service Role bypasses RLS automatically, these are for frontend clients)
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own analyses" ON public.analyses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own analysis metrics" ON public.analysis_metrics 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.analyses WHERE analyses.id = analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can read own suggestions" ON public.suggestions 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.analyses WHERE analyses.id = analysis_id AND analyses.user_id = auth.uid()));

CREATE POLICY "Users can manage own reports" ON public.reports FOR ALL USING (auth.uid() = user_id);


-- Create private storage bucket for "squint-images"
INSERT INTO storage.buckets (id, name, public) 
VALUES ('squint-images', 'squint-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Rules (Folder isolation by user_id)
CREATE POLICY "Users can upload their own images" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'squint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own images" ON storage.objects 
    FOR SELECT USING (bucket_id = 'squint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects 
    FOR DELETE USING (bucket_id = 'squint-images' AND auth.uid()::text = (storage.foldername(name))[1]);
