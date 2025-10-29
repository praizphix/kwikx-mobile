import { supabase } from '@/lib/supabase';
import type { Currency } from './wallets';

export type TransactionType = 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'reversal';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  from_currency: Currency | null;
  to_currency: Currency | null;
  from_wallet_id: string | null;
  to_wallet_id: string | null;
  from_amount: number | null;
  to_amount: number | null;
  fee_amount: number;
  exchange_rate: number | null;
  quote_id: string | null;
  reference: string | null;
  description: string | null;
  metadata: any;
  error_message: string | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

export async function getTransactionsByType(
  userId: string,
  type: TransactionType,
  limit: number = 50
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data;
}

export interface CreateTransactionParams {
  userId: string;
  type: TransactionType;
  fromCurrency?: Currency;
  toCurrency?: Currency;
  fromWalletId?: string;
  toWalletId?: string;
  fromAmount?: number;
  toAmount?: number;
  feeAmount?: number;
  exchangeRate?: number;
  quoteId?: string;
  reference?: string;
  description?: string;
  metadata?: any;
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<Transaction> {
  const {
    userId,
    type,
    fromCurrency,
    toCurrency,
    fromWalletId,
    toWalletId,
    fromAmount,
    toAmount,
    feeAmount = 0,
    exchangeRate,
    quoteId,
    reference,
    description,
    metadata = {},
  } = params;

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      status: 'pending',
      from_currency: fromCurrency || null,
      to_currency: toCurrency || null,
      from_wallet_id: fromWalletId || null,
      to_wallet_id: toWalletId || null,
      from_amount: fromAmount || null,
      to_amount: toAmount || null,
      fee_amount: feeAmount,
      exchange_rate: exchangeRate || null,
      quote_id: quoteId || null,
      reference: reference || null,
      description: description || null,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}
