/*
  # Update Wallet Creation to Frozen Status

  1. Changes
    - Update handle_new_user trigger to create wallets with 'frozen' status
    - Wallets will remain frozen until KYC is approved
    - After KYC approval, admin activates CFA or NGN wallet
    - When either CFA or NGN is activated, USDT auto-activates

  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Drop existing trigger function and recreate with frozen status
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create user profile (only if doesn't exist)
  INSERT INTO public.profiles (id, email, kyc_status, kyc_level, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'pending', 0, now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Create three wallets for the new user with FROZEN status
  -- Wallets stay frozen until KYC approval
  INSERT INTO public.wallets (user_id, currency, balance, available_balance, reserved_balance, status)
  VALUES 
    (NEW.id, 'CFA', 0, 0, 0, 'frozen'),
    (NEW.id, 'NGN', 0, 0, 0, 'frozen'),
    (NEW.id, 'USDT', 0, 0, 0, 'frozen')
  ON CONFLICT (user_id, currency) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error for debugging
  RAISE LOG 'Error in handle_new_user for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  -- Re-raise to prevent user creation if something goes wrong
  RAISE;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add function to activate wallets after KYC approval
CREATE OR REPLACE FUNCTION activate_user_wallets(user_id_param uuid, currency_to_activate text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Activate the specified currency wallet (CFA or NGN)
  UPDATE wallets
  SET status = 'active', updated_at = now()
  WHERE user_id = user_id_param 
    AND currency = currency_to_activate
    AND status = 'frozen';

  -- Auto-activate USDT when CFA or NGN is activated
  IF currency_to_activate IN ('CFA', 'NGN') THEN
    UPDATE wallets
    SET status = 'active', updated_at = now()
    WHERE user_id = user_id_param 
      AND currency = 'USDT'
      AND status = 'frozen';
  END IF;

  -- Update profile KYC status to verified
  UPDATE profiles
  SET kyc_status = 'verified', kyc_level = 1, updated_at = now()
  WHERE id = user_id_param AND kyc_status = 'pending';
END;
$$;

-- Add function to handle KYC approval trigger
CREATE OR REPLACE FUNCTION handle_kyc_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_currency text;
BEGIN
  -- Only proceed if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Determine which currency to activate based on document type or user country
    SELECT country INTO user_currency FROM profiles WHERE id = NEW.user_id;
    
    -- Default activation logic: 
    -- If user is from Nigeria or mentions NGN, activate NGN
    -- Otherwise activate CFA (default for West Africa)
    IF user_currency ILIKE '%nigeria%' OR user_currency ILIKE '%ng%' THEN
      PERFORM activate_user_wallets(NEW.user_id, 'NGN');
    ELSE
      PERFORM activate_user_wallets(NEW.user_id, 'CFA');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on kyc_documents for auto-activation
DROP TRIGGER IF EXISTS on_kyc_approved ON kyc_documents;

CREATE TRIGGER on_kyc_approved
  AFTER UPDATE ON kyc_documents
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION handle_kyc_approval();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_status ON wallets(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(user_id, status);