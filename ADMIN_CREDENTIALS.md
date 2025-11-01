# Admin User Credentials

## Super Admin Account Created

A super admin account has been successfully created with the following details:

**Email:** info@getkwikx.com
**Password:** IamSaved@2023
**Role:** super_admin
**Status:** active
**User ID:** 14e7effb-4df9-43c8-88dd-c9312b98e972

## Account Details

- **Full Name:** Idowu James
- **KYC Status:** verified
- **KYC Level:** 2 (highest level)
- **Created:** November 1, 2025

## Login Instructions

### For Web Admin Dashboard

1. Navigate to your admin dashboard URL (when deployed)
2. Go to the login page
3. Enter the credentials above
4. You'll have full super admin access

### Permissions

As a **super_admin**, this account has:
- Full access to all admin features
- Ability to manage exchange rates
- User management capabilities
- KYC document approval/rejection
- Transaction monitoring
- Ability to create other admin accounts
- Access to audit logs and user activity
- System configuration permissions

## Security Recommendations

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Change the password immediately** after first login
2. **Enable 2FA** if available in your admin dashboard
3. **Do not share** these credentials
4. **Store securely** - consider using a password manager
5. **Rotate password** regularly (every 90 days recommended)
6. **Monitor login activity** via audit logs
7. **Limit access** - only create additional admin accounts when necessary

## Creating Additional Admins

Once logged in, you can create additional admin accounts:

1. Navigate to `/admin/create-admin` in the dashboard
2. Enter the new admin's email and password
3. Choose role: `admin` or `super_admin`
4. Click "Create Admin"

## Database Access

This admin account exists in three tables:
- `auth.users` - Authentication
- `profiles` - User profile data
- `admin_users` - Admin permissions and role

## Next Steps

1. Log in to the admin dashboard
2. Change the default password
3. Configure exchange rates for your currencies (CFA, NGN, USDT)
4. Set up payment provider credentials if needed
5. Review and approve any pending KYC submissions
6. Monitor initial transactions

## Support

If you need to reset the password or have login issues, you can:
- Use the Supabase dashboard to reset the password
- Run SQL queries to update the admin account
- Use the `create-admin` edge function to create a new admin

---

**Created:** November 1, 2025
**Created By:** System Setup
