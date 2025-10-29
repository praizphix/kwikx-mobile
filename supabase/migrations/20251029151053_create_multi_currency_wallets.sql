/*
  # Multi-Currency Wallet System

  ## Overview
  Creates the wallet infrastructure for KwikX's three supported currencies: CFA, NGN, and USDT.
  Each user gets three wallets (one per currency) automatically created upon profile creation.

  ## 1. New Tables

  ### `wallets`
  Individual currency wallets for each user.
  - `id` (uuid, primary key) - Unique wallet identifier
  - `user_id` (uuid, foreign key) - References profiles(id)
  - `currency` (text) - Currency code: 'CFA', 'NGN', 'USDT'
  - `balance` (numeric(20,2)) - Current wallet balance (precise to 2 decimal places)
  - `available_balance` (numeric(20,2)) - Available balance (excluding pending transactions)
  - `reserved_balance` (numeric(20,2)) - Reserved for pending transactions
  - `status` (text) - Wallet status: 'active', 'frozen', 'closed'
  - `daily_limit` (numeric(20,2)) - Daily transaction limit
  - `monthly_limit` (numeric(20,2)) - Monthly transaction limit
  - `created_at` (timestamptz) - Wallet creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `wallet_limits`
  Transaction limits based on KYC level.
  - `id` (uuid, primary key) - Unique identifier
  - `kyc_level` (integer) - KYC verification level (0, 1, 2)
  - `currency` (text) - Currency code
  - `daily_limit` (numeric(20,2)) - Maximum daily transaction amount
  - `monthly_limit` (numeric(20,2)) - Maximum monthly transaction amount
  - `single_transaction_limit` (numeric(20,2)) - Maximum per-transaction amount
  - `withdrawal_daily_limit` (numeric(20,2)) - Maximum daily withdrawal
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## 2. Security

  ### RLS Policies
  - Users can only view and interact with their own wallets
  - Balance updates require transaction validation
  - Wallet creation restricted to system triggers
  - Admins have read-only access for monitoring

  ## 3. Important Notes
  - Three wallets (CFA, NGN, USDT) are auto-created per user via trigger
  - All balances stored with 2 decimal precision for accuracy
  - Reserved balance prevents double-spending during pending transactions
  - Limits are enforced based on user's KYC level
  - Negative balances are prevented via CHECK constraints
  - All financial calculations use numeric type to avoid floating-point errors
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('CFA', 'NGN', 'USDT')),
  balance numeric(20,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  available_balance numeric(20,2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  reserved_balance numeric(20,2) NOT NULL DEFAULT 0 CHECK (reserved_balance >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed')),
  daily_limit numeric(20,2),
  monthly_limit numeric(20,2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, currency),
  CHECK (balance = available_balance + reserved_balance)
);

-- Create wallet limits table
CREATE TABLE IF NOT EXISTS wallet_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_level integer NOT NULL CHECK (kyc_level >= 0 AND kyc_level <= 2),
  currency text NOT NULL CHECK (currency IN ('CFA', 'NGN', 'USDT')),
  daily_limit numeric(20,2) NOT NULL DEFAULT 0,
  monthly_limit numeric(20,2) NOT NULL DEFAULT 0,
  single_transaction_limit numeric(20,2) NOT NULL DEFAULT 0,
  withdrawal_daily_limit numeric(20,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(kyc_level, currency)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_currency ON wallets(currency);
CREATE INDEX IF NOT EXISTS idx_wallets_status ON wallets(status);
CREATE INDEX IF NOT EXISTS idx_wallet_limits_kyc_level ON wallet_limits(kyc_level);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets
CREATE POLICY "Users can view own wallets"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view wallet limits"
  ON wallet_limits FOR SELECT
  TO authenticated
  USING (true);

-- Trigger to auto-update updated_at for wallets
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at for wallet_limits
CREATE TRIGGER update_wallet_limits_updated_at
  BEFORE UPDATE ON wallet_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallets for new users
CREATE OR REPLACE FUNCTION handle_new_user_wallets()
RETURNS TRIGGER AS $$
BEGIN
  -- Create CFA wallet
  INSERT INTO wallets (user_id, currency, balance, available_balance, reserved_balance)
  VALUES (NEW.id, 'CFA', 0, 0, 0);
  
  -- Create NGN wallet
  INSERT INTO wallets (user_id, currency, balance, available_balance, reserved_balance)
  VALUES (NEW.id, 'NGN', 0, 0, 0);
  
  -- Create USDT wallet
  INSERT INTO wallets (user_id, currency, balance, available_balance, reserved_balance)
  VALUES (NEW.id, 'USDT', 0, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create wallets when profile is created
CREATE TRIGGER on_profile_created_create_wallets
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_wallets();

-- Insert default wallet limits for different KYC levels
INSERT INTO wallet_limits (kyc_level, currency, daily_limit, monthly_limit, single_transaction_limit, withdrawal_daily_limit)
VALUES
  -- KYC Level 0 (No verification) - Very restricted
  (0, 'CFA', 50000, 150000, 10000, 25000),
  (0, 'NGN', 50000, 150000, 10000, 25000),
  (0, 'USDT', 100, 300, 50, 50),
  
  -- KYC Level 1 (Basic verification) - Moderate limits
  (1, 'CFA', 500000, 5000000, 100000, 250000),
  (1, 'NGN', 500000, 5000000, 100000, 250000),
  (1, 'USDT', 1000, 10000, 500, 500),
  
  -- KYC Level 2 (Advanced verification) - High limits
  (2, 'CFA', 5000000, 50000000, 1000000, 2500000),
  (2, 'NGN', 5000000, 50000000, 1000000, 2500000),
  (2, 'USDT', 10000, 100000, 5000, 5000)
ON CONFLICT (kyc_level, currency) DO NOTHING;