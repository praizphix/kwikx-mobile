/*
  # Freeze Existing Unverified User Wallets

  1. Changes
    - Freeze all wallets for users with pending or rejected KYC status
    - Only affects existing users who haven't completed KYC
    - Verified users keep their active wallets

  2. Notes
    - This migration ensures consistency with new KYC workflow
    - Users with pending KYC will need to complete verification
    - Admin can approve to reactivate wallets
*/

-- Freeze wallets for users who haven't completed KYC
UPDATE wallets
SET status = 'frozen', updated_at = now()
WHERE user_id IN (
  SELECT id FROM profiles
  WHERE kyc_status IN ('pending', 'rejected')
)
AND status = 'active';

-- Log the affected users
DO $$
DECLARE
  affected_count integer;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO affected_count
  FROM wallets
  WHERE status = 'frozen';
  
  RAISE NOTICE 'Frozen wallets for % users with unverified KYC status', affected_count;
END $$;