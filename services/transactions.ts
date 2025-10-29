import { supabase } from '@/lib/supabase';
import { getWalletByCurrency, updateWalletBalance } from './wallets';
import { getQuote, markQuoteAsExecuted } from './quotes';
import uuid from 'react-native-uuid';

export interface ExecuteExchangeParams {
  userId: string;
  quoteId: string;
}

export interface ExecuteExchangeResult {
  transaction: any;
  fromWallet: any;
  toWallet: any;
}

export async function executeExchange({
  userId,
  quoteId,
}: ExecuteExchangeParams): Promise<ExecuteExchangeResult> {
  const quote = await getQuote(quoteId);

  if (!quote) {
    throw new Error('Quote not found');
  }

  if (quote.user_id !== userId) {
    throw new Error('Unauthorized: Quote does not belong to user');
  }

  if (quote.status !== 'active') {
    throw new Error(`Quote is ${quote.status} and cannot be executed`);
  }

  const now = new Date();
  const expiresAt = new Date(quote.expires_at);

  if (now >= expiresAt) {
    throw new Error('Quote has expired');
  }

  const fromWallet = await getWalletByCurrency(userId, quote.from_currency);
  const toWallet = await getWalletByCurrency(userId, quote.to_currency);

  if (!fromWallet || !toWallet) {
    throw new Error('Wallet not found for currency');
  }

  if (fromWallet.available_balance < quote.from_amount) {
    throw new Error('Insufficient balance in source wallet');
  }

  const transactionId = uuid.v4() as string;
  const reference = `EXC-${Date.now()}-${transactionId.substring(0, 8).toUpperCase()}`;

  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: userId,
      type: 'exchange',
      status: 'processing',
      from_currency: quote.from_currency,
      to_currency: quote.to_currency,
      from_wallet_id: fromWallet.id,
      to_wallet_id: toWallet.id,
      from_amount: quote.from_amount,
      to_amount: quote.to_amount,
      fee_amount: quote.total_fee,
      exchange_rate: quote.exchange_rate,
      quote_id: quoteId,
      reference,
      description: `Exchange ${quote.from_amount} ${quote.from_currency} to ${quote.to_amount} ${quote.to_currency}`,
      metadata: {
        quote_id: quoteId,
        rate_id: quote.rate_id,
        fee_flat: quote.fee_flat,
        fee_percentage: quote.fee_percentage,
      },
    })
    .select()
    .single();

  if (txError) {
    throw new Error(`Failed to create transaction: ${txError.message}`);
  }

  try {
    await updateWalletBalance(fromWallet.id, quote.from_amount, 'debit');

    await updateWalletBalance(toWallet.id, quote.to_amount, 'credit');

    await markQuoteAsExecuted(quoteId);

    const { data: completedTx, error: completeError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (completeError) throw completeError;

    return {
      transaction: completedTx,
      fromWallet: await getWalletByCurrency(userId, quote.from_currency),
      toWallet: await getWalletByCurrency(userId, quote.to_currency),
    };
  } catch (error) {
    await supabase
      .from('transactions')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        processed_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    throw error;
  }
}

export async function getTransactionById(transactionId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserTransactions(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getTransactionsByType(
  userId: string,
  type: 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'reversal',
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
