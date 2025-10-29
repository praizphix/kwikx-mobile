/*
  # Exchange Rates and Quotes System

  ## Overview
  Implements the core rate management system for KwikX currency exchanges.
  Admins control rates, users get time-limited quotes to lock in rates before execution.

  ## 1. New Tables

  ### `exchange_rates`
  Admin-managed exchange rates for currency pairs.
  - `id` (uuid, primary key) - Unique rate identifier
  - `from_currency` (text) - Source currency: 'CFA', 'NGN', 'USDT'
  - `to_currency` (text) - Target currency: 'CFA', 'NGN', 'USDT'
  - `rate` (numeric(20,8)) - Exchange rate (high precision for crypto)
  - `fee_flat` (numeric(20,2)) - Flat fee amount
  - `fee_percentage` (numeric(5,4)) - Percentage fee (e.g., 0.0050 = 0.5%)
  - `min_amount` (numeric(20,2)) - Minimum transaction amount
  - `max_amount` (numeric(20,2)) - Maximum transaction amount
  - `status` (text) - Rate status: 'active', 'inactive', 'scheduled'
  - `valid_from` (timestamptz) - Rate becomes active at this time
  - `valid_until` (timestamptz) - Rate expires at this time (optional)
  - `quote_ttl_seconds` (integer) - How long quotes last (60-120 seconds)
  - `created_by` (uuid) - Admin who created the rate
  - `updated_by` (uuid) - Admin who last updated
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `exchange_rate_history`
  Audit trail for rate changes.
  - `id` (uuid, primary key) - Unique identifier
  - `rate_id` (uuid) - References exchange_rates(id)
  - `from_currency` (text) - Source currency
  - `to_currency` (text) - Target currency
  - `old_rate` (numeric(20,8)) - Previous rate
  - `new_rate` (numeric(20,8)) - New rate
  - `changed_by` (uuid) - Admin who made the change
  - `change_reason` (text) - Reason for the change
  - `created_at` (timestamptz) - Change timestamp

  ### `quotes`
  Time-limited rate quotes for users.
  - `id` (uuid, primary key) - Unique quote identifier
  - `user_id` (uuid) - User who requested the quote
  - `rate_id` (uuid) - Rate used for this quote
  - `from_currency` (text) - Source currency
  - `to_currency` (text) - Target currency
  - `from_amount` (numeric(20,2)) - Amount to exchange
  - `exchange_rate` (numeric(20,8)) - Locked-in rate
  - `fee_flat` (numeric(20,2)) - Flat fee applied
  - `fee_percentage` (numeric(5,4)) - Percentage fee applied
  - `total_fee` (numeric(20,2)) - Total fee amount
  - `to_amount` (numeric(20,2)) - Amount user will receive
  - `status` (text) - Quote status: 'active', 'executed', 'expired', 'cancelled'
  - `expires_at` (timestamptz) - Quote expiration time
  - `executed_at` (timestamptz) - When quote was executed (if executed)
  - `created_at` (timestamptz) - Quote creation timestamp

  ## 2. Security

  ### RLS Policies
  - Only admins can create/update exchange rates
  - Users can view active rates
  - Users can create and view their own quotes
  - Quotes cannot be modified after creation
  - Rate history is read-only for audit purposes

  ## 3. Important Notes
  - Exchange rates use 8 decimal precision for accurate crypto conversions
  - Quotes automatically expire after TTL (60-120 seconds typically)
  - Expired quotes cannot be executed
  - Rate changes are logged in exchange_rate_history
  - Fee calculation: total_fee = fee_flat + (from_amount * fee_percentage)
  - to_amount = (from_amount * exchange_rate) - total_fee
  - Users must execute quote before expiration
*/

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL CHECK (from_currency IN ('CFA', 'NGN', 'USDT')),
  to_currency text NOT NULL CHECK (to_currency IN ('CFA', 'NGN', 'USDT')),
  rate numeric(20,8) NOT NULL CHECK (rate > 0),
  fee_flat numeric(20,2) NOT NULL DEFAULT 0 CHECK (fee_flat >= 0),
  fee_percentage numeric(5,4) NOT NULL DEFAULT 0 CHECK (fee_percentage >= 0 AND fee_percentage < 1),
  min_amount numeric(20,2) NOT NULL DEFAULT 1 CHECK (min_amount > 0),
  max_amount numeric(20,2) NOT NULL DEFAULT 10000000 CHECK (max_amount > min_amount),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'scheduled')),
  valid_from timestamptz DEFAULT now() NOT NULL,
  valid_until timestamptz,
  quote_ttl_seconds integer NOT NULL DEFAULT 120 CHECK (quote_ttl_seconds BETWEEN 30 AND 300),
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(from_currency, to_currency, status, valid_from),
  CHECK (from_currency != to_currency),
  CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Create exchange_rate_history table
CREATE TABLE IF NOT EXISTS exchange_rate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_id uuid NOT NULL REFERENCES exchange_rates(id) ON DELETE CASCADE,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  old_rate numeric(20,8),
  new_rate numeric(20,8) NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  change_reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rate_id uuid NOT NULL REFERENCES exchange_rates(id),
  from_currency text NOT NULL CHECK (from_currency IN ('CFA', 'NGN', 'USDT')),
  to_currency text NOT NULL CHECK (to_currency IN ('CFA', 'NGN', 'USDT')),
  from_amount numeric(20,2) NOT NULL CHECK (from_amount > 0),
  exchange_rate numeric(20,8) NOT NULL CHECK (exchange_rate > 0),
  fee_flat numeric(20,2) NOT NULL DEFAULT 0 CHECK (fee_flat >= 0),
  fee_percentage numeric(5,4) NOT NULL DEFAULT 0 CHECK (fee_percentage >= 0),
  total_fee numeric(20,2) NOT NULL CHECK (total_fee >= 0),
  to_amount numeric(20,2) NOT NULL CHECK (to_amount > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'executed', 'expired', 'cancelled')),
  expires_at timestamptz NOT NULL,
  executed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  CHECK (from_currency != to_currency),
  CHECK (expires_at > created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_status ON exchange_rates(status);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_valid_from ON exchange_rates(valid_from);
CREATE INDEX IF NOT EXISTS idx_exchange_rate_history_rate_id ON exchange_rate_history(rate_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_rates
CREATE POLICY "Anyone can view active exchange rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (status = 'active' AND valid_from <= now() AND (valid_until IS NULL OR valid_until > now()));

-- RLS Policies for exchange_rate_history (read-only audit log)
CREATE POLICY "Authenticated users can view rate history"
  ON exchange_rate_history FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for quotes
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to log rate changes
CREATE OR REPLACE FUNCTION log_rate_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.rate != NEW.rate THEN
    INSERT INTO exchange_rate_history (rate_id, from_currency, to_currency, old_rate, new_rate, changed_by)
    VALUES (NEW.id, NEW.from_currency, NEW.to_currency, OLD.rate, NEW.rate, NEW.updated_by);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_rate_change_log
  AFTER UPDATE ON exchange_rates
  FOR EACH ROW
  WHEN (OLD.rate IS DISTINCT FROM NEW.rate)
  EXECUTE FUNCTION log_rate_change();

-- Insert default exchange rates (starting values - admin will adjust)
INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_flat, fee_percentage, min_amount, max_amount, quote_ttl_seconds)
VALUES
  -- CFA to NGN
  ('CFA', 'NGN', 2.50, 50, 0.0050, 1000, 5000000, 120),
  -- NGN to CFA
  ('NGN', 'CFA', 0.40, 50, 0.0050, 1000, 5000000, 120),
  -- CFA to USDT
  ('CFA', 'USDT', 0.0016, 1, 0.0075, 1000, 5000000, 120),
  -- USDT to CFA
  ('USDT', 'CFA', 625, 1, 0.0075, 10, 10000, 120),
  -- NGN to USDT
  ('NGN', 'USDT', 0.00064, 1, 0.0075, 1000, 5000000, 120),
  -- USDT to NGN
  ('USDT', 'NGN', 1562.50, 1, 0.0075, 10, 10000, 120)
ON CONFLICT DO NOTHING;