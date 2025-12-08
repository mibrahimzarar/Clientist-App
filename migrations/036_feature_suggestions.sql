-- Migration: Feature Suggestions System
-- Description: Creates table for users to submit feature suggestions that admins can review

-- Create feature_suggestions table
CREATE TABLE IF NOT EXISTS public.feature_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    suggestion_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected', 'implemented')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_user_id ON public.feature_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_status ON public.feature_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_created_at ON public.feature_suggestions(created_at DESC);

-- Enable RLS
ALTER TABLE public.feature_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view their own suggestions
CREATE POLICY "Users can view their own suggestions"
    ON public.feature_suggestions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can create suggestions
CREATE POLICY "Users can create suggestions"
    ON public.feature_suggestions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all suggestions
CREATE POLICY "Admins can view all suggestions"
    ON public.feature_suggestions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.email ILIKE '%admin%'
                OR profiles.company_name = 'Admin'
                OR profiles.role = 'admin'
            )
        )
    );

-- Policy: Admins can update suggestion status
CREATE POLICY "Admins can update suggestions"
    ON public.feature_suggestions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.email ILIKE '%admin%'
                OR profiles.company_name = 'Admin'
                OR profiles.role = 'admin'
            )
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_feature_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_suggestions_updated_at_trigger
    BEFORE UPDATE ON public.feature_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_suggestions_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON public.feature_suggestions TO authenticated;
GRANT UPDATE ON public.feature_suggestions TO authenticated;
