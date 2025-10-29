import { supabase } from '@/lib/supabase';
import type { Currency } from './wallets';

export interface ExchangeRate {
  id: string;
  from_currency: Currency;
  to_currency: Currency;
  rate: number;
  fee_flat: number;
  fee_percentage: number;
  min_amount: number;
  max_amount: number;
  status: 'active' | 'inactive' | 'scheduled';
  quote_ttl_seconds: number;
}

export interface Quote {
  id: string;
  user_id: string;
  rate_id: string;
  from_currency: Currency;
  to_currency: Currency;
  from_amount: number;
  exchange_rate: number;
  fee_flat: number;
  fee_percentage: number;
  total_fee: number;
  to_amount: number;
  status: 'active' | 'executed' | 'expired' | 'cancelled';
  expires_at: string;
  executed_at: string | null;
  created_at: string;
}

export interface CreateQuoteParams {
  userId: string;
  fromCurrency: Currency;
  toCurrency: Currency;
  fromAmount: number;
}

export async function getActiveExchangeRate(
  fromCurrency: Currency,
  toCurrency: Currency
): Promise<ExchangeRate | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('from_currency', fromCurrency)
    .eq('to_currency', toCurrency)
    .eq('status', 'active')
    .lte('valid_from', now)
    .or(`valid_until.is.null,valid_until.gt.${now}`)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch exchange rate: ${error.message}`);
  }

  return data;
}

export async function createQuote(
  params: CreateQuoteParams
): Promise<Quote> {
  const { userId, fromCurrency, toCurrency, fromAmount } = params;

  const rate = await getActiveExchangeRate(fromCurrency, toCurrency);

  if (!rate) {
    throw new Error(`No active exchange rate for ${fromCurrency} to ${toCurrency}`);
  }

  if (fromAmount < rate.min_amount) {
    throw new Error(`Minimum amount is ${rate.min_amount} ${fromCurrency}`);
  }

  if (fromAmount > rate.max_amount) {
    throw new Error(`Maximum amount is ${rate.max_amount} ${fromCurrency}`);
  }

  const totalFee = rate.fee_flat + (fromAmount * rate.fee_percentage);
  const grossAmount = fromAmount * rate.rate;
  const toAmount = grossAmount - totalFee;

  if (toAmount <= 0) {
    throw new Error('Amount too small after fees');
  }

  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + rate.quote_ttl_seconds);

  const { data, error } = await supabase
    .from('quotes')
    .insert({
      user_id: userId,
      rate_id: rate.id,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      from_amount: fromAmount,
      exchange_rate: rate.rate,
      fee_flat: rate.fee_flat,
      fee_percentage: rate.fee_percentage,
      total_fee: totalFee,
      to_amount: toAmount,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create quote: ${error.message}`);
  }

  return data;
}

export async function getQuote(quoteId: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }

  return data;
}

export function isQuoteExpired(quote: Quote): boolean {
  return new Date(quote.expires_at) < new Date();
}

export function getQuoteTimeRemaining(quote: Quote): number {
  const expiresAt = new Date(quote.expires_at);
  const now = new Date();
  const remainingMs = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000));
}
