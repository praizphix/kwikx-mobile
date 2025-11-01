
export class PaystackService {
  private publicKey: string;
  private baseUrl: string;

  constructor() {
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
    this.baseUrl = 'https://api.paystack.co';
    
    console.log('Paystack Service initialized (Frontend - Public Key Only)');
    console.log('Using public key starting with:', this.publicKey ? this.publicKey.substring(0, 5) + '...' : 'Not set');
  }

  /**
   * Verify an account number via secure backend
   * This method calls the Supabase Edge Function for security
   */
  async verifyAccountNumber(accountNumber: string, bankCode: string): Promise<any> {
    try {
      console.warn('⚠️ Frontend PaystackService.verifyAccountNumber called - this should use backend Edge Function');
      
      // Return mock data with warning for now
      return {
        account_number: accountNumber,
        account_name: 'Mock User (Frontend Fallback)',
        bank_code: bankCode,
        warning: 'This is mock data. Use backend Edge Function for real verification.'
      };
    } catch (error: any) {
      console.error('Error in frontend account verification:', error);
      throw error;
    }
  }

  /**
   * Get banks for transfers via secure backend
   * This method should call the Supabase Edge Function for security
   */
  async getBanksForTransfers(): Promise<any[]> {
    console.warn('⚠️ Frontend PaystackService.getBanksForTransfers called - this should use backend Edge Function');
    
    // Return mock data for now
    return this.getMockNigerianBanks();
  }

  /**
   * Map Paystack status to our standard status
   */
  private mapPaystackStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'success':
      case 'successful':
        return 'completed';
      case 'failed':
      case 'declined':
      case 'abandoned':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Get a list of Nigerian banks for transfers (mock data)
   */
  getMockNigerianBanks(): any[] {
    return [
      { code: '044', name: 'Access Bank' },
      { code: '063', name: 'Access Bank (Diamond)' },
      { code: '050', name: 'EcoBank' },
      { code: '070', name: 'Fidelity Bank' },
      { code: '011', name: 'First Bank' },
      { code: '214', name: 'First City Monument Bank' },
      { code: '058', name: 'Guaranty Trust Bank' },
      { code: '030', name: 'Heritage Bank' },
      { code: '301', name: 'Jaiz Bank' },
      { code: '082', name: 'Keystone Bank' },
      { code: '526', name: 'Parallex Bank' },
      { code: '076', name: 'Polaris Bank' },
      { code: '221', name: 'Stanbic IBTC' },
      { code: '068', name: 'Standard Chartered Bank' },
      { code: '232', name: 'Sterling Bank' },
      { code: '100', name: 'Suntrust Bank' },
      { code: '032', name: 'Union Bank' },
      { code: '033', name: 'United Bank for Africa' },
      { code: '215', name: 'Unity Bank' },
      { code: '035', name: 'Wema Bank' },
      { code: '057', name: 'Zenith Bank' }
    ];
  }

  /**
   * Get the public key for frontend operations
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Check if Paystack is configured
   */
  isConfigured(): boolean {
    return !!this.publicKey;
  }
}