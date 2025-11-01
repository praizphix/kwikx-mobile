/*
  # Add Crypto Addresses Table for Tatum Integration

  1. New Tables
    - `crypto_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `currency` (text) - 'USDT'
      - `blockchain` (text) - 'TRC20'
      - `address` (text) - blockchain address
      - `encrypted_private_key` (text, encrypted) - for withdrawals
      - `is_active` (boolean) - address status
      - `last_synced_at` (timestamptz) - last balance sync
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on crypto_addresses
    - Users can only view own addresses
    - Admins can view all addresses
    - Private keys encrypted at rest

  3. Notes
    - Supports USDT on TRON blockchain (TRC20)
    - One active address per user per currency
    - Private keys should be encrypted before storage (TODO)
*/

-- Create crypto_addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('USDT')),
  blockchain text NOT NULL CHECK (blockchain IN ('TRC20', 'ERC20', 'BEP20')),
  address text NOT NULL,
  encrypted_private_key text,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency, blockchain)
);

-- Enable RLS
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view own addresses
CREATE POLICY "Users can view own crypto addresses"
ON crypto_addresses FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create own addresses
CREATE POLICY "Users can create own crypto addresses"
ON crypto_addresses FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own addresses (for syncing)
CREATE POLICY "Users can update own crypto addresses"
ON crypto_addresses FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all addresses
CREATE POLICY "Admins can view all crypto addresses"
ON crypto_addresses FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
);

-- Admins can manage addresses
CREATE POLICY "Admins can manage crypto addresses"
ON crypto_addresses FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
)
WITH CHECK (
  auth.uid() IN (SELECT id FROM admin_users WHERE status = 'active')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_user_id ON crypto_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_currency ON crypto_addresses(currency);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_address ON crypto_addresses(address);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_active ON crypto_addresses(is_active);

-- Create updated_at trigger
CREATE TRIGGER update_crypto_addresses_updated_at
  BEFORE UPDATE ON crypto_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE crypto_addresses IS 'Stores cryptocurrency deposit/withdrawal addresses for users';
COMMENT ON COLUMN crypto_addresses.encrypted_private_key IS 'Encrypted private key for withdrawals - MUST be encrypted before storage';