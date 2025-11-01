# Admin Dashboard Integration Guide

## Overview

The KwikX admin dashboard has been successfully integrated with your mobile application. Both applications share the same Supabase database, allowing seamless data synchronization between the admin web portal and the mobile app.

## Project Structure

```
/tmp/cc-agent/59403339/project/
├── app/                           # Mobile app (Expo/React Native)
├── admin-dashboard/               # Web admin dashboard (React + Vite)
│   ├── admin/                     # Admin-specific pages
│   │   ├── Dashboard.tsx          # Admin home page
│   │   ├── Login.tsx              # Admin authentication
│   │   ├── ExchangeRates.tsx      # Manage currency exchange rates
│   │   ├── Users.tsx              # User management
│   │   ├── Transactions.tsx       # Transaction monitoring
│   │   ├── KYC.tsx                # KYC verification
│   │   ├── UserLogs.tsx           # Activity logs
│   │   └── CreateAdmin.tsx        # Create new admin accounts
│   ├── components/                # Shared UI components
│   │   ├── layout/
│   │   │   ├── AdminSidebar.tsx   # Admin navigation sidebar
│   │   │   ├── Header.tsx         # Page header
│   │   │   └── Layout.tsx         # Main layout wrapper
│   │   ├── auth/                  # Authentication components
│   │   ├── dashboard/             # Dashboard widgets
│   │   └── common/                # Reusable components
│   ├── lib/                       # Utilities and API clients
│   │   ├── supabase.ts            # Supabase client configuration
│   │   ├── api.ts                 # API helper functions
│   │   └── payments/              # Payment provider integrations
│   └── package.json               # Dependencies
└── supabase/migrations/           # Database migrations (shared)
```

## Admin Dashboard Features

### 1. Dashboard Overview (`admin/Dashboard.tsx`)
- Quick access to all admin functions
- System overview cards
- Navigation to key management areas

### 2. Exchange Rate Management (`admin/ExchangeRates.tsx`)
- View and edit currency exchange rates (CFA, NGN, USDT)
- Set fee structures (flat fees and percentage-based)
- Configure rate validity periods
- Track rate change history
- Set minimum and maximum transaction amounts

### 3. User Management (`admin/Users.tsx`)
- View all registered users
- Search and filter users
- View user profiles and wallet balances
- Manage user account status
- View user transaction history
- Monitor KYC status

### 4. Transaction Monitoring (`admin/Transactions.tsx`)
- Real-time transaction monitoring
- Filter by status, type, currency, date range
- View transaction details
- Track transaction flow
- Identify suspicious activities
- Export transaction reports

### 5. KYC Verification (`admin/KYC.tsx`)
- Review pending KYC submissions
- Approve or reject documents
- View uploaded documents (passport, national ID, driver's license, proof of address)
- Add rejection reasons
- Track KYC verification history
- Set KYC levels (0, 1, 2)

### 6. User Activity Logs (`admin/UserLogs.tsx`)
- Audit trail of all user actions
- Filter by user, action type, date
- View detailed log entries
- Track IP addresses and user agents
- Monitor security events

### 7. Admin Account Management (`admin/CreateAdmin.tsx`)
- Create new admin accounts
- Assign roles (admin, super_admin)
- Manage admin permissions
- View admin activity

### 8. Admin Authentication (`admin/Login.tsx`)
- Secure admin login
- Session management
- Role-based access control

## Database Schema

### Shared Tables

Both the mobile app and admin dashboard use the same database tables:

#### Core Tables
- `profiles` - User profiles and KYC status
- `wallets` - User wallet balances per currency
- `transactions` - All transaction records
- `exchange_rates` - Currency exchange rates and fees
- `quotes` - Exchange rate quotes with expiration
- `kyc_documents` - User KYC document uploads

#### Admin Tables
- `admin_users` - Admin user accounts and roles
- `audit_logs` - System activity audit trail
- `exchange_rate_history` - Historical exchange rate changes

#### Supporting Tables
- `wallet_limits` - Transaction limits by KYC level
- `deposit_methods` - User deposit account details
- `withdrawal_methods` - User withdrawal account details

## Admin User Roles

### Super Admin (`super_admin`)
- Full system access
- Can create and manage other admins
- Can modify all system settings
- Access to all features

### Admin (`admin`)
- Can manage users and KYC
- Can view and monitor transactions
- Can update exchange rates
- Cannot create other admins

## Database Permissions

The admin dashboard has the following RLS policies:

1. **Admin Access to Profiles**
   - Read all user profiles
   - Update user profiles
   - View KYC status

2. **Admin Access to Transactions**
   - Read all transactions
   - View transaction details
   - Cannot modify completed transactions

3. **Admin Access to Wallets**
   - Read all wallet balances
   - View wallet history
   - Monitor wallet activities

4. **Admin Management of KYC**
   - Read all KYC documents
   - Approve/reject documents
   - Update KYC status
   - Set KYC levels

5. **Admin Access to Audit Logs**
   - Read all system logs
   - Cannot modify logs

## Tech Stack

### Admin Dashboard (Web)
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

### Mobile App
- **Framework**: Expo + React Native
- **Navigation**: Expo Router
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Database**: Supabase (PostgreSQL)

## Running the Admin Dashboard

### Option 1: Run Separately (Recommended)

Since the admin dashboard is a web application, you should run it as a separate project:

1. Navigate to the admin dashboard directory:
   ```bash
   cd /tmp/cc-agent/59403339/project/admin-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the admin-dashboard folder:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Copy these values from the mobile app's `.env` file:
   ```bash
   # Copy from /tmp/cc-agent/59403339/project/.env
   VITE_SUPABASE_URL -> EXPO_PUBLIC_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY -> EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the admin dashboard at `http://localhost:5173`

### Option 2: Deploy to Production

The admin dashboard can be deployed to any static hosting service:

- **Vercel**: Already configured (see `vercel.json`)
- **Netlify**: Already configured (see `netlify.toml`)
- **GitHub Pages**
- **AWS S3 + CloudFront**

## Creating the First Admin User

Since this is a fresh setup, you'll need to create the first super admin manually:

### Method 1: Via Supabase Dashboard

1. Go to your Supabase project
2. Navigate to Authentication → Users
3. Create a new user with an email and password
4. Copy the user ID
5. Go to SQL Editor and run:

```sql
INSERT INTO admin_users (id, role, status)
VALUES ('user-id-here', 'super_admin', 'active');
```

### Method 2: Via SQL Migration

Run this query to create your first admin (replace the email):

```sql
-- Create an admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@kwikx.com',
  crypt('YourSecurePassword123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
)
RETURNING id;

-- Then add to admin_users table (use the ID from above)
INSERT INTO admin_users (id, role, status)
VALUES ('user-id-from-above', 'super_admin', 'active');
```

## Integration Points

### Shared Database Connection

Both applications use the same Supabase instance configured in their respective `.env` files:

**Mobile App** (`.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Admin Dashboard** (`.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Real-time Synchronization

Changes made in the admin dashboard are immediately available in the mobile app:

- Exchange rate updates reflect instantly in mobile quotes
- KYC approvals unlock features in the mobile app
- Transaction monitoring shows mobile app transactions in real-time
- User account changes sync across platforms

## Security Considerations

1. **Admin Authentication**
   - Admins must authenticate via the admin login page
   - Separate from regular user authentication
   - Role-based access control enforced at database level

2. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Admin policies are restrictive and verified
   - Regular users cannot access admin data

3. **Audit Trail**
   - All admin actions are logged in `audit_logs`
   - Includes IP address and user agent
   - Immutable log records

4. **Password Requirements**
   - Strong password enforcement
   - Consider implementing 2FA for admins
   - Regular password rotation recommended

## Payment Provider Integration

The admin dashboard includes integrations with multiple payment providers:

- **FedaPay** - West African mobile money
- **Paystack** - Nigerian payments
- **KKiaPay** - West African payments
- **Payonus** - International payments
- **SquadCo** - Nigerian banking
- **Tatum** - Crypto payments

These are configured in `lib/payments/` and can be managed through the admin dashboard.

## Next Steps

1. **Set up the admin dashboard environment**
   - Copy `.env` values from mobile app
   - Install dependencies
   - Run the development server

2. **Create your first admin account**
   - Use Supabase dashboard or SQL migration
   - Set role to `super_admin`

3. **Configure exchange rates**
   - Set initial rates for CFA, NGN, and USDT
   - Configure fee structures
   - Set transaction limits

4. **Set up payment providers** (optional)
   - Configure API keys for payment gateways
   - Test integration with staging credentials

5. **Deploy to production**
   - Build the admin dashboard
   - Deploy to Vercel/Netlify
   - Secure with HTTPS
   - Restrict access with IP whitelisting (recommended)

## Support & Maintenance

### Database Migrations

All database migrations are stored in `/tmp/cc-agent/59403339/project/supabase/migrations/` from the web app. These migrations are already applied to your Supabase instance.

### Adding New Admins

Once you have a super_admin account, you can create new admin accounts through the admin dashboard at `/admin/create-admin`.

### Monitoring

The admin dashboard provides comprehensive monitoring through:
- Transaction history view
- User activity logs
- KYC submission tracking
- Exchange rate change history

## Troubleshooting

### Cannot Login to Admin Dashboard
- Verify admin user exists in `admin_users` table
- Check `status` is `active`
- Verify email/password in Supabase Auth

### Exchange Rates Not Updating
- Check admin has proper permissions
- Verify RLS policies allow admin access
- Check for database connection errors

### KYC Documents Not Loading
- Verify Supabase Storage is configured
- Check file upload permissions
- Verify bucket policies allow admin access

## API Endpoints

The admin dashboard uses the Supabase client library for all API calls. Key services:

- `lib/supabase.ts` - Database client configuration
- `lib/api.ts` - Helper functions for common operations
- `lib/payments/` - Payment provider integrations

No custom API routes are needed as all operations go through Supabase RLS-protected tables.

---

## Summary

You now have a fully integrated mobile app and admin dashboard sharing the same database. The admin dashboard allows you to:

- Manage exchange rates that the mobile app uses for transactions
- Verify KYC documents submitted through the mobile app
- Monitor all transactions made via the mobile app
- Manage user accounts and permissions
- Track system activity and audit logs

Both systems work together seamlessly with real-time data synchronization through Supabase.
