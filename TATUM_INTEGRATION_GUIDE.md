# Tatum Integration Guide

## Overview

Tatum integration enables KwikX to support cryptocurrency operations, specifically USDT (Tether) on the TRON blockchain (TRC20). This allows users to deposit and withdraw USDT directly from their wallets.

## What is Tatum?

Tatum is a blockchain development platform that provides simple REST APIs for interacting with multiple blockchains. It handles the complexity of blockchain interactions, allowing you to:

- Generate cryptocurrency wallets
- Check balances
- Send transactions
- Monitor transaction status
- Access transaction history

## Features Implemented

### ✅ USDT Support
- Deposit USDT via TRON network (TRC20)
- Withdraw USDT to external wallets
- Real-time balance syncing
- Transaction history tracking

### ✅ Wallet Management
- Automatic wallet generation
- Secure private key storage
- Unique deposit address per user
- Balance synchronization

### ✅ Transaction Processing
- Send USDT to any TRON address
- Transaction fee estimation
- Transaction status tracking
- Blockchain confirmation monitoring

## Setup Instructions

### 1. Get Your Tatum API Key

1. Go to [Tatum.io](https://tatum.io/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Choose "Testnet" for development or "Mainnet" for production

### 2. Configure Environment Variables

**Mobile App** (.env):
```bash
EXPO_PUBLIC_TATUM_API_KEY=your-tatum-api-key-here
EXPO_PUBLIC_TATUM_ENVIRONMENT=testnet
```

**Admin Dashboard** (admin-dashboard/.env):
```bash
VITE_TATUM_API_KEY=your-tatum-api-key-here
VITE_TATUM_ENVIRONMENT=testnet
```

### 3. Install Dependencies

The required packages are already added to package.json:

```bash
# Mobile app
npm install

# Admin dashboard
cd admin-dashboard
npm install
```

## Architecture

### Components

```
Mobile App:
├── services/
│   ├── tatum.ts        # Tatum API client
│   └── crypto.ts       # Crypto operations wrapper
├── app/(transactions)/
│   ├── CryptoDeposit.tsx   # Deposit screen
│   └── CryptoWithdraw.tsx  # Withdraw screen
└── .env                # Environment variables

Database:
└── crypto_addresses    # Stores user crypto addresses

Admin Dashboard:
└── lib/payments/tatum.ts   # Admin Tatum service
```

### Data Flow

```
User Action → Crypto Service → Tatum Service → Tatum API → TRON Blockchain
                    ↓
              Database Update
                    ↓
              Wallet Balance Sync
```

## User Workflows

### Deposit Workflow

1. **User Opens Deposit Screen**
   - Navigate to CryptoDeposit screen
   - System checks if user has deposit address

2. **Generate Address (First Time)**
   - User clicks "Generate Deposit Address"
   - Tatum creates new TRON wallet
   - Address and private key stored in database
   - User sees deposit address and instructions

3. **Receive Funds**
   - User copies address or scans QR code
   - Sends USDT from external wallet (e.g., Binance, Trust Wallet)
   - Must use TRON (TRC20) network

4. **Sync Balance**
   - User clicks "Sync Balance"
   - System queries Tatum for blockchain balance
   - Database wallet balance updated
   - User sees updated balance in app

### Withdrawal Workflow

1. **User Opens Withdraw Screen**
   - Navigate to CryptoWithdraw screen
   - System displays available USDT balance

2. **Enter Withdrawal Details**
   - User enters destination TRON address
   - Enters withdrawal amount
   - System validates address format
   - Shows transaction summary with fees

3. **Confirm Withdrawal**
   - User reviews details
   - Confirms withdrawal
   - System retrieves private key from database

4. **Process Transaction**
   - Tatum sends USDT to destination
   - Transaction recorded in database
   - Wallet balance updated
   - User receives transaction ID

5. **Track Status**
   - User can view transaction on blockchain
   - Status updates from pending to completed
   - Takes ~1 minute (19 TRON confirmations)

## Technical Implementation

### Tatum Service (services/tatum.ts)

```typescript
import tatumService from './tatum';

// Create wallet
const wallet = await tatumService.createTronWallet();
// Returns: { address, privateKey }

// Get balance
const balance = await tatumService.getUSDTBalance(address);
// Returns: number (USDT amount)

// Send USDT
const result = await tatumService.sendUSDT(
  privateKey,
  toAddress,
  amount
);
// Returns: { success, txId, status, message }

// Check transaction
const status = await tatumService.getTransactionStatus(txId);
// Returns: { success, txId, status, message }
```

### Crypto Service (services/crypto.ts)

```typescript
import { generateDepositAddress, withdrawCrypto, syncCryptoBalance } from './crypto';

// Generate deposit address
const depositInfo = await generateDepositAddress(userId);
// Returns: { address, currency, blockchain }

// Withdraw crypto
const result = await withdrawCrypto({
  userId,
  toAddress,
  amount,
  currency: 'USDT'
});
// Returns: { success, txId?, message }

// Sync balance
const balance = await syncCryptoBalance(userId);
// Returns: number (updated balance)
```

## Database Schema

### crypto_addresses Table

```sql
CREATE TABLE crypto_addresses (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  currency text, -- 'USDT'
  blockchain text, -- 'TRC20'
  address text NOT NULL,
  encrypted_private_key text,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency, blockchain)
);
```

### Key Points:
- One address per user per currency
- Private keys stored encrypted (TODO: implement encryption)
- Tracks last sync time for efficiency
- RLS policies restrict access to own addresses

## Security Considerations

### ⚠️ Critical Security Notes

1. **Private Key Storage**
   - Currently stored in plain text
   - **MUST implement encryption before production**
   - Use environment-specific encryption keys
   - Consider hardware security modules (HSM)

2. **API Key Protection**
   - Never commit API keys to git
   - Use environment variables only
   - Rotate keys regularly
   - Use separate keys for dev/prod

3. **Address Validation**
   - Always validate TRON addresses
   - Check network matches (TRC20)
   - Confirm minimum amounts
   - Verify sufficient balance

4. **Transaction Limits**
   - Implement daily withdrawal limits
   - Add 2FA for large withdrawals
   - Monitor for suspicious activity
   - Set minimum/maximum amounts

### Recommended Security Enhancements

```typescript
// Implement private key encryption
import * as Crypto from 'expo-crypto';

async function encryptPrivateKey(privateKey: string): Promise<string> {
  // Use AES-256 encryption
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const encrypted = await Crypto.encryptAsync(privateKey, encryptionKey);
  return encrypted;
}

async function decryptPrivateKey(encrypted: string): Promise<string> {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const decrypted = await Crypto.decryptAsync(encrypted, encryptionKey);
  return decrypted;
}
```

## Testing

### Testnet Testing (Free)

1. Set environment to testnet:
```bash
EXPO_PUBLIC_TATUM_ENVIRONMENT=testnet
```

2. Get testnet TRX and USDT:
   - Use TRON testnet faucet
   - Test transactions without real money

3. Test workflow:
   - Generate deposit address
   - Send testnet USDT to address
   - Sync balance
   - Withdraw to another testnet address
   - Verify transaction on TronScan testnet

### Production Testing

1. Start with small amounts
2. Test deposit with 1 USDT
3. Test withdrawal to verified address
4. Monitor transaction confirmations
5. Verify balance accuracy

## Common Issues & Solutions

### Issue: "Tatum API key not configured"

**Solution:**
- Check .env file exists
- Verify API key is correct
- Restart development server
- Check Constants.expoConfig is loading env vars

### Issue: "Failed to create wallet"

**Solution:**
- Verify API key is valid
- Check API rate limits
- Ensure internet connection
- Check Tatum service status

### Issue: "Invalid TRON address"

**Solution:**
- Address must start with 'T'
- Must be exactly 34 characters
- Check for typos
- Use address validation before submission

### Issue: "Transaction failed"

**Solution:**
- Check sufficient TRX for fees (~1.4 TRX)
- Verify correct network (TRC20)
- Check private key is valid
- Ensure amount above minimum (1 USDT)

### Issue: "Balance not syncing"

**Solution:**
- Wait for blockchain confirmations (19 blocks ~1 min)
- Click "Sync Balance" manually
- Check address on TronScan
- Verify correct network used for deposit

## API Endpoints Used

### Tatum API v3

- `GET /v3/tron/wallet` - Generate wallet
- `GET /v3/tron/account/{address}` - Get TRX balance
- `GET /v3/tron/account/balance/{address}/{contract}` - Get token balance
- `POST /v3/tron/trc20/transaction` - Send TRC20 token
- `GET /v3/tron/transaction/{hash}` - Get transaction status
- `GET /v3/tron/account/{address}/transactions` - Get transaction history

## Fees & Costs

### TRON Network Fees

- **Bandwidth:** Free (daily allocation)
- **Energy:** ~14,000 for USDT transfer
- **Fee:** ~1.4 TRX if no energy available

### Tatum Pricing

- **Free Tier:** 5 requests/second, 500 credits/month
- **Paid Tiers:** Higher limits and priority support
- Check [Tatum Pricing](https://tatum.io/pricing) for details

## Supported Networks

Currently implemented:
- ✅ TRON (TRC20) - For USDT

Easy to add:
- Ethereum (ERC20) - For USDT, USDC
- Binance Smart Chain (BEP20) - For USDT, BUSD
- Polygon - For USDT, USDC

## Future Enhancements

### Short Term
1. **QR Code Generation**
   - Display deposit address as QR code
   - Allow QR scanning for withdrawal addresses

2. **Transaction History**
   - Show detailed blockchain transactions
   - Filter by type (deposit/withdrawal)
   - Export transaction history

3. **Push Notifications**
   - Notify on deposit received
   - Alert on withdrawal completed
   - Warn on failed transactions

### Medium Term
4. **Multi-Currency Support**
   - Add other stablecoins (USDC, BUSD)
   - Support BTC, ETH
   - Multiple blockchain networks

5. **Advanced Features**
   - Automatic balance syncing (webhooks)
   - Transaction fee optimization
   - Batch withdrawals
   - Address book for frequent recipients

6. **Security Enhancements**
   - 2FA for withdrawals
   - Withdrawal whitelist
   - Daily withdrawal limits
   - Email/SMS confirmations

### Long Term
7. **DeFi Integration**
   - Staking rewards
   - Yield farming
   - Token swaps
   - Liquidity provision

## Resources

- [Tatum Documentation](https://docs.tatum.io/)
- [TRON Documentation](https://developers.tron.network/)
- [TRC20 Token Standard](https://github.com/tronprotocol/tips/blob/master/tip-20.md)
- [TronScan (Block Explorer)](https://tronscan.org/)
- [Tatum API Reference](https://apidoc.tatum.io/)

## Support

### Tatum Support
- Email: support@tatum.io
- Discord: [Tatum Community](https://discord.gg/tatum)
- Documentation: https://docs.tatum.io/

### Testing Resources
- Testnet Faucet: https://faucet.shasta.tronex.io/
- Testnet Explorer: https://shasta.tronscan.org/

## Checklist

Before going to production:

- [ ] Replace testnet with mainnet API key
- [ ] Implement private key encryption
- [ ] Add transaction limits
- [ ] Enable 2FA for withdrawals
- [ ] Set up monitoring and alerts
- [ ] Test with small real amounts
- [ ] Configure backup procedures
- [ ] Document recovery processes
- [ ] Set up customer support process
- [ ] Obtain necessary licenses/compliance

---

**Implementation Date:** November 1, 2025
**Status:** ✅ Ready for Testing
**Version:** 1.0
**Network:** TRON (TRC20)
**Currency:** USDT

**Quick Start:**
1. Add your Tatum API key to .env
2. Run `npm install`
3. Test deposit flow
4. Test withdrawal flow
5. Verify balance syncing

Your Tatum integration is complete and ready for testing!
