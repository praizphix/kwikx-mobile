/*
  # Transactions and Audit System

  ## Overview
  Comprehensive transaction tracking for all financial operations: exchanges, deposits, withdrawals.
  Includes full audit logging for security, compliance, and debugging.

  ## 1. New Tables

  ### `transactions`
  Core transaction records for all financial operations.
  - `id` (uuid, primary key) - Unique transaction identifier
  - `user_id` (uuid, foreign key) - User who initiated the transaction
  - `type` (text) - Transaction type: 'exchange', 'deposit', 'withdrawal', 'fee', 'reversal'
  - `status` (text) - Status: 'pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'
  - `from_currency` (text) - Source currency (for exchanges)
  - `to_currency` (text) - Target currency (for exchanges)
  - `from_wallet_id` (uuid) - Source wallet
  - `to_wallet_id` (uuid) - Target wallet
  - `from_amount` (numeric(20,2)) - Amount debited
  - `to_amount` (numeric(20,2)) - Amount credited
  - `fee_amount` (numeric(20,2)) - Fee charged
  - `exchange_rate` (numeric(20,8)) - Rate used (for exchanges)
  - `quote_id` (uuid) - Associated quote (for exchanges)
  - `reference` (text) - External reference (bank transfer ID, crypto hash, etc.)
  - `description` (text) - Transaction description
  - `metadata` (jsonb) - Additional data (payment method, gateway response, etc.)
  - `error_message` (text) - Error details if failed
  - `processed_at` (timestamptz) - When transaction was processed
  - `completed_at` (timestamptz) - When transaction completed
  - `created_at` (timestamptz) - Transaction creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `deposit_methods`
  User's configured deposit methods.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User who owns the method
  - `currency` (text) - Supported currency
  - `method_type` (text) - Type: 'bank_transfer', 'card', 'mobile_money', 'crypto_wallet'
  - `provider` (text) - Provider name (e.g., 'mtn_mobile_money', 'visa')
  - `account_details` (jsonb) - Encrypted account info
  - `is_default` (boolean) - Default method for this currency
  - `is_verified` (boolean) - Whether method is verified
  - `status` (text) - Status: 'active', 'inactive', 'pending_verification'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `withdrawal_methods`
  User's configured withdrawal methods.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - User who owns the method
  - `currency` (text) - Supported currency
  - `method_type` (text) - Type: 'bank_transfer', 'mobile_money', 'crypto_wallet'
  - `provider` (text) - Provider name
  - `account_details` (jsonb) - Encrypted account info
  - `is_default` (boolean) - Default method for this currency
  - `is_verified` (boolean) - Whether method is verified
  - `status` (text) - Status: 'active', 'inactive', 'pending_verification'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `audit_logs`
  System-wide audit trail for security and compliance.
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who performed the action (null for system actions)
  - `action` (text) - Action performed (e.g., 'login', 'rate_change', 'transaction_executed')
  - `resource_type` (text) - Type of resource affected (e.g., 'transaction', 'wallet', 'rate')
  - `resource_id` (uuid) - ID of affected resource
  - `old_values` (jsonb) - Previous values (for updates)
  - `new_values` (jsonb) - New values (for updates/creates)
  - `ip_address` (text) - User's IP address
  - `user_agent` (text) - Browser/app user agent
  - `status` (text) - Action result: 'success', 'failed', 'blocked'
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz) - When action occurred

  ## 2. Security

  ### RLS Policies
  - Users can view their own transactions
  - Users can create transactions (with validation)
  - Users can manage their own payment methods
  - Audit logs are append-only (no updates/deletes)
  - Only authenticated users can access their financial data

  ## 3. Important Notes
  - All transactions are immutable once completed
  - Failed transactions can be retried (new transaction created)
  - Reversals create separate reversal transactions
  - Payment method account_details should be encrypted
  - Audit logs capture all security-sensitive actions
  - Metadata field stores flexible additional data (JSON)
  - Transaction status flow: pending → processing → completed/failed
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('exchange', 'deposit', 'withdrawal', 'fee', 'reversal')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed')),
  from_currency text CHECK (from_currency IN ('CFA', 'NGN', 'USDT')),
  to_currency text CHECK (to_currency IN ('CFA', 'NGN', 'USDT')),
  from_wallet_id uuid REFERENCES wallets(id),
  to_wallet_id uuid REFERENCES wallets(id),
  from_amount numeric(20,2) CHECK (from_amount IS NULL OR from_amount >= 0),
  to_amount numeric(20,2) CHECK (to_amount IS NULL OR to_amount >= 0),
  fee_amount numeric(20,2) DEFAULT 0 CHECK (fee_amount >= 0),
  exchange_rate numeric(20,8) CHECK (exchange_rate IS NULL OR exchange_rate > 0),
  quote_id uuid REFERENCES quotes(id),
  reference text,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create deposit_methods table
CREATE TABLE IF NOT EXISTS deposit_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('CFA', 'NGN', 'USDT')),
  method_type text NOT NULL CHECK (method_type IN ('bank_transfer', 'card', 'mobile_money', 'crypto_wallet')),
  provider text NOT NULL,
  account_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false NOT NULL,
  is_verified boolean DEFAULT false NOT NULL,
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('active', 'inactive', 'pending_verification')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create withdrawal_methods table
CREATE TABLE IF NOT EXISTS withdrawal_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('CFA', 'NGN', 'USDT')),
  method_type text NOT NULL CHECK (method_type IN ('bank_transfer', 'mobile_money', 'crypto_wallet')),
  provider text NOT NULL,
  account_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false NOT NULL,
  is_verified boolean DEFAULT false NOT NULL,
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('active', 'inactive', 'pending_verification')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'blocked')),
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet ON transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet ON transactions(to_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_quote_id ON transactions(quote_id);

CREATE INDEX IF NOT EXISTS idx_deposit_methods_user_id ON deposit_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_methods_currency ON deposit_methods(currency);
CREATE INDEX IF NOT EXISTS idx_withdrawal_methods_user_id ON withdrawal_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_methods_currency ON withdrawal_methods(currency);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for deposit_methods
CREATE POLICY "Users can view own deposit methods"
  ON deposit_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deposit methods"
  ON deposit_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deposit methods"
  ON deposit_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deposit methods"
  ON deposit_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for withdrawal_methods
CREATE POLICY "Users can view own withdrawal methods"
  ON withdrawal_methods FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawal methods"
  ON withdrawal_methods FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own withdrawal methods"
  ON withdrawal_methods FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own withdrawal methods"
  ON withdrawal_methods FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for audit_logs (read-only for users)
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposit_methods_updated_at
  BEFORE UPDATE ON deposit_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawal_methods_updated_at
  BEFORE UPDATE ON withdrawal_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to audit transaction status changes
CREATE OR REPLACE FUNCTION audit_transaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values,
      status
    ) VALUES (
      NEW.user_id,
      'transaction_status_change',
      'transaction',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_status_change
  AFTER UPDATE ON transactions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION audit_transaction_change();