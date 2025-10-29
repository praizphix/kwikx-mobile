import { supabase } from '@/lib/supabase';

export async function getActiveExchangeRate(
  fromCurrency: 'CFA' | 'NGN' | 'USDT',
  toCurrency: 'CFA' | 'NGN' | 'USDT'
) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .eq('status', 'active')
    .lte('valid_from', now)
    .or(`valid_until.is.null,valid_until.gte.${now}`)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createQuote(
  userId: string,
  rateId: string,
  fromCurrency: 'CFA' | 'NGN' | 'USDT',
  toCurrency: 'CFA' | 'NGN' | 'USDT',
  fromAmount: number,
  exchangeRate: number,
  feeFlat: number,
  feePercentage: number,
  totalFee: number,
  toAmount: number,
  quoteTtl: number = 120
) {
  const expiresAt = new Date(Date.now() + quoteTtl * 1000).toISOString();

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      user_id: userId,
      rate_id: rateId,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      from_amount: fromAmount,
      exchange_rate: exchangeRate,
      fee_flat: feeFlat,
      fee_percentage: feePercentage,
      total_fee: totalFee,
      to_amount: toAmount,
      status: 'active',
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuote(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function getQuoteTimeRemaining(expiresAt: string): number {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const remaining = Math.floor((expires - now) / 1000);
  return Math.max(0, remaining);
}

export async function markQuoteAsExecuted(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status: 'executed',
      executed_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markQuoteAsExpired(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .update({
      status: 'expired',
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
