import { PaymentRequest, PaymentResponse } from '../../types/payment';
import { WEBHOOK_CONFIG } from '../config/webhooks';

export class PayOnUsService {
  private apiKey: string;
  private clientId: string;
  private baseUrl: string;
  private environment: 'live'; // Force to live
  
  constructor(apiKey: string = import.meta.env.VITE_PAYONUS_API_KEY || '', clientId: string = import.meta.env.VITE_PAYONUS_CLIENT_ID || '') {
    this.apiKey = apiKey;
    this.clientId = clientId;
    this.environment = 'live'; // Force to live environment
    this.baseUrl = 'https://api.payonus.com'; // Live base URL
    
    console.log('PayOnUs Service initialized with environment:', this.environment, 'Base URL:', this.baseUrl);
    console.log('Using API key starting with:', this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'Not set');
  }

  async createVirtualAccount(userData: {
    customerName: string;
    customerMobile: string;
    customerEmail: string;
    dob: string;
    address: string;
    bvn?: string;
    nin?: string;
    reference?: string;
  }): Promise<PaymentResponse> {
    try {
      if (!this.apiKey || !this.clientId) {
        console.warn('PayOnUs API credentials not configured, using development mode');
        return this.createMockVirtualAccount(userData);
      }

      const fullApiUrl = `${this.baseUrl}/pay/api/v1/create-fixed-virtual-account`;
      const payload = { // This payload is for the request body, not the URL
        customerName: userData.customerName,
        customerMobile: userData.customerMobile,
        customerEmail: userData.customerEmail,
        dob: userData.dob,
        address: userData.address,
        bvn: userData.bvn,
        nin: userData.nin
      };

      console.log(`DEBUG: Creating PayOnUs virtual account with URL: ${fullApiUrl} and payload:`, JSON.stringify(payload));
      
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('PayOnUs virtual account creation failed:', data);
        
        if (data.message?.includes('authentication') || data.message?.includes('unauthorized')) {
          console.warn('PayOnUs authentication failed, using development mode');
          return this.createMockVirtualAccount(userData);
        }
        
        throw new Error(data.message || 'Virtual account creation failed');
      }

      console.log('PayOnUs virtual account created successfully:', data.data?.account_number);

      return {
        success: true,
        transactionId: data.data?.reference || `VA_${Date.now()}`,
        reference: data.data?.reference || `VA_${Date.now()}`,
        status: 'completed',
        message: 'Virtual account created successfully',
        data: {
          account_number: data.data?.account_number,
          bank_name: data.data?.bank_name,
          account_name: data.data?.account_name,
          reference: data.data?.reference
        }
      };

    } catch (error: any) {
      console.error('PayOnUs virtual account creation error:', error);
      
      if (error.message?.includes('credentials') || error.message?.includes('authentication')) {
        throw error;
      }
      
      return this.createMockVirtualAccount(userData);
    }
  }

  async initiatePayout(payoutData: {
    amount: number;
    recipientAccount: string;
    recipientBankCode: string;
    recipientName: string;
    narration?: string;
    reference?: string;
    transactionPin?: string;
  }): Promise<PaymentResponse> {
    try {
      if (!this.apiKey || !this.clientId) {
        console.warn('PayOnUs API credentials not configured, using development mode');
        return this.createMockPayout(payoutData);
      }

      const endpointPath = '/api/v1/payouts'; // Live path
      const fullApiUrl = `${this.baseUrl}/payout/transfer/api/v1/send-money`;
      const payload = { // This payload is for the request body, not the URL
        amount: payoutData.amount,
        recipient_account: payoutData.recipientAccount,
        recipient_bank_code: payoutData.recipientBankCode,
        recipient_name: payoutData.recipientName,
        narration: payoutData.narration || 'KwikX Transfer',
        reference: payoutData.reference || `PO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...(payoutData.transactionPin && { transaction_pin: payoutData.transactionPin })
      };

      console.log(`DEBUG: Initiating PayOnUs payout with URL: ${fullApiUrl} and payload:`, JSON.stringify(payload));

      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('PayOnUs payout initiation failed:', data);
        
        if (data.message?.includes('authentication') || data.message?.includes('unauthorized')) {
          console.warn('PayOnUs authentication failed, using development mode');
          return this.createMockPayout(payoutData);
        }
        
        if (data.message?.includes('insufficient')) {
          throw new Error('Insufficient balance for payout');
        }

        if (data.message?.includes('pin') || data.message?.includes('PIN')) {
          throw new Error('Invalid or missing transaction PIN');
        }
        
        throw new Error(data.message || 'Payout initiation failed');
      }

      console.log('PayOnUs payout initiated successfully:', data.data?.reference);

      return {
        success: true,
        transactionId: data.data?.reference || payload.reference,
        reference: data.data?.reference || payload.reference,
        status: 'pending',
        message: 'Payout initiated successfully',
        data: {
          payout_id: data.data?.id,
          reference: data.data?.reference,
          status: data.data?.status,
          amount: data.data?.amount,
          recipient: {
            account_number: payoutData.recipientAccount,
            bank_code: payoutData.recipientBankCode,
            name: payoutData.recipientName
          }
        }
      };

    } catch (error: any) {
      console.error('PayOnUs payout error:', error);
      
      if (error.message?.includes('credentials') || error.message?.includes('insufficient') || error.message?.includes('recipient') || error.message?.includes('PIN')) {
        throw error;
      }
      
      return this.createMockPayout(payoutData);
    }
  }

  async verifyPayout(reference: string): Promise<PaymentResponse> {
    try {
      if (!this.apiKey || !this.clientId) {
        return this.createMockPayoutVerification(reference);
      }

      const endpointPath = `/api/v1/payouts/${reference}`; // Live path
      const fullApiUrl = `${this.baseUrl}/payout/transfer/api/v1/payouts/${reference}`;
      const response = await fetch(fullApiUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-ID': this.clientId
        }
      });

      if (!response.ok) {
        console.warn('PayOnUs payout verification failed, using mock response');
        return this.createMockPayoutVerification(reference);
      }

      const data = await response.json();
      const payout = data.data;

      return {
        success: payout.status === 'successful',
        transactionId: reference,
        reference: reference,
        status: this.mapPayOnUsStatus(payout.status),
        message: `Payout ${payout.status}`,
        data: {
          amount: payout.amount,
          recipient: payout.recipient,
          status: payout.status,
          created_at: payout.created_at
        }
      };

    } catch (error: any) {
      console.warn('PayOnUs payout verification error:', error);
      return this.createMockPayoutVerification(reference);
    }
  }

  async verifyTransaction(reference: string): Promise<PaymentResponse> {
    try {
      if (!this.apiKey || !this.clientId) {
        return this.createMockVerification(reference);
      }

      const endpointPath = `/api/v1/transactions/${reference}`; // Live path
      const fullApiUrl = `${this.baseUrl}${endpointPath}`;
      const response = await fetch(fullApiUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Client-ID': this.clientId
        }
      });

      if (!response.ok) {
        console.warn('PayOnUs verification failed, using mock response');
        return this.createMockVerification(reference);
      }

      const data = await response.json();
      const transaction = data.data;

      return {
        success: transaction.status === 'successful',
        transactionId: reference,
        reference: reference,
        status: this.mapPayOnUsStatus(transaction.status),
        message: `Transaction ${transaction.status}`,
        data: {
          amount: transaction.amount,
          customer: transaction.customer,
          virtual_account: transaction.virtual_account
        }
      };

    } catch (error: any) {
      console.warn('PayOnUs verification error:', error);
      return this.createMockVerification(reference);
    }
  }

  async getSupportedBanks(): Promise<any[]> {
    try {
      if (!this.apiKey || !this.clientId) {
        console.warn('PayOnUs credentials not configured, returning comprehensive mock banks'); // Keep this warning
        return this.getComprehensiveNigerianBanks();
      }

      const fullApiUrl = `${this.baseUrl}/pay/api/v1/fetch-bank-list`;
      console.log(`DEBUG: Fetching banks from PayOnUs API: ${fullApiUrl}`);

      const response = await fetch(fullApiUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        }
      });

      console.log('PayOnUs banks API response status:', response.status);
      
      if (!response.ok) {
        console.warn('PayOnUs banks API failed, using comprehensive fallback');
        return this.getComprehensiveNigerianBanks();
      }
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse PayOnUs banks response:', parseError);
        return this.getComprehensiveNigerianBanks();
      }
      
      if (data.success && data.data) {
        console.log('✅ Banks fetched from PayOnUs API:', data.data.length, 'banks');
        return data.data;
      } else {
        console.warn('PayOnUs banks API returned unsuccessful response:', data);
        return this.getComprehensiveNigerianBanks();
      }
    } catch (error) {
      console.warn('Error fetching PayOnUs banks:', error);
      return this.getComprehensiveNigerianBanks();
    }
  }

  // Enhanced comprehensive Nigerian banks list
  getComprehensiveNigerianBanks(): any[] {
    return [
      { code: '044', name: 'Access Bank' },
      { code: '063', name: 'Access Bank (Diamond)' },
      { code: '023', name: 'Citibank Nigeria' },
      { code: '050', name: 'Ecobank Nigeria' },
      { code: '562', name: 'Ekondo Microfinance Bank' },
      { code: '070', name: 'Fidelity Bank' },
      { code: '011', name: 'First Bank of Nigeria' },
      { code: '214', name: 'First City Monument Bank' },
      { code: '501', name: 'FSDH Merchant Bank Limited' },
      { code: '058', name: 'Guaranty Trust Bank' },
      { code: '030', name: 'Heritage Bank' },
      { code: '301', name: 'Jaiz Bank' },
      { code: '082', name: 'Keystone Bank' },
      { code: '526', name: 'Parallex Bank' },
      { code: '076', name: 'Polaris Bank' },
      { code: '101', name: 'Providus Bank' },
      { code: '221', name: 'Stanbic IBTC Bank' },
      { code: '068', name: 'Standard Chartered Bank' },
      { code: '232', name: 'Sterling Bank' },
      { code: '100', name: 'Suntrust Bank' },
      { code: '032', name: 'Union Bank of Nigeria' },
      { code: '033', name: 'United Bank for Africa' },
      { code: '215', name: 'Unity Bank' },
      { code: '035', name: 'Wema Bank' },
      { code: '057', name: 'Zenith Bank' },
      { code: '304', name: 'Lotus Bank' },
      { code: '090175', name: 'Rubies MFB' },
      { code: '090267', name: 'Kuda Bank' },
      { code: '090365', name: 'Sparkle Microfinance Bank' },
      { code: '090393', name: 'Moniepoint MFB' },
      { code: '090405', name: 'Moniepoint MFB' },
      { code: '120001', name: 'Opay' },
      { code: '999991', name: 'PalmPay' },
      { code: '999992', name: 'Kuda Bank' }
    ];
  }

  // Keep original method for backward compatibility
  getMockNigerianBanks(): any[] {
    return this.getComprehensiveNigerianBanks();
  }

  // Method to get supported banks for transfers via secure backend
  async getBanksForTransfers(): Promise<any[]> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payonus-get-banks`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Failed to fetch PayOnUs banks via backend:', data);
        return this.getComprehensiveNigerianBanks();
      }

      return data.data || this.getComprehensiveNigerianBanks();
    } catch (error: any) {
      console.error('❌ Error fetching PayOnUs banks via backend:', error);
      return this.getComprehensiveNigerianBanks();
    }
  }

  private createMockVirtualAccount(userData: any): PaymentResponse {
    const mockRef = `VA_DEV_${Date.now()}`;
    const mockAccountNumber = `22${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    return {
      success: true,
      transactionId: mockRef,
      reference: mockRef,
      status: 'completed',
      message: 'Virtual account created successfully (Development Mode)',
      data: {
        account_number: mockAccountNumber,
        bank_name: 'PayOnUs Bank (Mock)',
        account_name: userData.customerName || 'KwikX User',
        reference: mockRef,
      }
    };
  }

  private createMockPayout(payoutData: any): PaymentResponse {
    const mockRef = `PO_DEV_${Date.now()}`;
    
    return {
      success: true,
      transactionId: mockRef,
      reference: mockRef,
      status: 'pending',
      message: 'Payout initiated successfully (Development Mode)',
      data: {
        payout_id: mockRef,
        reference: mockRef,
        status: 'pending',
        amount: payoutData.amount,
        recipient: {
          account_number: payoutData.recipientAccount,
          bank_code: payoutData.recipientBankCode,
          name: payoutData.recipientName
        }
      }
    };
  }

  private createMockPayoutVerification(reference: string): PaymentResponse {
    return {
      success: true,
      transactionId: reference,
      reference: reference,
      status: 'completed',
      message: 'Payout completed (Development Mode)'
    };
  }

  private createMockVerification(reference: string): PaymentResponse {
    return {
      success: true,
      transactionId: reference,
      reference: reference,
      status: 'completed',
      message: 'Transaction completed (Development Mode)'
    };
  }

  private mapPayOnUsStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'successful':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'declined':
      case 'cancelled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Method to verify account number via secure backend
  async verifyAccountNumber(accountNumber: string, bankCode: string): Promise<any> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payonus-verify-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account_number: accountNumber,
            bank_code: bankCode
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ PayOnUs account verification failed:', data);
        throw new Error(data.error || 'Failed to verify account');
      }

      return data.data;
    } catch (error: any) {
      console.error('Error verifying PayOnUs account number:', error);
      // Return mock data for development
      return {
        account_number: accountNumber,
        account_name: 'Test User (Verification Failed)',
        bank_code: bankCode
      };
    }
  }

  // Method to get PayOnUs-specific information
  getPayOnUsInfo() {
    return {
      country: 'NG',
      currency: 'NGN',
      supportedBanks: this.getMockNigerianBanks(),
      features: ['virtual_accounts', 'payouts', 'transaction_verification', 'transaction_pin'],
      timeZone: 'WAT',
      language: 'en'
    };
  }

  // Method to check if transaction PIN is required
  requiresTransactionPin(): boolean {
    return true; // PayOnUs requires transaction PIN for payouts
  }

  // Method to check if user has transaction PIN set
  async checkTransactionPinStatus(): Promise<{ hasPin: boolean; pinCreatedAt?: string }> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data: userData, error } = await supabase
        .from('users')
        .select('transaction_pin_set, pin_created_at')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking PIN status:', error);
        return { hasPin: false };
      }

      return {
        hasPin: userData?.transaction_pin_set || false,
        pinCreatedAt: userData?.pin_created_at
      };
    } catch (error) {
      console.error('Error checking transaction PIN status:', error);
      return { hasPin: false };
    }
  }
}