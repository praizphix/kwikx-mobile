import { supabase } from '@/lib/supabase';

export type Currency = 'CFA' | 'NGN' | 'USDT';

export interface Wallet {
  id: string;
  user_id: string;
  currency: Currency;
  balance: number;
  available_balance: number;
  reserved_balance: number;
  status: 'active' | 'frozen' | 'closed';
  daily_limit: number | null;
  monthly_limit: number | null;
  created_at: string;
  updated_at: string;
}

export async function getUserWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('currency');

  if (error) {
    throw new Error(`Failed to fetch wallets: ${error.message}`);
  }

  return data || [];
}

export async function getWalletByCurrency(
  userId: string,
  currency: Currency
): Promise<Wallet | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch wallet: ${error.message}`);
  }

  return data;
}

export async function getTotalBalance(userId: string): Promise<number> {
  const wallets = await getUserWallets(userId);
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}
