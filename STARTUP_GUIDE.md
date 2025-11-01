# KwikX Startup Guide

## System Overview

Your KwikX platform consists of two applications:

1. **Mobile App** (React Native/Expo) - User-facing mobile application
2. **Admin Dashboard** (React/Vite) - Web-based admin interface

Both applications are connected to the same Supabase database and are now ready to run.

## ✅ Current Status

- All dependencies installed
- Database migrations applied
- KYC workflow implemented
- Admin user created
- Storage buckets configured
- All services ready

## Starting the Applications

### Mobile App (Main Application)

The mobile app starts automatically via the Expo development server.

**Available Commands:**
```bash
npm start          # Start Expo development server
npm run android    # Start on Android device/emulator
npm run ios        # Start on iOS device/simulator
npm run web        # Start web version
```

**Access:**
- The Expo server will provide a QR code to scan with Expo Go app
- Or access via `http://localhost:8081` (web version)

### Admin Dashboard (Web Interface)

**Start the admin dashboard:**
```bash
cd admin-dashboard
npm run dev
```

**Access:**
- Default URL: `http://localhost:5173`
- Login with: `info@getkwikx.com` / `IamSaved@2023`

## User Accounts

### Admin Account
```
Email: info@getkwikx.com
Password: IamSaved@2023
Role: Super Admin
Access: Full admin dashboard + mobile app (verified)
Wallets: All active (CFA, NGN, USDT)
```

### Test User Account
```
Email: jesustunescorp@gmail.com
Password: [user's password]
Role: Regular User
Access: Mobile app only
Wallets: All frozen (requires KYC)
KYC Status: Pending
```

## Testing the KYC Workflow

### 1. Test as Regular User

**Mobile App:**
1. Login as `jesustunescorp@gmail.com`
2. Observe:
   - KYC gate overlay on home screen
   - All 3 wallets show "FROZEN" badge
   - Balance shows "---"
3. Click "Start KYC Verification"
4. Complete the form:
   - Personal information
   - Full address
   - Select document type
   - Upload 3 documents
5. Submit and verify "Pending" status

### 2. Test as Admin

**Admin Dashboard:**
1. Login as `info@getkwikx.com`
2. Navigate to "KYC Management" section
3. Find `jesustunescorp@gmail.com` submission
4. Review uploaded documents
5. Approve submission:
   - Select currency (CFA or NGN)
   - Confirm approval
6. Verify automatic wallet activation

### 3. Verify Activation

**Mobile App:**
1. Login again as `jesustunescorp@gmail.com`
2. Verify:
   - KYC gate removed
   - 2 wallets now active (selected + USDT)
   - Balances visible
   - Can perform transactions

## Database Connection

Both applications use the same Supabase database:

```
URL: https://vdkvbtlazszususoqlwp.supabase.co
Anon Key: [In .env file]
```

**Database Tables:**
- `profiles` - User profiles and KYC status
- `wallets` - User wallets with frozen/active status
- `kyc_documents` - Uploaded KYC documents
- `transactions` - Transaction history
- `exchange_rates` - Currency exchange rates
- `admin_users` - Admin accounts

## Environment Variables

### Mobile App (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://vdkvbtlazszususoqlwp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-key]
```

### Admin Dashboard
Uses same Supabase configuration

## Key Features to Test

### Mobile App
- [ ] User signup/login
- [ ] KYC form submission
- [ ] Document upload
- [ ] Wallet display (frozen/active)
- [ ] Exchange currency
- [ ] Send money
- [ ] Transaction history

### Admin Dashboard
- [ ] Admin login
- [ ] User management
- [ ] KYC document review
- [ ] Approval/rejection
- [ ] Exchange rate management
- [ ] Transaction monitoring

## Common Issues & Solutions

### Issue: Cannot start mobile app
**Solution:** Ensure Expo CLI is installed: `npm install -g expo-cli`

### Issue: Admin dashboard not loading
**Solution:**
1. Check if already running on port 5173
2. Try different port: `npm run dev -- --port 5174`

### Issue: Database connection error
**Solution:** Verify .env file exists with correct credentials

### Issue: Documents not uploading
**Solution:**
1. Check file size (max 5MB)
2. Verify `kyc-documents` bucket exists in Supabase
3. Check storage policies are active

### Issue: Wallets not activating after approval
**Solution:**
1. Check `on_kyc_approved` trigger is active
2. Verify KYC document status changed to 'approved'
3. Check database logs for errors

## Development Workflow

### Making Changes

**Mobile App:**
1. Edit files in `app/` directory
2. Changes hot-reload automatically
3. Use React Native debugger for testing

**Admin Dashboard:**
1. Edit files in `admin-dashboard/` directory
2. Vite hot-reloads automatically
3. Use browser dev tools for debugging

### Database Changes

**Adding Migrations:**
```bash
# Use Supabase tools (already available)
```

**Viewing Data:**
- Use Supabase Dashboard: https://supabase.com/dashboard
- Or use SQL queries via admin tools

## File Structure

```
project/
├── app/                          # Mobile app screens
│   ├── (authentication)/        # Login, signup screens
│   ├── (screens)/               # Main app screens
│   │   └── KYCVerification.tsx # KYC form
│   ├── (tabs)/                  # Tab navigation screens
│   └── (transactions)/          # Transaction screens
├── services/                     # API services
│   ├── auth.ts                  # Authentication
│   ├── kyc.ts                   # KYC document handling
│   ├── wallets.ts               # Wallet operations
│   ├── transactions.ts          # Transaction handling
│   └── quotes.ts                # Exchange quotes
├── components/                   # Reusable components
├── admin-dashboard/             # Admin web interface
│   ├── admin/                   # Admin pages
│   ├── components/              # Admin components
│   └── lib/                     # Admin utilities
├── supabase/
│   └── migrations/              # Database migrations
└── docs/                        # Documentation
    ├── KYC_WORKFLOW.md
    ├── PHASE4_KYC_COMPLETE.md
    └── QUICK_START_KYC.md
```

## Next Steps

1. **Start Mobile App**
   - Expo server starts automatically
   - Scan QR code or use web version

2. **Start Admin Dashboard**
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. **Test Complete Flow**
   - User signup → KYC submission → Admin approval → Wallet activation

4. **Customize**
   - Update branding/colors
   - Add email notifications
   - Configure payment providers
   - Set exchange rates

## Support & Documentation

### Documentation Files
- `KYC_WORKFLOW.md` - Complete KYC workflow guide
- `PHASE4_KYC_COMPLETE.md` - Technical implementation
- `KYC_IMPLEMENTATION_SUMMARY.md` - Feature summary
- `QUICK_START_KYC.md` - Quick reference
- `ADMIN_CREDENTIALS.md` - Admin account details
- `ADMIN_CONNECTION_VERIFIED.md` - Connection verification

### Database Documentation
- Supabase Dashboard: https://supabase.com/dashboard
- Project ID: vdkvbtlazszususoqlwp

### Getting Help
1. Check documentation files first
2. Review database logs in Supabase
3. Check browser/app console for errors
4. Review network requests for API issues

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change default admin password** after first login
2. **Keep .env files secure** - never commit to git
3. **Review RLS policies** before production
4. **Enable 2FA** for admin accounts
5. **Monitor KYC submissions** for fraud
6. **Regular security audits** recommended

## Production Deployment

When ready for production:

1. **Mobile App:**
   - Build production APK/IPA
   - Submit to app stores
   - Configure production Supabase project

2. **Admin Dashboard:**
   - Run `npm run build` in admin-dashboard
   - Deploy to hosting (Vercel, Netlify, etc.)
   - Configure production environment variables

3. **Database:**
   - Review and optimize RLS policies
   - Set up automated backups
   - Configure monitoring and alerts

---

**System Status:** ✅ Ready to Run
**Last Updated:** November 1, 2025
**Version:** 1.0

**Quick Start:**
```bash
# Mobile app starts automatically
# Admin dashboard:
cd admin-dashboard && npm run dev
```

Your KwikX platform is now ready for testing and development!
