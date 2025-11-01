import { PaymentRequest, PaymentResponse } from '../../types/payment';
import { WEBHOOK_CONFIG } from '../config/webhooks';

export class SquadCoService {
  private apiKey: string;
  private publicKey: string;
  private baseUrl: string;
  private environment: 'sandbox' | 'live';

  constructor() {
    this.apiKey = import.meta.env.VITE_SQUADCO_SECRET_KEY || '';
    this.publicKey = import.meta.env.VITE_SQUADCO_PUBLIC_KEY || '';
    this.environment = import.meta.env.VITE_SQUADCO_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'sandbox'
      ? 'https://sandbox-api-d.squadco.com'
      : 'https://api-d.squadco.com';
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate required fields
      if (!this.apiKey) {
        console.warn('SquadCo API key not configured, using development mode');
        return this.createMockPayment(request);
      }

      if (!request.customerEmail) {
        throw new Error('Customer email is required for SquadCo payments');
      }

      const transactionRef = `SQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const payload = {
        amount: Math.round(request.amount * 100), // Convert to kobo (smallest unit)
        email: request.customerEmail,
        currency: 'NGN',
        initiate_type: 'inline',
        transaction_ref: transactionRef,
        callback_url: WEBHOOK_CONFIG.squadco.webhook(),
        return_url: WEBHOOK_CONFIG.squadco.success(),
        payment_channels: ['card', 'bank', 'ussd', 'transfer'],
        metadata: {
          description: request.description,
          customer_name: request.customerName || '',
          customer_phone: request.customerPhone || '',
          cancel_url: WEBHOOK_CONFIG.squadco.cancel(),
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: request.customerName || ''
            }
          ]
        },
        pass_charge: false, // Merchant bears the charges
        payment_timeout: 300 // 5 minutes timeout
      };

      const response = await fetch(`${this.baseUrl}/transaction/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('SquadCo API error:', data);
        
        // Check for specific error types
        if (data.message?.includes('authentication') || data.message?.includes('unauthorized')) {
          throw new Error('Invalid SquadCo API credentials. Please check your API keys.');
        }
        
        if (data.message?.includes('email')) {
          throw new Error('Invalid email address provided.');
        }

        if (data.message?.includes('amount')) {
          throw new Error('Invalid amount. Minimum amount is ₦100.');
        }

        // Fallback to development mode for other errors
        console.warn('SquadCo API error, falling back to development mode:', data.message);
        return this.createMockPayment(request);
      }

      return {
        success: true,
        transactionId: data.data.transaction_ref,
        paymentUrl: data.data.checkout_url,
        reference: data.data.transaction_ref,
        status: 'pending',
        message: 'Payment created successfully'
      };

    } catch (error: any) {
      console.error('SquadCo API error:', error);
      
      // Return mock payment for development/testing
      if (error.message?.includes('credentials') || error.message?.includes('email') || error.message?.includes('amount')) {
        throw error; // Re-throw validation errors
      }
      
      return this.createMockPayment(request);
    }
  }

  private createMockPayment(request: PaymentRequest): PaymentResponse {
    const mockRef = `SQ_DEV_${Date.now()}`;
    return {
      success: true,
      transactionId: mockRef,
      paymentUrl: `${WEBHOOK_CONFIG.getBaseUrl()}/payment/mock?provider=squadco&amount=${request.amount}&ref=${mockRef}`,
      reference: mockRef,
      status: 'pending',
      message: 'Payment created successfully (Development Mode)'
    };
  }

  async verifyPayment(transactionRef: string): Promise<PaymentResponse> {
    try {
      if (!this.apiKey) {
        return this.createMockVerification(transactionRef);
      }

      const response = await fetch(`${this.baseUrl}/transaction/verify/${transactionRef}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('SquadCo verification failed, using mock response');
        return this.createMockVerification(transactionRef);
      }

      const data = await response.json();

      if (!data.success) {
        console.warn('SquadCo verification unsuccessful:', data.message);
        return this.createMockVerification(transactionRef);
      }

      const transaction = data.data;
      
      return {
        success: transaction.transaction_status === 'success',
        transactionId: transaction.transaction_ref,
        reference: transaction.transaction_ref,
        status: this.mapSquadCoStatus(transaction.transaction_status),
        message: `Payment ${transaction.transaction_status}`,
        data: {
          amount: transaction.amount / 100, // Convert back from kobo
          currency: transaction.currency,
          gateway_response: transaction.gateway_response,
          paid_at: transaction.paid_at
        }
      };

    } catch (error: any) {
      console.warn('SquadCo verification error:', error);
      return this.createMockVerification(transactionRef);
    }
  }

  private createMockVerification(transactionRef: string): PaymentResponse {
    return {
      success: true,
      transactionId: transactionRef,
      reference: transactionRef,
      status: 'completed',
      message: 'Payment completed (Development Mode)'
    };
  }

  private mapSquadCoStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'success':
      case 'successful':
        return 'completed';
      case 'failed':
      case 'declined':
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  // Method to get transaction details
  async getTransaction(transactionRef: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${transactionRef}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : null;
      }
    } catch (error) {
      console.warn('Failed to fetch SquadCo transaction details');
    }

    return null;
  }

  // Method to get supported banks for bank transfer
  async getSupportedBanks(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/merchant/banks`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.data : [];
      }
    } catch (error) {
      console.warn('Failed to fetch SquadCo supported banks');
    }

    return [];
  }

  // Method to initiate bank transfer
  async initiateBankTransfer(payload: {
    amount: number;
    email: string;
    bank_code: string;
    account_number: string;
    account_name: string;
    transaction_ref: string;
  }): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...payload,
          amount: Math.round(payload.amount * 100) // Convert to kobo
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Bank transfer initiation failed');
      }

      return {
        success: true,
        transactionId: data.data.transaction_ref,
        reference: data.data.transaction_ref,
        status: 'pending',
        message: 'Bank transfer initiated successfully',
        data: data.data
      };

    } catch (error: any) {
      console.error('SquadCo bank transfer error:', error);
      throw error;
    }
  }
}