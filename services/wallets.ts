import { supabase } from '@/lib/supabase';

export async function getUserWallets(userId: string, includeAll: boolean = false) {
  let query = supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  if (!includeAll) {
    query = query.eq('status', 'active');
  }

  const { data, error } = await query.order('currency');

  if (error) throw error;
  return data || [];
}

export async function getActiveWallets(userId: string) {
  return getUserWallets(userId, false);
}

export async function getAllWallets(userId: string) {
  return getUserWallets(userId, true);
}

export async function getWalletByCurrency(userId: string, currency: 'CFA' | 'NGN' | 'USDT') {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTotalBalance(userId: string) {
  const wallets = await getUserWallets(userId);

  const total = wallets.reduce((sum, wallet) => {
    let valueInUSD = 0;

    if (wallet.currency === 'CFA') {
      valueInUSD = wallet.balance / 625;
    } else if (wallet.currency === 'NGN') {
      valueInUSD = wallet.balance / 1562.5;
    } else if (wallet.currency === 'USDT') {
      valueInUSD = wallet.balance;
    }

    return sum + valueInUSD;
  }, 0);

  return total;
}

export async function updateWalletBalance(
  walletId: string,
  amount: number,
  type: 'credit' | 'debit'
) {
  const { data: wallet, error: fetchError } = await supabase
    .from('wallets')
    .select('balance, available_balance')
    .eq('id', walletId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!wallet) throw new Error('Wallet not found');

  const newBalance = type === 'credit'
    ? wallet.balance + amount
    : wallet.balance - amount;

  const newAvailableBalance = type === 'credit'
    ? wallet.available_balance + amount
    : wallet.available_balance - amount;

  if (newBalance < 0 || newAvailableBalance < 0) {
    throw new Error('Insufficient balance');
  }

  const { data, error: updateError } = await supabase
    .from('wallets')
    .update({
      balance: newBalance,
      available_balance: newAvailableBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', walletId)
    .select()
    .single();

  if (updateError) throw updateError;
  return data;
}
