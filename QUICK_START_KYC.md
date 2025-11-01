# Quick Start Guide: KYC Workflow

## For Users

### Step 1: Sign Up
Create your account with email and password.

### Step 2: See Frozen Wallets
After login, you'll see 3 frozen wallets (CFA, NGN, USDT).

### Step 3: Click "Start KYC Verification"
From the home screen KYC gate overlay.

### Step 4: Fill the Form
- Personal info (name, DOB, phone, nationality)
- Complete address (street, city, state, postal code, country)
- Document type (passport, national ID, or driver's license)
- Document number

### Step 5: Upload Documents
1. Government-issued ID (front/back)
2. Proof of address (utility bill or bank statement - within 3 months)
3. Selfie holding your ID

### Step 6: Submit & Wait
- Click "Submit KYC Documents"
- Wait 24-48 hours for review
- Check email for status updates

### Step 7: Get Activated
After approval, 2 of your 3 wallets will activate automatically!

---

## For Admins

### Login
```
URL: [Your admin dashboard URL]
Email: info@getkwikx.com
Password: IamSaved@2023
```

### Review KYC Submissions
1. Navigate to **KYC Management**
2. Click on pending submission
3. Review all 3 documents
4. Check information accuracy

### Approve
1. Click **Approve** button
2. Select currency (**CFA** or **NGN**)
3. Wallets activate automatically

### Reject
1. Click **Reject** button
2. Enter rejection reason (required)
3. User will need to resubmit

---

## Quick Reference

### Wallet Activation Rules

| User Country | Activates | Status |
|-------------|-----------|--------|
| Nigeria | NGN + USDT | ✅ Active |
| Nigeria | CFA | ❌ Frozen |
| Other West Africa | CFA + USDT | ✅ Active |
| Other West Africa | NGN | ❌ Frozen |

### Common Rejection Reasons
- Document not clear/readable
- Name mismatch across documents
- Address proof outdated (must be within 3 months)
- Selfie doesn't match ID photo
- Invalid or expired document

### File Requirements
- **Max Size:** 5MB per file
- **Formats:** JPG, PNG, PDF
- **Quantity:** 3 documents required
- **Quality:** Clear, readable, not blurry

---

## Need Help?

📖 **Full Documentation:** See `KYC_WORKFLOW.md`
🔧 **Technical Details:** See `PHASE4_KYC_COMPLETE.md`
📊 **Admin Guide:** See `ADMIN_DASHBOARD_INTEGRATION.md`
📝 **Summary:** See `KYC_IMPLEMENTATION_SUMMARY.md`
