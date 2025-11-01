import Constants from 'expo-constants';

interface TatumWallet {
  address: string;
  privateKey: string;
}

interface TatumTransaction {
  success: boolean;
  txId: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
}

interface TatumBalance {
  balance: number;
  currency: string;
}

class TatumService {
  private apiKey: string;
  private baseUrl: string;
  private environment: 'testnet' | 'mainnet';

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_TATUM_API_KEY ||
                  process.env.EXPO_PUBLIC_TATUM_API_KEY || '';
    this.environment = Constants.expoConfig?.extra?.EXPO_PUBLIC_TATUM_ENVIRONMENT ||
                       process.env.EXPO_PUBLIC_TATUM_ENVIRONMENT || 'testnet';
    this.baseUrl = 'https://api.tatum.io/v3';
  }

  private getHeaders() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async createTronWallet(): Promise<TatumWallet> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/tron/wallet`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create wallet');
      }

      const data = await response.json();

      return {
        address: data.address,
        privateKey: data.privateKey
      };
    } catch (error: any) {
      console.error('Tatum create wallet error:', error);
      throw new Error(error.message || 'Failed to create TRON wallet');
    }
  }

  async getUSDTBalance(address: string): Promise<number> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      // USDT TRC20 contract address on TRON
      const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

      const response = await fetch(
        `${this.baseUrl}/tron/account/balance/${address}/${usdtContract}`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch USDT balance');
      }

      const data = await response.json();

      // USDT has 6 decimals on TRON
      return parseFloat(data.balance || '0') / 1000000;
    } catch (error: any) {
      console.error('Error getting USDT balance:', error);
      return 0;
    }
  }

  async getTRXBalance(address: string): Promise<number> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/tron/account/${address}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TRX balance');
      }

      const data = await response.json();

      // TRX has 6 decimals (measured in SUN)
      return data.balance ? parseFloat(data.balance) / 1000000 : 0;
    } catch (error: any) {
      console.error('Error getting TRX balance:', error);
      return 0;
    }
  }

  async sendUSDT(
    fromPrivateKey: string,
    toAddress: string,
    amount: number
  ): Promise<TatumTransaction> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      const payload = {
        fromPrivateKey,
        to: toAddress,
        tokenAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT TRC20
        amount: Math.floor(amount * 1000000).toString(), // Convert to smallest unit
        feeLimit: 100000000 // 100 TRX fee limit
      };

      const response = await fetch(`${this.baseUrl}/tron/trc20/transaction`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send USDT');
      }

      const data = await response.json();

      return {
        success: true,
        txId: data.txId,
        status: 'pending',
        message: 'USDT transfer initiated successfully'
      };
    } catch (error: any) {
      console.error('Error sending USDT:', error);
      return {
        success: false,
        txId: '',
        status: 'failed',
        message: error.message || 'Failed to send USDT'
      };
    }
  }

  async getTransactionStatus(txId: string): Promise<TatumTransaction> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      const response = await fetch(`${this.baseUrl}/tron/transaction/${txId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get transaction status');
      }

      const data = await response.json();

      const isSuccess = data.ret && data.ret[0] && data.ret[0].contractRet === 'SUCCESS';

      return {
        success: isSuccess,
        txId,
        status: isSuccess ? 'completed' : 'failed',
        message: `Transaction ${data.ret[0]?.contractRet || 'pending'}`
      };
    } catch (error: any) {
      console.error('Error getting transaction status:', error);
      return {
        success: false,
        txId,
        status: 'failed',
        message: error.message || 'Failed to get transaction status'
      };
    }
  }

  async getTransactionHistory(address: string, limit: number = 20): Promise<any[]> {
    try {
      if (!this.apiKey) {
        throw new Error('Tatum API key not configured');
      }

      const response = await fetch(
        `${this.baseUrl}/tron/account/${address}/transactions?limit=${limit}`,
        {
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error: any) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  async estimateTransactionFee(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<{ energy: number; bandwidth: number; fee: number }> {
    // USDT TRC20 transfers typically cost around:
    // - 14,000 energy
    // - 345 bandwidth
    // - ~1.4 TRX fee (if no energy available)

    return {
      energy: 14000,
      bandwidth: 345,
      fee: 1.4 // Estimated fee in TRX
    };
  }

  async generateDepositAddress(userId: string): Promise<TatumWallet> {
    try {
      const wallet = await this.createTronWallet();

      // Store the address securely (private key should be encrypted)
      // This is handled in the crypto service

      return wallet;
    } catch (error: any) {
      console.error('Error generating deposit address:', error);
      throw error;
    }
  }

  isValidTronAddress(address: string): boolean {
    // TRON addresses start with 'T' and are 34 characters long
    return /^T[A-Za-z1-9]{33}$/.test(address);
  }

  validateAmount(amount: number, balance: number): { valid: boolean; message: string } {
    if (amount <= 0) {
      return { valid: false, message: 'Amount must be greater than 0' };
    }

    if (amount > balance) {
      return { valid: false, message: 'Insufficient balance' };
    }

    // Minimum USDT transfer amount (to cover fees)
    if (amount < 1) {
      return { valid: false, message: 'Minimum transfer amount is 1 USDT' };
    }

    return { valid: true, message: 'Amount is valid' };
  }
}

export const tatumService = new TatumService();

export default tatumService;
