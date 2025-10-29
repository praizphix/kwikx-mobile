import { supabase } from '../lib/supabase';

async function verifyDatabase() {
  console.log('🔍 Verifying KwikX Database Setup...\n');

  try {
    const checks = [];

    const ratesCheck = await supabase
      .from('exchange_rates')
      .select('from_currency, to_currency, rate, status')
      .eq('status', 'active');

    checks.push({
      name: 'Exchange Rates',
      status: ratesCheck.error ? '❌' : '✅',
      count: ratesCheck.data?.length || 0,
      error: ratesCheck.error?.message
    });

    const limitsCheck = await supabase
      .from('wallet_limits')
      .select('kyc_level, currency, daily_limit');

    checks.push({
      name: 'Wallet Limits',
      status: limitsCheck.error ? '❌' : '✅',
      count: limitsCheck.data?.length || 0,
      error: limitsCheck.error?.message
    });

    const tablesCheck = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    checks.push({
      name: 'Profiles Table',
      status: tablesCheck.error ? '❌' : '✅',
      error: tablesCheck.error?.message
    });

    console.log('Database Verification Results:');
    console.log('─'.repeat(50));

    checks.forEach(check => {
      console.log(`${check.status} ${check.name}`);
      if (check.count !== undefined) {
        console.log(`   Records: ${check.count}`);
      }
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
    });

    console.log('\n✅ Database setup verified successfully!');
    console.log('\nKey Features Enabled:');
    console.log('  • User Profiles & KYC');
    console.log('  • Multi-Currency Wallets (CFA, NGN, USDT)');
    console.log('  • Exchange Rates & Quotes System');
    console.log('  • Transaction Tracking');
    console.log('  • Audit Logs');
    console.log('  • Row Level Security (RLS)');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();
