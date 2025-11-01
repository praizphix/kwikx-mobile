# Tatum Quick Setup Guide

## ✅ Implementation Complete

Tatum integration for USDT (TRC20) deposits and withdrawals is fully implemented and ready to use.

## What You Need

**Your Tatum API Key** - Get it from [Tatum.io](https://tatum.io/)

## Setup Steps (5 minutes)

### Step 1: Add Your API Key

Edit `.env` file in project root:

```bash
# Add these lines at the bottom
EXPO_PUBLIC_TATUM_API_KEY=your-actual-api-key-here
EXPO_PUBLIC_TATUM_ENVIRONMENT=testnet
```

**Replace `your-actual-api-key-here` with your real Tatum API key!**

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Test It

**Mobile App:**
1. Start the app (automatic)
2. Login as a user
3. Navigate to "Deposit" section
4. Click "Crypto Deposit"
5. Generate deposit address
6. Copy address

**Test Deposit (Testnet):**
1. Get testnet USDT from faucet
2. Send to your deposit address
3. Click "Sync Balance"
4. See balance update

**Test Withdrawal:**
1. Navigate to "Crypto Withdraw"
2. Enter TRON address
3. Enter amount
4. Confirm withdrawal

## What Was Built

### ✅ Services
- `services/tatum.ts` - Tatum API integration
- `services/crypto.ts` - Crypto wallet operations

### ✅ Screens
- `app/(transactions)/CryptoDeposit.tsx` - Deposit USDT
- `app/(transactions)/CryptoWithdraw.tsx` - Withdraw USDT

### ✅ Database
- `crypto_addresses` table - Stores user crypto addresses
- Automatic wallet generation
- Balance syncing

### ✅ Features
- Generate TRON (TRC20) deposit address
- Receive USDT deposits
- Send USDT withdrawals
- Real-time balance syncing
- Transaction history
- Address validation
- Fee estimation

## Important Notes

### For Testing
- Use **testnet** environment first
- Get free testnet tokens from faucet
- No real money needed for testing

### For Production
1. Change to mainnet: `EXPO_PUBLIC_TATUM_ENVIRONMENT=mainnet`
2. Use mainnet API key
3. **IMPORTANT:** Encrypt private keys (see TATUM_INTEGRATION_GUIDE.md)
4. Implement withdrawal limits
5. Add 2FA for large withdrawals

## How It Works

### Deposit Flow
```
1. User generates deposit address
2. User sends USDT to address (from external wallet)
3. User clicks "Sync Balance"
4. System checks blockchain via Tatum
5. Balance updates in app
```

### Withdrawal Flow
```
1. User enters destination address
2. User enters amount
3. System validates address and balance
4. User confirms withdrawal
5. Tatum sends transaction to blockchain
6. Balance updates in app
```

## Screens Added

### Crypto Deposit Screen
- Path: `/CryptoDeposit`
- Features:
  - Generate deposit address button
  - Display TRON (TRC20) address
  - Copy address to clipboard
  - QR code placeholder
  - Sync balance button
  - Network information
  - Safety warnings

### Crypto Withdraw Screen
- Path: `/CryptoWithdraw`
- Features:
  - Available balance display
  - Destination address input
  - Amount input with MAX button
  - Transaction summary
  - Fee estimation
  - Confirmation dialog
  - Safety warnings

## Navigation

Add buttons to access crypto features:

```typescript
// From Home screen or Transaction menu
router.push('/CryptoDeposit');  // For deposits
router.push('/CryptoWithdraw'); // For withdrawals
```

## Required Environment Variables

```bash
# .env file
EXPO_PUBLIC_TATUM_API_KEY=your-api-key
EXPO_PUBLIC_TATUM_ENVIRONMENT=testnet  # or mainnet
```

## Testing Checklist

- [ ] Add Tatum API key to .env
- [ ] Run npm install
- [ ] Start mobile app
- [ ] Generate deposit address
- [ ] Copy address successfully
- [ ] Sync balance (returns 0 initially)
- [ ] Navigate to withdrawal screen
- [ ] Validate address format
- [ ] Test amount validation
- [ ] Test insufficient balance error

## Network Information

**TRON (TRC20) Details:**
- Network: TRON
- Token: USDT (TRC20)
- Confirmations: 19 blocks (~1 minute)
- Fee: ~1.4 TRX (paid by user's TRX balance)
- Minimum Transfer: 1 USDT

## Security Warnings Implemented

✅ Network warnings (TRC20 only)
✅ Address validation
✅ Amount validation
✅ Balance checks
✅ Confirmation dialogs
✅ Irreversible transaction warnings

## Common Questions

**Q: Do I need TRX to receive USDT?**
A: No, receiving is free. TRX needed only for sending.

**Q: How long does a deposit take?**
A: ~1 minute (19 blockchain confirmations)

**Q: How long does a withdrawal take?**
A: ~1 minute after confirmation

**Q: Is there a minimum deposit?**
A: No minimum for deposits

**Q: Is there a minimum withdrawal?**
A: Yes, 1 USDT minimum

**Q: What if I send to wrong network?**
A: Funds will be lost. Always use TRC20!

## Support & Documentation

- Full Guide: `TATUM_INTEGRATION_GUIDE.md`
- Tatum Docs: https://docs.tatum.io/
- TRON Explorer: https://tronscan.org/

## Next Steps

1. **Now:** Test with testnet
2. **Before Production:**
   - Implement private key encryption
   - Add withdrawal limits
   - Enable 2FA
   - Get proper licenses
   - Set up monitoring

---

**Status:** ✅ Ready to Test
**Network:** TRON (TRC20)
**Currency:** USDT

**Start Testing:**
```bash
# 1. Add your API key to .env
# 2. Run npm install
# 3. Start the app
# 4. Test deposit flow
# 5. Test withdrawal flow
```

Your Tatum integration is complete! 🚀
