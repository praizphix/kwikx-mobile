export type Currency = 'CFA' | 'NGN' | 'USDT';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  CFA: 'FCFA',
  NGN: '₦',
  USDT: '$',
};

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

export interface Transaction {
  id: string;
  user_id: string;
  type: 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'reversal';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
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

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_level: number;
  created_at: string;
  updated_at: string;
}

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
  valid_from: string;
  valid_until: string | null;
  quote_ttl_seconds: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
