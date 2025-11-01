/*
  # Add Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text) - Role of the admin (admin, super_admin)
      - `created_at` (timestamptz) - When the admin was created
      - `last_login` (timestamptz) - Last login timestamp
      - `created_by` (uuid) - Admin who created this admin
      - `status` (text) - Account status (active, inactive, suspended)

  2. Security
    - Enable RLS on admin_users table
    - Add policy for admin users to read their own data
    - Add policy for super_admin to manage other admins
    - Add policy for admin access to system data
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admins can read own data" 
  ON admin_users
  FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Super admins can manage admins" 
  ON admin_users
  FOR ALL 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' AND status = 'active')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'super_admin' AND status = 'active')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_last_login ON admin_users(last_login);

-- Update existing tables to grant admin access
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Admins can update profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Admins can read all transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Admins can read all wallets"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Admins can manage KYC documents"
  ON kyc_documents
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );

CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
  );