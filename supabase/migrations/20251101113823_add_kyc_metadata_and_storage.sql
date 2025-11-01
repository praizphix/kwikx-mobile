/*
  # Add KYC Metadata and Storage Configuration

  1. Changes
    - Add metadata jsonb column to kyc_documents table
    - Create storage bucket for KYC documents
    - Add storage policies for document upload and admin access

  2. Security
    - Users can upload to their own folder
    - Admins can access all documents
    - Documents are not publicly accessible without authentication
*/

-- Add metadata column to kyc_documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'kyc_documents' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE kyc_documents ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create storage bucket for KYC documents (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for KYC documents

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all KYC documents
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
);

-- Allow admins to delete KYC documents if needed
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' AND
  auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
);

-- Update kyc_documents table to ensure metadata is searchable
CREATE INDEX IF NOT EXISTS idx_kyc_documents_metadata ON kyc_documents USING gin (metadata);