import { FedaPayService } from "./fedapay"
import { SquadCoService } from "./squadco"
import { TatumService } from "./tatum"
import { KkiaPayService } from "./kkiapay"
import type { PaymentRequest, PaymentResponse } from "../../types/payment"

export class PaymentService {
  private fedaPay: FedaPayService
  private squadCo: SquadCoService
  private tatum: TatumService
  private kkiaPay: KkiaPayService

  constructor() {
    this.fedaPay = new FedaPayService()
    this.squadCo = new SquadCoService()
    this.tatum = new TatumService()
    this.kkiaPay = new KkiaPayService()
  }

  async createPayment(currency: "naira" | "cfa" | "usdt", request: PaymentRequest): Promise<PaymentResponse> {
    // Validate request
    if (!request.amount || request.amount <= 0) {
      throw new Error("Invalid payment amount")
    }

    if (!request.customerEmail && currency !== "usdt") {
      throw new Error("Customer email is required for fiat payments")
    }

    // Validate minimum amounts
    const minAmounts = {
      naira: 100, // ₦100
      cfa: 500, // 500 CFA
      usdt: 1, // 1 USDT
    }

    if (request.amount < minAmounts[currency]) {
      throw new Error(`Minimum amount for ${currency.toUpperCase()} is ${minAmounts[currency]}`)
    }

    switch (currency) {
      case "cfa":
        return this.fedaPay.createPayment({
          ...request,
          currency: "XOF", // West African CFA franc
        })

      case "naira":
        return this.squadCo.createPayment({
          ...request,
          currency: "NGN", // Nigerian Naira
        })

      case "usdt":
        // For USDT, we handle it differently as it's crypto
        throw new Error("USDT payments require wallet-to-wallet transfers. Use sendUSDT method instead.")

      default:
        throw new Error(`Unsupported currency: ${currency}`)
    }
  }

  async verifyPayment(currency: "naira" | "cfa" | "usdt", transactionId: string): Promise<PaymentResponse> {
    if (!transactionId) {
      throw new Error("Transaction ID is required")
    }

    switch (currency) {
      case "cfa":
        return this.fedaPay.verifyPayment(transactionId)

      case "naira":
        return this.squadCo.verifyPayment(transactionId)

      case "usdt":
        return this.tatum.verifyTransaction(transactionId)

      default:
        throw new Error(`Unsupported currency: ${currency}`)
    }
  }

  // USDT specific methods
  async createUSDTWallet() {
    return this.tatum.createWallet()
  }

  async getUSDTBalance(address: string) {
    if (!address) {
      throw new Error("Wallet address is required")
    }
    return this.tatum.getUSDTBalance(address)
  }

  async getTRXBalance(address: string) {
    if (!address) {
      throw new Error("Wallet address is required")
    }
    return this.tatum.getTRXBalance(address)
  }

  async sendUSDT(fromPrivateKey: string, toAddress: string, amount: number) {
    if (!fromPrivateKey || !toAddress || !amount) {
      throw new Error("Private key, recipient address, and amount are required")
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    return this.tatum.sendUSDT(fromPrivateKey, toAddress, amount)
  }

  async getTransactionHistory(address: string, limit = 20) {
    return this.tatum.getTransactionHistory(address, limit)
  }

  async estimateUSDTTransactionFee(fromAddress: string, toAddress: string, amount: number) {
    return this.tatum.estimateTransactionFee(fromAddress, toAddress, amount)
  }

  // SquadCo specific methods
  async getSquadCoSupportedBanks() {
    return this.squadCo.getSupportedBanks()
  }

  async getSquadCoTransaction(transactionRef: string) {
    return this.squadCo.getTransaction(transactionRef)
  }

  async initiateBankTransfer(payload: {
    amount: number
    email: string
    bank_code: string
    account_number: string
    account_name: string
    transaction_ref: string
  }) {
    return this.squadCo.initiateBankTransfer(payload)
  }

  // Provider-specific methods
  async getFedaPayPaymentMethods() {
    return this.fedaPay.getPaymentMethods()
  }

  // Utility methods
  getProviderForCurrency(currency: "naira" | "cfa" | "usdt"): string {
    switch (currency) {
      case "naira":
        return "SquadCo"
      case "cfa":
        return "FedaPay"
      case "usdt":
        return "Tatum"
      default:
        return "Unknown"
    }
  }

  getSupportedCurrencies(): string[] {
    return ["naira", "cfa", "usdt"]
  }

  getMinimumAmount(currency: "naira" | "cfa" | "usdt"): number {
    const minAmounts = {
      naira: 100,
      cfa: 500,
      usdt: 1,
    }
    return minAmounts[currency]
  }

  getCurrencySymbol(currency: "naira" | "cfa" | "usdt"): string {
    const symbols = {
      naira: "₦",
      cfa: "CFA",
      usdt: "USDT",
    }
    return symbols[currency]
  }

  // Cross-currency transfer methods
  async transferNaira(payload: {
    amount: number;
    recipient_account: string;
    recipient_bank: string;
    recipient_name?: string;
    description?: string;
    transactionPin?: string;
  }): Promise<any> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      console.log('🔑 Calling PayOnUs transfer function...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-transfer-naira`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'payonus',
            amount: payload.amount,
            recipient_account: payload.recipient_account,
            recipient_bank_code: payload.recipient_bank,
            recipient_name: payload.recipient_name || 'Recipient',
            narration: payload.description || 'KwikX Transfer',
            transaction_pin: payload.transactionPin,
            reference: `PAYONUS_TRF_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ PayOnUs transfer failed:', data);
        throw new Error(data.error || 'Failed to transfer via PayOnUs');
      }

      console.log('✅ PayOnUs transfer response:', data);
      return data;
    } catch (error: any) {
      console.error('❌ PayOnUs transfer error:', error);
      throw error;
    }
  }

  async transferCFA(payload: {
    amount: number;
    recipient_phone: string;
    operator: 'mtn' | 'moov';
    description?: string;
  }): Promise<any> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      console.log('🔑 Calling CFA transfer function...');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-transfer-cfa`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ CFA transfer failed:', data);
        throw new Error(data.error || 'Failed to transfer CFA');
      }

      console.log('✅ CFA transfer response:', data);
      return data;
    } catch (error: any) {
      console.error('❌ CFA transfer error:', error);
      throw error;
    }
  }

  // Paystack-specific methods for cross-currency transfers
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
        console.error('❌ Failed to fetch PayOnUs banks:', data);
        // Return comprehensive fallback instead of throwing
        return this.getComprehensiveNigerianBanks();
      }

      return data.data || [];
    } catch (error: any) {
      console.error('❌ Error fetching PayOnUs banks:', error);
      return this.getComprehensiveNigerianBanks();
    }
  }

  private getComprehensiveNigerianBanks(): any[] {
    return [
      { code: '044', name: 'Access Bank' },
      { code: '063', name: 'Access Bank (Diamond)' },
      { code: '023', name: 'Citibank Nigeria' },
      { code: '050', name: 'EcoBank' },
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

  // Paystack-specific methods for account verification
  async verifyAccountNumber(accountNumber: string, bankCode: string): Promise<any> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack-verify-account`,
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
        console.error('❌ Account verification failed:', data);
        throw new Error(data.error || 'Failed to verify account');
      }

      return data.data;
    } catch (error: any) {
      console.error('Error verifying account number:', error);
      // Return mock data for development
      return {
        account_number: accountNumber,
        account_name: 'Test User',
        bank_code: bankCode
      };
    }
  }

  // Alias for cross-currency transfers
  async verifyPaystackAccount(accountNumber: string, bankCode: string): Promise<any> {
    return this.verifyAccountNumber(accountNumber, bankCode);
  }

  // Paystack-specific methods for Naira deposits
  async initializeNairaDeposit(payload: {
    amount: number;
    email: string;
    name: string;
    userId: string;
    transactionPin?: string;
  }): Promise<PaymentResponse> {
    // Use Paystack for Naira operations
    return this.initializePaystackDeposit(payload);
  }

  // PayOnUs direct payin method
  async initializePaystackDeposit(payload: {
    amount: number;
    email: string;
    name: string;
    userId: string;
  }): Promise<PaymentResponse> {
    try {
      const { supabase } = await import('../supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      // Call Paystack gateway function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-deposit-naira-paystack-gateway`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize Paystack payment');
      }
      
      return {
        success: true,
        transactionId: data.data?.reference || `PS_${Date.now()}`,
        reference: data.data?.reference || `PS_${Date.now()}`,
        status: 'pending',
        message: 'Paystack payment initialized successfully',
        data: data.data,
        paymentUrl: data.data?.authorization_url
      };
    } catch (error: any) {
      console.error('❌ Paystack gateway error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService()