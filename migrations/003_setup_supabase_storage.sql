-- Travel Agent Management System Database Schema
-- Migration 003: Supabase Storage setup

-- Create storage buckets for client files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('client-documents', 'client-documents', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/gif']),
('client-passports', 'client-passports', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/jpg']),
('client-receipts', 'client-receipts', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']),
('client-tickets', 'client-tickets', false, 10485760, ARRAY['application/pdf']),
('client-profiles', 'client-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/jpg']);

-- Create storage policies for client documents bucket
CREATE POLICY "Users can upload their own client documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can view their own client documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'client-documents' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can update their own client documents" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'client-documents' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can delete their own client documents" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'client-documents' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

-- Create storage policies for client passports bucket
CREATE POLICY "Users can upload their own client passports" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-passports' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can view their own client passports" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'client-passports' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

-- Create storage policies for client receipts bucket
CREATE POLICY "Users can upload their own client receipts" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-receipts' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can view their own client receipts" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'client-receipts' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

-- Create storage policies for client tickets bucket
CREATE POLICY "Users can upload their own client tickets" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-tickets' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Users can view their own client tickets" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'client-tickets' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

-- Create storage policies for client profiles bucket (public read access)
CREATE POLICY "Users can upload their own client profiles" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'client-profiles' AND
  auth.uid() IN (
    SELECT created_by FROM clients 
    WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Public can view client profiles" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'client-profiles');

-- Create function to generate secure file path
CREATE OR REPLACE FUNCTION generate_client_file_path(
    client_id UUID,
    file_type TEXT,
    original_filename TEXT
)
RETURNS TEXT AS $$
DECLARE
    file_extension TEXT;
    timestamp_str TEXT;
    random_suffix TEXT;
    secure_filename TEXT;
BEGIN
    -- Extract file extension
    file_extension := '.' || split_part(original_filename, '.', array_length(string_to_array(original_filename, '.'), 1));
    
    -- Generate timestamp and random suffix for uniqueness
    timestamp_str := to_char(NOW(), 'YYYYMMDDHH24MISS');
    random_suffix := substring(md5(random()::text || clock_timestamp()::text) for 8);
    
    -- Create secure filename
    secure_filename := file_type || '_' || timestamp_str || '_' || random_suffix || file_extension;
    
    -- Return full path: client_id/file_type/secure_filename
    RETURN client_id::text || '/' || file_type || '/' || secure_filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get client files by type
CREATE OR REPLACE FUNCTION get_client_files_by_type(
    client_uuid UUID,
    file_type_filter file_type DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    file_name VARCHAR(255),
    file_type file_type,
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cf.id,
        cf.file_name,
        cf.file_type,
        cf.file_url,
        cf.file_size,
        cf.mime_type,
        cf.created_at
    FROM client_files cf
    WHERE cf.client_id = client_uuid
    AND (file_type_filter IS NULL OR cf.file_type = file_type_filter)
    ORDER BY cf.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    file_record RECORD;
BEGIN
    -- Delete storage files that don't have corresponding client_files records
    FOR file_record IN 
        SELECT id, name, bucket_id
        FROM storage.objects
        WHERE bucket_id IN ('client-documents', 'client-passports', 'client-receipts', 'client-tickets', 'client-profiles')
        AND name NOT IN (
            SELECT file_url 
            FROM client_files 
            WHERE file_url IS NOT NULL
        )
    LOOP
        DELETE FROM storage.objects WHERE id = file_record.id;
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_client_file_path TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_files_by_type TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_storage_files TO authenticated;