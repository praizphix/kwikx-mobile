export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  created_at: string;
  kyc_status?: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
  type?: 'crypto' | 'fiat';
  status?: 'active' | 'frozen' | 'suspended';
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'exchange' | 'transfer' | 'send' | 'receive';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  description?: string;
  metadata?: any;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export interface KYCApplication {
  id: string;
  user_id: string;
  full_name: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  id_type: string;
  id_number: string;
  id_document_url?: string;
  selfie_url?: string;
  proof_of_address_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  bvn?: string;
  nin?: string;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'support';
  created_at: string;
  last_login?: string;
  two_factor_enabled: boolean;
}

export interface UserLog {
  id: string;
  user_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  metadata?: any;
}
