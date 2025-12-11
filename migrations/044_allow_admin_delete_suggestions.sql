-- Migration: Allow Admins to Delete Feature Suggestions
-- Description: Adds RLS policy to allow admins to delete feature suggestions

-- Policy: Admins can delete suggestions
CREATE POLICY "Admins can delete suggestions"
    ON public.feature_suggestions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (
                profiles.email ILIKE '%admin%'
                OR profiles.company_name = 'Admin'
                OR profiles.role = 'admin'
                OR profiles.is_admin = true
            )
        )
    );

-- Grant delete permission
GRANT DELETE ON public.feature_suggestions TO authenticated;
