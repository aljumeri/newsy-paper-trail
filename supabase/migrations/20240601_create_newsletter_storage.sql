

-- Create storage policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload newsletter assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'newsletter-assets' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow public read access to newsletter assets
CREATE POLICY "Allow public read access to newsletter assets" ON storage.objects
FOR SELECT USING (bucket_id = 'newsletter-assets');

-- Create storage policy to allow authenticated users to update their own uploads
CREATE POLICY "Allow authenticated users to update newsletter assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'newsletter-assets' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete newsletter assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'newsletter-assets' 
  AND auth.role() = 'authenticated'
);

-- Add comments for documentation
COMMENT ON TABLE storage.buckets IS 'Storage buckets for the application';
COMMENT ON COLUMN storage.buckets.id IS 'Unique identifier for the bucket';
COMMENT ON COLUMN storage.buckets.name IS 'Display name for the bucket';
COMMENT ON COLUMN storage.buckets.public IS 'Whether the bucket is publicly accessible';
COMMENT ON COLUMN storage.buckets.file_size_limit IS 'Maximum file size in bytes';
COMMENT ON COLUMN storage.buckets.allowed_mime_types IS 'Array of allowed MIME types for uploads'; 