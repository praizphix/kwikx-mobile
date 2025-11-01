import Constants from 'expo-constants';

interface FedaPayTransaction {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  data?: any;
}

interface FedaPayPaymentRequest {
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  userId: string;
}

class FedaPayService {
  private apiKey: string;
  private publicKey: string;
  private baseUrl: string;
  private environment: 'sandbox' | 'live';

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_FEDAPAY_SECRET_KEY ||
                  process.env.EXPO_PUBLIC_FEDAPAY_SECRET_KEY || '';
    this.publicKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_FEDAPAY_PUBLIC_KEY ||
                     process.env.EXPO_PUBLIC_FEDAPAY_PUBLIC_KEY || '';
    this.environment = Constants.expoConfig?.extra?.EXPO_PUBLIC_FEDAPAY_ENVIRONMENT ||
                       process.env.EXPO_PUBLIC_FEDAPAY_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'sandbox'
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'FedaPay-Version': '2022-05-06'
    };
  }

  async createDeposit(request: FedaPayPaymentRequest): Promise<FedaPayTransaction> {
    try {
      if (!this.apiKey || !this.apiKey.startsWith('sk_')) {
        throw new Error('FedaPay API key not configured or invalid');
      }

      // Create customer
      const customerPayload = {
        firstname: request.customerName.split(' ')[0] || 'Customer',
        lastname: request.customerName.split(' ').slice(1).join(' ') || 'User',
        email: request.customerEmail,
        phone_number: request.customerPhone ? {
          number: this.formatBeninPhoneNumber(request.customerPhone),
          country: 'BJ'
        } : undefined,
        nationality: 'BJ',
        tags: ['kwikx-mobile', 'cfa-deposit']
      };

      let customerId;
      try {
        const customerResponse = await fetch(`${this.baseUrl}/customers`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(customerPayload)
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          customerId = customerData.v1.id;
        }
      } catch (error) {
        console.warn('Customer creation failed, continuing without:', error);
      }

      // Create transaction
      const transactionPayload = {
        description: request.description,
        amount: Math.round(request.amount), // CFA amounts should be integers
        currency: {
          iso: 'XOF' // West African CFA franc
        },
        ...(customerId && { customer: { id: customerId } }),
        custom_metadata: {
          platform: 'kwikx-mobile',
          wallet_type: 'cfa',
          user_id: request.userId,
          country: 'BJ',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(transactionPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transaction');
      }

      const data = await response.json();

      // Generate payment token
      let paymentUrl = '';
      try {
        const tokenResponse = await fetch(`${this.baseUrl}/transactions/${data.v1.id}/token`, {
          method: 'POST',
          headers: this.getHeaders()
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          paymentUrl = tokenData.v1.url;
        }
      } catch (error) {
        console.warn('Token generation failed:', error);
      }

      return {
        success: true,
        transactionId: data.v1.id,
        paymentUrl,
        reference: data.v1.reference || data.v1.id,
        status: 'pending',
        message: 'Payment created successfully',
        data: {
          customer_id: customerId,
          transaction_id: data.v1.id,
          currency: 'XOF',
          amount: data.v1.amount
        }
      };

    } catch (error: any) {
      console.error('FedaPay deposit error:', error);
      return {
        success: false,
        transactionId: '',
        reference: '',
        status: 'failed',
        message: error.message || 'Failed to create deposit'
      };
    }
  }

  async verifyTransaction(transactionId: string): Promise<FedaPayTransaction> {
    try {
      if (!this.apiKey) {
        throw new Error('FedaPay API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      const data = await response.json();
      const transaction = data.v1;

      return {
        success: transaction.status === 'approved',
        transactionId: transaction.id,
        reference: transaction.reference || transaction.id,
        status: this.mapFedaPayStatus(transaction.status),
        message: `Transaction ${transaction.status}`,
        data: {
          amount: transaction.amount,
          currency: transaction.currency?.iso,
          customer_id: transaction.customer?.id,
          fees: transaction.fees,
          created_at: transaction.created_at
        }
      };

    } catch (error: any) {
      console.error('FedaPay verification error:', error);
      return {
        success: false,
        transactionId,
        reference: transactionId,
        status: 'failed',
        message: error.message || 'Failed to verify transaction'
      };
    }
  }

  async createPayout(request: {
    amount: number;
    customerPhone: string;
    customerName: string;
    description: string;
    userId: string;
  }): Promise<FedaPayTransaction> {
    try {
      if (!this.apiKey) {
        throw new Error('FedaPay API key not configured');
      }

      // Create payout transaction
      const payoutPayload = {
        mode: 'mtn', // Mobile money operator
        amount: Math.round(request.amount),
        currency: {
          iso: 'XOF'
        },
        customer: {
          phone_number: {
            number: this.formatBeninPhoneNumber(request.customerPhone),
            country: 'BJ'
          },
          firstname: request.customerName.split(' ')[0],
          lastname: request.customerName.split(' ').slice(1).join(' ')
        },
        description: request.description,
        custom_metadata: {
          platform: 'kwikx-mobile',
          type: 'withdrawal',
          user_id: request.userId,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${this.baseUrl}/payouts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payoutPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payout');
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.v1.id,
        reference: data.v1.reference || data.v1.id,
        status: 'pending',
        message: 'Payout initiated successfully',
        data: {
          payout_id: data.v1.id,
          amount: data.v1.amount,
          currency: 'XOF',
          status: data.v1.status
        }
      };

    } catch (error: any) {
      console.error('FedaPay payout error:', error);
      return {
        success: false,
        transactionId: '',
        reference: '',
        status: 'failed',
        message: error.message || 'Failed to create payout'
      };
    }
  }

  async getPaymentMethods(): Promise<string[]> {
    try {
      if (!this.apiKey) {
        return this.getDefaultPaymentMethods();
      }

      const response = await fetch(`${this.baseUrl}/payment_methods`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return data.v1.map((method: any) => method.name);
      }
    } catch (error) {
      console.warn('Failed to fetch payment methods:', error);
    }

    return this.getDefaultPaymentMethods();
  }

  private getDefaultPaymentMethods(): string[] {
    return [
      'card', // Visa, Mastercard
      'mobile_money', // MTN, Moov
      'bank_transfer',
      'qr_code'
    ];
  }

  private formatBeninPhoneNumber(phone: string): string {
    if (!phone) return '';

    let digits = phone.replace(/\D/g, '');

    if (digits.startsWith('229')) {
      digits = digits.substring(3);
    } else if (digits.startsWith('+229')) {
      digits = digits.substring(4);
    }

    if (digits.length === 8) {
      digits = '01' + digits;
    } else if (digits.length === 9 && digits.startsWith('0')) {
      digits = '01' + digits.substring(1);
    } else if (digits.length >= 8) {
      digits = '01' + digits.substring(digits.length - 8);
    }

    if (digits.length !== 10 || !digits.startsWith('01')) {
      if (digits.length >= 8) {
        digits = '01' + digits.substring(digits.length - 8);
      }
    }

    return digits;
  }

  private mapFedaPayStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'completed';
      case 'declined':
      case 'canceled':
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }

  validateAmount(amount: number, min: number = 100, max: number = 1000000): { valid: boolean; message: string } {
    if (amount < min) {
      return { valid: false, message: `Minimum amount is ${min} CFA` };
    }

    if (amount > max) {
      return { valid: false, message: `Maximum amount is ${max.toLocaleString()} CFA` };
    }

    return { valid: true, message: 'Amount is valid' };
  }

  isValidBeninPhone(phone: string): boolean {
    const formatted = this.formatBeninPhoneNumber(phone);
    return formatted.length === 10 && formatted.startsWith('01');
  }
}

export const fedaPayService = new FedaPayService();

export default fedaPayService;
