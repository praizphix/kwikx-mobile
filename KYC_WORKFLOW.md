# KYC Workflow Documentation

## Overview

The KwikX mobile app implements a comprehensive Know Your Customer (KYC) verification workflow that ensures compliance with financial regulations while providing a smooth user experience. Users cannot access wallet features until they complete and get approved for KYC verification.

## Workflow Stages

### Stage 1: User Registration

1. **New User Signs Up**
   - User creates an account with email and password
   - Profile is created with `kyc_status: 'pending'` and `kyc_level: 0`
   - Three wallets are automatically created with `status: 'frozen'`:
     - CFA Wallet (frozen)
     - NGN Wallet (frozen)
     - USDT Wallet (frozen)

2. **Initial State**
   - User can log in but cannot use any wallet features
   - All wallets display "FROZEN" badge
   - Balance shows "---" instead of actual balance
   - Transaction buttons are accessible but transactions will fail

### Stage 2: KYC Submission

1. **User Navigates to KYC Screen**
   - From Home screen, user sees KYC Gate overlay
   - Clicks "Start KYC Verification" button
   - Redirected to `/KYCVerification` screen

2. **User Fills KYC Form**

   **Personal Information (Required):**
   - Full Legal Name
   - Date of Birth (DD/MM/YYYY)
   - Phone Number (with country code)
   - Nationality

   **Residential Address (Required):**
   - Street Address
   - City
   - State/Province
   - Postal Code
   - Country

   **Identity Document (Required):**
   - Document Type Selection:
     - National ID
     - Passport
     - Driver's License
   - Document Number
   - Upload ID Document (image or PDF, max 5MB)

   **Additional Documents (Required):**
   - Proof of Address (utility bill, bank statement, government letter - dated within last 3 months)
   - Selfie with ID (clear photo holding ID document)

3. **Document Upload Process**
   - Uses `expo-document-picker` for file selection
   - Validates file size (max 5MB per file)
   - Accepts images (JPEG, PNG) and PDF documents
   - Converts to base64 for upload to Supabase Storage
   - Stores in `kyc-documents` bucket under user's folder

4. **Form Validation**
   - All fields must be filled
   - All three documents must be uploaded
   - Phone number format validation
   - Date format validation

5. **Submission**
   - Profile updated with personal information
   - Three document records created in `kyc_documents` table:
     - ID Document (with metadata: document number, DOB, nationality, address)
     - Proof of Address (with metadata: address)
     - Selfie with ID (with metadata: type)
   - Profile `kyc_status` set to 'pending'
   - User notified: "Your documents have been submitted for verification. This usually takes 24-48 hours."

### Stage 3: Admin Review

1. **Admin Dashboard Access**
   - Admin logs into web dashboard at `info@getkwikx.com`
   - Navigates to KYC Management section
   - Views list of pending KYC submissions

2. **Document Review**
   - Admin opens user's KYC submission
   - Reviews all uploaded documents:
     - Checks ID document clarity and authenticity
     - Verifies proof of address matches provided address
     - Confirms selfie matches ID photo
   - Checks that names match across all documents
   - Verifies address details

3. **Admin Decision**

   **Option A: Approve**
   - Admin clicks "Approve" button
   - Can add approval notes
   - Selects which currency to activate (CFA or NGN)

   **Option B: Reject**
   - Admin clicks "Reject" button
   - MUST provide rejection reason
   - Common reasons:
     - "Document not clear/readable"
     - "Name mismatch across documents"
     - "Address proof outdated (must be within 3 months)"
     - "Selfie doesn't match ID photo"
     - "Invalid/expired document"

4. **Database Update**
   - Document status changed to 'approved' or 'rejected'
   - `verified_at` timestamp set
   - `verified_by` set to admin ID
   - `rejection_reason` saved if rejected

### Stage 4: Wallet Activation

**When Admin Approves:**

1. **Automatic Wallet Activation Trigger**
   - Database trigger `on_kyc_approved` fires
   - Reads user's country from profile

2. **Currency Selection Logic**
   - If country contains "Nigeria" or "NG": Activate **NGN**
   - Otherwise: Activate **CFA** (default for West Africa)

3. **Activation Process**
   - Selected currency wallet status: `frozen` → `active`
   - USDT wallet automatically activated (if CFA or NGN activated)
   - Unselected fiat currency remains frozen
   - Profile `kyc_status`: `pending` → `verified`
   - Profile `kyc_level`: `0` → `1`

4. **Result Examples**

   **Nigerian User:**
   - NGN Wallet: ✅ Active
   - USDT Wallet: ✅ Active
   - CFA Wallet: ❌ Frozen (not activated)

   **Other West African User:**
   - CFA Wallet: ✅ Active
   - USDT Wallet: ✅ Active
   - NGN Wallet: ❌ Frozen (not activated)

### Stage 5: Post-Approval

1. **User Notification**
   - User receives in-app notification (if implemented)
   - Email notification sent (if configured)

2. **User Returns to App**
   - Logs in to mobile app
   - Home screen refreshes
   - KYC Gate overlay removed
   - Active wallets now show:
     - Actual balance (no longer "---")
     - No "FROZEN" badge
     - Wallet ID displayed
     - "Available Balance" label
     - Can be clicked to view details

3. **Full App Access**
   - User can now:
     - Exchange currencies
     - Deposit money
     - Withdraw money
     - Send money
     - Request money
     - View transaction history
     - Top up wallet

4. **Secondary Currency Activation**
   - To activate the second fiat currency (e.g., CFA if NGN was activated):
     - User may need to submit additional verification (future feature)
     - Or admin can manually activate via dashboard
     - USDT remains active across all scenarios

## Technical Implementation

### Database Structure

**Tables:**
- `profiles` - User info and KYC status
- `kyc_documents` - Uploaded documents with metadata
- `wallets` - User wallets with status
- `admin_users` - Admin accounts

**Triggers:**
- `handle_new_user()` - Creates frozen wallets on signup
- `handle_kyc_approval()` - Activates wallets on KYC approval

**Functions:**
- `activate_user_wallets()` - Handles wallet activation logic

### File Locations

```
app/
├── (screens)/
│   └── KYCVerification.tsx      # Main KYC form
├── (tabs)/
│   └── Home.tsx                 # Shows KYC gate and wallet status
services/
├── auth.ts                       # Profile management
├── wallets.ts                    # Wallet operations
└── kyc.ts                        # KYC document submission
components/
└── cards/
    └── WalletCard.tsx            # Displays frozen/active wallet status
```

### Required Packages

```json
{
  "expo-document-picker": "~12.0.2",
  "expo-file-system": "~18.0.7",
  "base64-arraybuffer": "^1.0.2"
}
```

### Storage Configuration

**Bucket:** `kyc-documents`
**Access:** Private (authentication required)
**Structure:** `{user_id}/{document-type}-{timestamp}.{ext}`

**Policies:**
- Users can upload to own folder
- Users can view own documents
- Admins can view all documents
- Admins can delete documents

## User Experience Flow

```
┌─────────────┐
│  Sign Up    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Login - See KYC Gate│
│ "Start Verification"│
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ Complete KYC Form    │
│ - Personal Info      │
│ - Address            │
│ - Documents          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Submit Documents     │
│ Status: Pending      │
│ Wait 24-48 hours     │
└──────┬───────────────┘
       │
       ├────────────┐
       │            │
   Approved    Rejected
       │            │
       ▼            ▼
┌──────────┐  ┌──────────┐
│ Wallets  │  │ Resubmit │
│ Activated│  │ Required │
└────┬─────┘  └──────────┘
     │
     ▼
┌──────────────┐
│ Full Access  │
│ Use All      │
│ Features     │
└──────────────┘
```

## Admin Dashboard Flow

```
┌────────────────┐
│ Admin Login    │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ KYC Dashboard  │
│ View Pending   │
└───────┬────────┘
        │
        ▼
┌────────────────────┐
│ Review Submission  │
│ - Check ID         │
│ - Check Address    │
│ - Check Selfie     │
└───────┬────────────┘
        │
        ├─────────┐
        │         │
    Approve   Reject
        │         │
        ▼         ▼
┌──────────┐  ┌────────────┐
│ Select   │  │ Provide    │
│ Currency │  │ Reason     │
│ CFA/NGN  │  │            │
└────┬─────┘  └────┬───────┘
     │            │
     ▼            ▼
┌──────────┐  ┌────────────┐
│ Activate │  │ User must  │
│ Wallets  │  │ resubmit   │
│ + USDT   │  │            │
└──────────┘  └────────────┘
```

## Key Features

### Security
- All documents stored securely in Supabase Storage
- Row Level Security (RLS) enforced on all tables
- Users can only see their own data
- Admins have read-only access to submissions
- Documents not publicly accessible

### Compliance
- Complete address information collected
- Multiple document verification (ID + Address + Selfie)
- Audit trail of all approvals/rejections
- Admin notes for decisions
- Rejection reasons stored

### User Experience
- Clear visual feedback (frozen badges, overlay messages)
- Progress tracking
- Helpful error messages
- File size validation
- Multiple document type support

### Automation
- Automatic wallet creation on signup
- Automatic wallet activation on approval
- Auto-activation of USDT when fiat approved
- Database triggers handle complex logic
- No manual intervention needed for activation

## Testing the Workflow

### Test User Flow

1. **Create Test User**
   ```
   Email: test@example.com
   Password: TestPass123!
   ```

2. **Verify Initial State**
   - Check all 3 wallets are frozen
   - Confirm KYC gate appears on Home
   - Verify no transactions possible

3. **Submit KYC**
   - Fill all form fields
   - Upload test documents
   - Submit and verify pending status

4. **Admin Review**
   - Log in as admin
   - Navigate to KYC section
   - Review submission
   - Approve and select currency

5. **Verify Activation**
   - Log back in as test user
   - Confirm 2 wallets active (selected + USDT)
   - Verify transactions now work
   - Check frozen badge removed

## Troubleshooting

### Common Issues

**Issue: Wallets not freezing on signup**
- Check `handle_new_user()` trigger is active
- Verify migration applied successfully
- Check for conflicting triggers

**Issue: Documents not uploading**
- Verify `kyc-documents` bucket exists
- Check storage policies are correct
- Ensure file size under 5MB
- Verify base64 encoding working

**Issue: Wallets not activating after approval**
- Check `on_kyc_approved` trigger is active
- Verify admin approved (not just viewed)
- Check document status changed to 'approved'
- Review database logs for errors

**Issue: Wrong wallet activated**
- Check user's country field in profile
- Verify currency selection logic in trigger
- Admin can manually activate via dashboard

## Future Enhancements

1. **Email Notifications**
   - Send email on KYC submission
   - Notify user when approved/rejected

2. **Push Notifications**
   - Real-time status updates
   - Remind user to complete KYC

3. **Document Re-upload**
   - Allow users to resubmit after rejection
   - Without creating new submission

4. **Level 2 KYC**
   - Advanced verification for higher limits
   - Additional documents required
   - Video verification

5. **Secondary Currency Activation**
   - Allow users to request second fiat currency
   - Simplified process since already verified

6. **Admin Dashboard Improvements**
   - Bulk approval/rejection
   - Document comparison tools
   - OCR for automatic data extraction
   - Risk scoring system

## Conclusion

The KYC workflow ensures regulatory compliance while maintaining excellent user experience. The automated wallet activation system reduces admin workload and provides instant access to users upon approval. The comprehensive document collection meets financial industry standards for customer verification.

---

**Last Updated:** November 1, 2025
**Version:** 1.0
