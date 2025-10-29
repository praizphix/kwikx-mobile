export type Currency = 'CFA' | 'NGN' | 'USDT';

export type KYCStatus = 'pending' | 'verified' | 'rejected';

export type WalletStatus = 'active' | 'frozen' | 'closed';

export type RateStatus = 'active' | 'inactive' | 'scheduled';

export type QuoteStatus = 'active' | 'executed' | 'expired' | 'cancelled';

export type TransactionType = 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'reversal';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';

export type DepositMethodType = 'bank_transfer' | 'card' | 'mobile_money' | 'crypto_wallet';

export type WithdrawalMethodType = 'bank_transfer' | 'mobile_money' | 'crypto_wallet';

export type PaymentMethodStatus = 'active' | 'inactive' | 'pending_verification';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  kyc_status: KYCStatus;
  kyc_level: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: Currency;
  balance: number;
  available_balance: number;
  reserved_balance: number;
  status: WalletStatus;
  daily_limit: number | null;
  monthly_limit: number | null;
  created_at: string;
  updated_at: string;
}

export interface WalletLimit {
  id: string;
  kyc_level: number;
  currency: Currency;
  daily_limit: number;
  monthly_limit: number;
  single_transaction_limit: number;
  withdrawal_daily_limit: number;
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
  status: RateStatus;
  valid_from: string;
  valid_until: string | null;
  quote_ttl_seconds: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
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
  status: QuoteStatus;
  expires_at: string;
  executed_at: string | null;
  created_at: string;
}

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
  metadata: Record<string, any>;
  error_message: string | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepositMethod {
  id: string;
  user_id: string;
  currency: Currency;
  method_type: DepositMethodType;
  provider: string;
  account_details: Record<string, any>;
  is_default: boolean;
  is_verified: boolean;
  status: PaymentMethodStatus;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalMethod {
  id: string;
  user_id: string;
  currency: Currency;
  method_type: WithdrawalMethodType;
  provider: string;
  account_details: Record<string, any>;
  is_default: boolean;
  is_verified: boolean;
  status: PaymentMethodStatus;
  created_at: string;
  updated_at: string;
}

export interface CurrencyPair {
  from: Currency;
  to: Currency;
  label: string;
}

export const CURRENCY_PAIRS: CurrencyPair[] = [
  { from: 'CFA', to: 'NGN', label: 'CFA → NGN' },
  { from: 'NGN', to: 'CFA', label: 'NGN → CFA' },
  { from: 'CFA', to: 'USDT', label: 'CFA → USDT' },
  { from: 'USDT', to: 'CFA', label: 'USDT → CFA' },
  { from: 'NGN', to: 'USDT', label: 'NGN → USDT' },
  { from: 'USDT', to: 'NGN', label: 'USDT → NGN' },
];

export const CURRENCIES: Currency[] = ['CFA', 'NGN', 'USDT'];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CFA: 'FCFA',
  NGN: '₦',
  USDT: '$',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  CFA: 'West African CFA Franc',
  NGN: 'Nigerian Naira',
  USDT: 'Tether USD',
};
