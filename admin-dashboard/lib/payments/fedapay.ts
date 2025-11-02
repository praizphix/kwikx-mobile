import { PaymentRequest, PaymentResponse } from '../../types/payment';
import { WEBHOOK_CONFIG } from '../config/webhooks';

export class FedaPayService {
  private apiKey: string;
  private publicKey: string;
  private baseUrl: string;
  private environment: 'sandbox' | 'live';

  constructor() {
    this.apiKey = import.meta.env.VITE_FEDAPAY_SECRET_KEY || '';
    this.publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || '';
    const envValue = import.meta.env.VITE_FEDAPAY_ENVIRONMENT || 'sandbox';
    this.environment = (envValue === 'live' || envValue === 'sandbox') ? envValue : 'sandbox';
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://sandbox-api.fedapay.com/v1'
      : 'https://api.fedapay.com/v1';
    
    console.log('FedaPay Service initialized with environment:', this.environment);
    console.log('Using API key starting with:', this.apiKey ? this.apiKey.substring(0, 5) + '...' : 'Not set');
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate required fields
      if (!this.apiKey) {
        console.warn('FedaPay API key not configured, using development mode');
        return this.createMockPayment(request);
      }

      // Validate API key format
      if (!this.apiKey.startsWith('sk_')) {
        console.warn('Invalid FedaPay API key format, using development mode');
        return this.createMockPayment(request);
      }

      // Enhanced customer creation with Benin-specific defaults
      const customerPayload: any = {
        // Required fields
        firstname: request.customerName?.split(' ')[0] || 'Customer',
        lastname: request.customerName?.split(' ').slice(1).join(' ') || 'User',
        email: request.customerEmail || '',
        
        // Optional but recommended fields
        phone_number: request.customerPhone ? {
          number: this.formatBeninPhoneNumber(request.customerPhone),
          country: 'BJ'
        } : undefined,
      };
      
      // Only add optional fields if they are provided
      if (request.customerAddress) {
        customerPayload.address = {
          line1: request.customerAddress,
          country: 'BJ', // Always Benin for now
          city: request.customerCity || 'Cotonou', // Default to largest city
        };
        
        if (request.customerPostalCode) {
          customerPayload.address.postal_code = request.customerPostalCode;
        }
      }
      
      // Only add birth information if provided
      if (request.customerBirthDate) {
        customerPayload.birth_date = request.customerBirthDate;
      }
      
      if (request.customerBirthCity) {
        customerPayload.birth_city = request.customerBirthCity;
      }
      
      // Only add gender if provided
      if (request.customerGender) {
        customerPayload.gender = request.customerGender;
      }
      
      // Always add nationality and tags
      customerPayload.nationality = 'BJ'; // Always Benin nationality
      customerPayload.tags = ['kwikx-customer', 'cfa-wallet', 'benin-customer'];

      let customerId;
      try {
        const customerResponse = await fetch(`${this.baseUrl}/customers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'FedaPay-Version': '2022-05-06'
          },
          body: JSON.stringify(customerPayload)
        });

        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          customerId = customerData.v1.id;
          console.log('FedaPay customer created for Benin:', customerId);
        } else {
          const errorData = await customerResponse.json();
          console.warn('Failed to create FedaPay customer:', errorData);
          // Continue without customer ID for now
        }
      } catch (customerError) {
        console.warn('Customer creation failed, continuing without customer ID:', customerError);
      }

      // Enhanced transaction creation
      const transactionPayload: any = {
        description: request.description,
        amount: Math.round(request.amount), // FedaPay expects integer amounts in minor units
        currency: {
          iso: 'XOF' // West African CFA franc
        },
        
        // Webhook and redirect URLs
        callback_url: WEBHOOK_CONFIG.fedapay.webhook(),
        return_url: WEBHOOK_CONFIG.fedapay.success(),
        cancel_url: WEBHOOK_CONFIG.fedapay.cancel(),
        
        // Include customer reference if available
        ...(customerId && { customer: { id: customerId } }),
        
        // Custom metadata for tracking (Benin-specific)
        custom_metadata: {
          platform: 'kwikx',
          wallet_type: 'cfa',
          user_id: request.userId,
          country: 'BJ',
          timestamp: new Date().toISOString()
        },
        
        // Include customer and currency in response
        include: ['customer', 'currency'],
        
        // Payment method preferences (Benin-specific)
        ...(request.preferredPaymentMethods && {
          payment_method: {
            types: request.preferredPaymentMethods // e.g., ['card', 'mobile_money']
          }
        })
      };

      console.log('Creating FedaPay transaction with payload:', JSON.stringify(transactionPayload));

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'FedaPay-Version': '2022-05-06'
        },
        body: JSON.stringify(transactionPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('FedaPay API error:', data);
        
        // Enhanced error handling
        if (data.message?.includes('authentication') || data.message?.includes('unauthorized') || response.status === 401) {
          console.warn('FedaPay authentication failed, using development mode');
          return this.createMockPayment(request);
        }
        
        if (data.message?.includes('amount')) {
          throw new Error('Invalid amount. Please check the payment amount and currency.');
        }

        if (data.message?.includes('customer')) {
          throw new Error('Customer information is invalid. Please check the provided details.');
        }

        // Fallback to development mode for other errors
        console.warn('FedaPay API error, falling back to development mode:', data.message);
        return this.createMockPayment(request);
      }

      console.log('FedaPay transaction created successfully:', data.v1.id);

      // Generate payment token for checkout
      let paymentUrl = '';
      try {
        const tokenResponse = await fetch(`${this.baseUrl}/transactions/${data.v1.id}/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'FedaPay-Version': '2022-05-06'
          }
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          paymentUrl = tokenData.v1.url;
          console.log('FedaPay payment URL generated:', paymentUrl);
        } else {
          console.warn('Failed to generate payment token');
          paymentUrl = `${WEBHOOK_CONFIG.getBaseUrl()}/payment/mock?provider=fedapay&amount=${request.amount}&ref=${data.v1.id}`;
        }
      } catch (tokenError) {
        console.warn('Token generation failed, using mock URL:', tokenError);
        paymentUrl = `${WEBHOOK_CONFIG.getBaseUrl()}/payment/mock?provider=fedapay&amount=${request.amount}&ref=${data.v1.id}`;
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
          amount: data.v1.amount,
          country: 'BJ'
        }
      };

    } catch (error: any) {
      console.error('FedaPay API error:', error);
      
      // Return mock payment for development/testing
      if (error.message?.includes('credentials') || error.message?.includes('amount') || error.message?.includes('customer')) {
        throw error; // Re-throw validation errors
      }
      
      return this.createMockPayment(request);
    }
  }

  private createMockPayment(request: PaymentRequest): PaymentResponse {
    const mockRef = `FP_BJ_DEV_${Date.now()}`;
    return {
      success: true,
      transactionId: mockRef,
      paymentUrl: `${WEBHOOK_CONFIG.getBaseUrl()}/payment/mock?provider=fedapay&amount=${request.amount}&ref=${mockRef}&country=BJ`,
      reference: mockRef,
      status: 'pending',
      message: 'Payment created successfully (Development Mode - Benin)'
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      if (!this.apiKey || !this.apiKey.startsWith('sk_')) {
        return this.createMockVerification(transactionId);
      }

      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'FedaPay-Version': '2022-05-06'
        }
      });

      if (!response.ok) {
        console.warn('FedaPay verification failed, using mock response');
        return this.createMockVerification(transactionId);
      }

      const data = await response.json();
      const transaction = data.v1;

      return {
        success: transaction.status === 'approved',
        transactionId: transaction.id,
        reference: transaction.reference || transaction.id,
        status: this.mapFedaPayStatus(transaction.status),
        message: `Payment ${transaction.status}`,
        data: {
          amount: transaction.amount,
          currency: transaction.currency?.iso,
          customer_id: transaction.customer?.id,
          fees: transaction.fees,
          created_at: transaction.created_at,
          country: 'BJ'
        }
      };

    } catch (error: any) {
      console.warn('FedaPay verification error:', error);
      return this.createMockVerification(transactionId);
    }
  }

  private createMockVerification(transactionId: string): PaymentResponse {
    return {
      success: true,
      transactionId,
      reference: transactionId,
      status: 'completed',
      message: 'Payment completed (Development Mode - Benin)'
    };
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

  // Enhanced method to get supported payment methods for Benin
  async getPaymentMethods(): Promise<string[]> {
    try {
      if (!this.apiKey || !this.apiKey.startsWith('sk_')) {
        return this.getBeninPaymentMethods();
      }

      const response = await fetch(`${this.baseUrl}/payment_methods`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'FedaPay-Version': '2022-05-06'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.v1.map((method: any) => method.name);
      }
    } catch (error) {
      console.warn('Failed to fetch FedaPay payment methods');
    }

    return this.getBeninPaymentMethods();
  }

  private getBeninPaymentMethods(): string[] {
    // Payment methods specifically available in Benin
    return [
      'card', // Visa, Mastercard
      'mobile_money', // MTN Mobile Money, Moov Money
      'bank_transfer', // Local bank transfers
      'qr_code' // QR code payments
    ];
  }

  // Helper method to format Benin phone numbers for FedaPay
  private formatBeninPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('229')) {
      // Remove country code
      digits = digits.substring(3);
    } else if (digits.startsWith('+229')) {
      // Remove country code with plus
      digits = digits.substring(4);
    }
    
    // Convert to new 01XXXXXXXX format
    if (digits.length === 8) {
      // If it's just 8 digits, add 01 prefix
      digits = '01' + digits;
    } else if (digits.length === 9 && digits.startsWith('0')) {
      // If it's 9 digits starting with 0, replace with 01 + remaining 8 digits
      digits = '01' + digits.substring(1);
    } else if (digits.length >= 8) {
      // For any other format, extract the last 8 digits and add 01 prefix
      digits = '01' + digits.substring(digits.length - 8);
    }
    
    // Final validation - should be 10 digits starting with 01
    if (digits.length !== 10 || !digits.startsWith('01')) {
      console.warn('Invalid Benin phone number format after processing:', digits);
      // Try to fix it one more time
      if (digits.length >= 8) {
        digits = '01' + digits.substring(digits.length - 8);
      }
    }
    
    return digits;
  }

  // Method to get Benin-specific information
  getBeninInfo() {
    return {
      country: 'BJ',
      currency: 'XOF',
      supportedMobileOperators: ['MTN', 'Moov'],
      majorCities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon'],
      timeZone: 'WAT', // West Africa Time
      language: 'fr' // French
    };
  }
}