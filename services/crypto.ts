import { supabase } from '@/lib/supabase';
import tatumService from './tatum';

interface CryptoAddress {
  id: string;
  user_id: string;
  currency: 'USDT';
  blockchain: 'TRC20';
  address: string;
  encrypted_private_key: string | null;
  is_active: boolean;
  created_at: string;
}

interface DepositInfo {
  address: string;
  currency: 'USDT';
  blockchain: 'TRC20';
  qrCode?: string;
}

interface WithdrawalRequest {
  userId: string;
  toAddress: string;
  amount: number;
  currency: 'USDT';
}

export async function getCryptoAddress(userId: string): Promise<CryptoAddress | null> {
  try {
    const { data, error } = await supabase
      .from('crypto_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', 'USDT')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting crypto address:', error);
    return null;
  }
}

export async function generateDepositAddress(userId: string): Promise<DepositInfo> {
  try {
    // Check if user already has an address
    const existingAddress = await getCryptoAddress(userId);

    if (existingAddress) {
      return {
        address: existingAddress.address,
        currency: 'USDT',
        blockchain: 'TRC20'
      };
    }

    // Generate new TRON wallet via Tatum
    const wallet = await tatumService.generateDepositAddress(userId);

    // Store in database (IMPORTANT: encrypt private key in production)
    const { data, error } = await supabase
      .from('crypto_addresses')
      .insert({
        user_id: userId,
        currency: 'USDT',
        blockchain: 'TRC20',
        address: wallet.address,
        encrypted_private_key: wallet.privateKey, // TODO: Encrypt this!
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      address: wallet.address,
      currency: 'USDT',
      blockchain: 'TRC20'
    };
  } catch (error: any) {
    console.error('Error generating deposit address:', error);
    throw new Error(error.message || 'Failed to generate deposit address');
  }
}

export async function syncCryptoBalance(userId: string): Promise<number> {
  try {
    // Get user's crypto address
    const cryptoAddress = await getCryptoAddress(userId);

    if (!cryptoAddress) {
      return 0;
    }

    // Get balance from blockchain via Tatum
    const blockchainBalance = await tatumService.getUSDTBalance(cryptoAddress.address);

    // Get current wallet balance from database
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .eq('currency', 'USDT')
      .maybeSingle();

    if (error) throw error;

    const currentBalance = wallet?.balance || 0;

    // If blockchain balance is different, update database
    if (blockchainBalance !== currentBalance) {
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          balance: blockchainBalance,
          available_balance: blockchainBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('currency', 'USDT');

      if (updateError) throw updateError;

      // Log the balance change
      console.log(`USDT balance synced for user ${userId}: ${currentBalance} → ${blockchainBalance}`);
    }

    return blockchainBalance;
  } catch (error: any) {
    console.error('Error syncing crypto balance:', error);
    throw error;
  }
}

export async function withdrawCrypto(request: WithdrawalRequest): Promise<{ success: boolean; txId?: string; message: string }> {
  try {
    const { userId, toAddress, amount, currency } = request;

    // Validate destination address
    if (!tatumService.isValidTronAddress(toAddress)) {
      return {
        success: false,
        message: 'Invalid TRON address'
      };
    }

    // Get user's crypto address and private key
    const cryptoAddress = await getCryptoAddress(userId);

    if (!cryptoAddress || !cryptoAddress.encrypted_private_key) {
      return {
        success: false,
        message: 'No crypto address found. Please generate a deposit address first.'
      };
    }

    // Get wallet balance
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('available_balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .maybeSingle();

    if (error) throw error;

    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found'
      };
    }

    // Validate amount
    const validation = tatumService.validateAmount(amount, wallet.available_balance);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }

    // Send USDT via Tatum
    const result = await tatumService.sendUSDT(
      cryptoAddress.encrypted_private_key,
      toAddress,
      amount
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message
      };
    }

    // Deduct from wallet balance
    const newBalance = wallet.available_balance - amount;

    const { error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        available_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('currency', currency);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        status: 'pending',
        from_currency: currency,
        from_amount: amount,
        fee_amount: 1.4, // Estimated TRX fee
        reference: result.txId,
        description: `USDT withdrawal to ${toAddress}`,
        metadata: {
          blockchain: 'TRC20',
          to_address: toAddress,
          tx_id: result.txId
        }
      });

    if (txError) throw txError;

    return {
      success: true,
      txId: result.txId,
      message: 'Withdrawal initiated successfully'
    };
  } catch (error: any) {
    console.error('Error withdrawing crypto:', error);
    return {
      success: false,
      message: error.message || 'Failed to process withdrawal'
    };
  }
}

export async function getCryptoTransactionHistory(userId: string, limit: number = 20): Promise<any[]> {
  try {
    const cryptoAddress = await getCryptoAddress(userId);

    if (!cryptoAddress) {
      return [];
    }

    const transactions = await tatumService.getTransactionHistory(cryptoAddress.address, limit);

    return transactions.map((tx: any) => ({
      txId: tx.txID,
      timestamp: tx.block_timestamp,
      from: tx.from,
      to: tx.to,
      amount: tx.value ? parseFloat(tx.value) / 1000000 : 0,
      type: tx.to === cryptoAddress.address ? 'deposit' : 'withdrawal',
      status: 'completed'
    }));
  } catch (error) {
    console.error('Error getting crypto transaction history:', error);
    return [];
  }
}

export async function estimateWithdrawalFee(): Promise<number> {
  const feeEstimate = await tatumService.estimateTransactionFee('', '', 0);
  return feeEstimate.fee; // Returns estimated fee in TRX
}
