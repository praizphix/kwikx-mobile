import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          country: string | null;
          kyc_status: 'pending' | 'verified' | 'rejected';
          kyc_level: number;
          created_at: string;
          updated_at: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          currency: 'CFA' | 'NGN' | 'USDT';
          balance: number;
          available_balance: number;
          reserved_balance: number;
          status: 'active' | 'frozen' | 'closed';
          daily_limit: number | null;
          monthly_limit: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      exchange_rates: {
        Row: {
          id: string;
          from_currency: 'CFA' | 'NGN' | 'USDT';
          to_currency: 'CFA' | 'NGN' | 'USDT';
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
        };
      };
      quotes: {
        Row: {
          id: string;
          user_id: string;
          rate_id: string;
          from_currency: 'CFA' | 'NGN' | 'USDT';
          to_currency: 'CFA' | 'NGN' | 'USDT';
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
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'exchange' | 'deposit' | 'withdrawal' | 'fee' | 'reversal';
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
          from_currency: 'CFA' | 'NGN' | 'USDT' | null;
          to_currency: 'CFA' | 'NGN' | 'USDT' | null;
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
        };
      };
    };
  };
};
