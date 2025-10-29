/*
  # User Profiles and KYC System

  ## Overview
  Creates the foundation for user management with extended profile information and KYC verification.
  This migration establishes secure user data storage with proper authentication integration.

  ## 1. New Tables

  ### `profiles`
  Extended user profile information linked to Supabase Auth users.
  - `id` (uuid, primary key) - References auth.users(id)
  - `email` (text, not null) - User email
  - `full_name` (text) - User's full name
  - `phone` (text) - Phone number
  - `country` (text) - Country of residence
  - `kyc_status` (text) - KYC verification status: 'pending', 'verified', 'rejected'
  - `kyc_level` (integer) - Verification level (0=none, 1=basic, 2=advanced)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `kyc_documents`
  Stores KYC document information and verification status.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References profiles(id)
  - `document_type` (text) - Type: 'passport', 'national_id', 'drivers_license', 'proof_of_address'
  - `document_url` (text) - Secure storage URL
  - `status` (text) - Verification status: 'pending', 'approved', 'rejected'
  - `rejection_reason` (text) - Reason if rejected
  - `verified_at` (timestamptz) - Verification timestamp
  - `verified_by` (uuid) - Admin who verified
  - `created_at` (timestamptz) - Upload timestamp

  ## 2. Security

  ### RLS Policies
  - Users can read and update their own profile
  - Users can read and create their own KYC documents
  - Only authenticated users can access their data
  - Admins have full access (will be implemented in admin migration)

  ## 3. Important Notes
  - All tables have RLS enabled by default
  - Profiles are automatically created via trigger when user signs up
  - KYC status starts as 'pending' with level 0
  - Phone numbers and personal data are encrypted at rest by Supabase
  - Document URLs should use Supabase Storage with signed URLs for security
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  country text,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_level integer NOT NULL DEFAULT 0 CHECK (kyc_level >= 0 AND kyc_level <= 2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license', 'proof_of_address')),
  document_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for kyc_documents
CREATE POLICY "Users can view own KYC documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own KYC documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();