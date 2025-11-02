export type PaymentProvider = 'fedapay' | 'paystack' | 'kkiapay' | 'payonus' | 'squadco' | 'tatum';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer' | 'crypto';

export interface PaymentConfig {
  provider: PaymentProvider;
  publicKey?: string;
  secretKey?: string;
  apiKey?: string;
  environment: 'sandbox' | 'live';
  supportedCurrencies: string[];
  supportedMethods: PaymentMethod[];
}

export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerBirthDate?: string;
  customerBirthCity?: string;
  customerGender?: 'M' | 'F';
  preferredPaymentMethods?: string[];
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  reference?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  error?: string;
  data?: any;
}

export interface DepositRequest {
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  metadata?: Record<string, any>;
}

export interface DepositResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  reference?: string;
  message?: string;
  error?: string;
}

export interface WithdrawalRequest {
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  destinationAccount: string;
  destinationType: 'mobile' | 'bank' | 'crypto';
  metadata?: Record<string, any>;
}

export interface WithdrawalResponse {
  success: boolean;
  transactionId?: string;
  reference?: string;
  message?: string;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  paidAt?: string;
  reference?: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface FedaPayTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  created_at: string;
}

export interface PaystackTransaction {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string;
  customer?: {
    email: string;
  };
}

export interface KKiapayTransaction {
  transactionId: string;
  amount: number;
  status: string;
  performedAt: string;
}
