-- migration: add_reports_table

CREATE TABLE IF NOT EXISTS public.reports (
    analysis_id UUID PRIMARY KEY REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on row level security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reports
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

-- Allow service role full access (which our backend uses)
CREATE POLICY "Service role has full access to reports" ON public.reports
    FOR ALL USING (true);
