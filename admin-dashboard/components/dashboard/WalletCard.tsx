import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, Send, PlusCircle, RefreshCw, ShieldAlert, AlertCircle, Copy, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wallet } from '../../types';
import DepositModal from './DepositModal';
import SendModal from './SendModal';
import toast from 'react-hot-toast';

interface WalletCardProps {
  wallet: Wallet | null;
  onWalletUpdate?: () => Promise<void>;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onWalletUpdate }) => {
  const navigate = useNavigate();
  
  // CRITICAL: Enhanced null safety checks with detailed logging
  if (!wallet) {
    console.error('WalletCard: wallet prop is null/undefined - this should never happen after filtering');
    console.trace('WalletCard null wallet trace');
    return (
      <div className="border rounded-lg shadow-sm p-4 bg-gray-50">
        <div className="flex items-center justify-center text-gray-500">
          <WalletIcon className="mr-2" size={20} />
          <span>Wallet not available</span>
        </div>
      </div>
    );
  }

  if (typeof wallet !== 'object') {
    console.error('WalletCard: wallet prop is not an object:', typeof wallet, wallet);
    console.trace('WalletCard invalid type trace');
    return (
      <div className="border rounded-lg shadow-sm p-4 bg-gray-50">
        <div className="flex items-center justify-center text-gray-500">
          <WalletIcon className="mr-2" size={20} />
          <span>Invalid wallet data</span>
        </div>
      </div>
    );
  }

  if (!wallet.type || !wallet.id || !wallet.user_id) {
    console.error('WalletCard: wallet missing required properties:', { 
      type: wallet.type, 
      id: wallet.id, 
      user_id: wallet.user_id,
      fullWallet: wallet 
    });
    console.trace('WalletCard missing properties trace');
    return (
      <div className="border rounded-lg shadow-sm p-4 bg-gray-50">
        <div className="flex items-center justify-center text-gray-500">
          <WalletIcon className="mr-2" size={20} />
          <span>Wallet data incomplete</span>
        </div>
      </div>
    );
  }

  // Additional runtime validation
  if (wallet.type !== 'naira' && wallet.type !== 'cfa' && wallet.type !== 'usdt') {
    console.error('WalletCard: invalid wallet type:', wallet.type, wallet);
    return (
      <div className="border rounded-lg shadow-sm p-4 bg-gray-50">
        <div className="flex items-center justify-center text-gray-500">
          <WalletIcon className="mr-2" size={20} />
          <span>Invalid wallet type: {wallet.type}</span>
        </div>
      </div>
    );
  }

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [walletActivationStatus, setWalletActivationStatus] = useState<{
    kycApproved: boolean;
    walletActivated: boolean;
    activationPending: boolean;
  }>({ kycApproved: false, walletActivated: false, activationPending: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wallet && wallet.status === 'inactive') {
      checkKycAndActivationStatus();
    }
  }, [wallet?.status, wallet?.type]);

  const checkKycAndActivationStatus = async () => {
    if (!wallet || !wallet.type) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check kyc_requests table (new table)
      const { data: kycRequestData, error: kycRequestError } = await supabase
        .from('kyc_requests')
        .select('status, approved_at, wallet_type')
        .eq('user_id', user.id)
        .eq('wallet_type', wallet.type === 'naira' ? 'naira' : wallet.type)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (kycRequestError && kycRequestError.code !== 'PGRST116') {
        console.error('Error checking KYC request status:', kycRequestError);
      }

      // If we found data in kyc_requests, use it
      if (kycRequestData) {
        console.log('KYC Request Data for wallet:', wallet.type, kycRequestData);
        setKycStatus(kycRequestData.status);
        
        // Check wallet status to see if it's been activated
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('status, activation_pending')
          .eq('user_id', user.id)
          .eq('type', wallet.type)
          .single();
          
        if (walletError) {
          console.error('Error checking wallet status:', walletError);
        }
        
        setWalletActivationStatus({
          kycApproved: kycRequestData.status === 'approved',
          walletActivated: walletData?.status === 'active' || false,
          activationPending: walletData?.activation_pending || false
        });
        
        return;
      }

      // If no data in kyc_requests, check kyc_applications (old table)
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_applications')
        .select('status, wallet_activated, activated_at')
        .eq('wallet_type', wallet.type)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (kycError && kycError.code !== 'PGRST116') {
        console.error('Error checking KYC status:', kycError);
      }

      console.log('KYC Data for wallet:', wallet.type, kycData);

      if (kycData) {
        setKycStatus(kycData.status);
        setWalletActivationStatus({
          kycApproved: kycData.status === 'approved',
          walletActivated: kycData.wallet_activated || false,
          activationPending: kycData.status === 'approved' && !kycData.wallet_activated
        });
      } else {
        // No KYC application found
        setKycStatus(null);
        setWalletActivationStatus({
          kycApproved: false,
          walletActivated: false,
          activationPending: false
        });
      }
    } catch (error: any) {
      console.error('Error checking KYC and activation status:', error);
      // Set default values on error
      setKycStatus(null);
      setWalletActivationStatus({
        kycApproved: false,
        walletActivated: false,
        activationPending: false
      });
    }
  };

  const handleDepositSuccess = () => {
    // Use the parent's wallet update function if available, otherwise reload
    if (onWalletUpdate) {
      onWalletUpdate();
    } else {
      // Fallback to page reload if no update function provided
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const copyToClipboard = (text: string | undefined) => {
    if (!text) {
      toast.error('No address to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const getWalletColor = () => {
    if (!wallet || !wallet.type) return 'bg-gray-500';
    
    switch (wallet.type) {
      case 'naira':
        return 'bg-gradient-to-r from-[#00454a] via-[#005c63] to-[#006d75]';
      case 'cfa':
        return 'bg-gradient-to-r from-[#00454a] via-[#004f55] to-[#005c63]';
      case 'usdt':
        return 'bg-gradient-to-r from-[#003238] via-[#00454a] to-[#004f55]';
      default:
        return 'bg-gradient-to-r from-[#00454a] via-[#005c63] to-[#006d75]';
    }
  };

  const getWalletIcon = () => {
    return <WalletIcon size={20} className="text-[#eeb83b]" />;
  };

  const getCurrencySymbol = () => {
    if (!wallet || !wallet.type) return '';
    
    switch (wallet.type) {
      case 'naira':
        return '₦';
      case 'cfa':
        return 'CFA';
      case 'usdt':
        return 'USDT';
      default:
        return '';
    }
  };

  const formatBalance = () => {
    if (!wallet || wallet.balance === undefined || wallet.balance === null || !wallet.type) return '--';
    
    const symbol = getCurrencySymbol();
    if (symbol === '₦') {
      return `${symbol}${wallet.balance.toLocaleString()}`;
    } else if (symbol === 'CFA') {
      return `${wallet.balance.toLocaleString()} ${symbol}`;
    } else {
      return `${symbol} ${wallet.balance.toLocaleString()}`;
    }
  };

  const getWalletStatus = () => {
    if (!wallet || !wallet.status || !wallet.type) {
      return { 
        status: 'unknown', 
        message: 'Status Unknown', 
        color: 'text-gray-500',
        icon: AlertCircle 
      };
    }
    
    if (wallet.status === 'active') {
      return { 
        status: 'active', 
        message: 'Active', 
        color: 'text-green-500',
        icon: CheckCircle 
      };
    }

    // Check activation status from KYC data
    if (walletActivationStatus.activationPending) {
      return { 
        status: 'pending_activation', 
        message: 'KYC Approved - Awaiting Admin Activation', 
        color: 'text-blue-500',
        icon: Clock 
      };
    }

    if (walletActivationStatus.kycApproved && walletActivationStatus.walletActivated) {
      return { 
        status: 'activation_complete', 
        message: 'Activation Complete - Wallet Should Be Active', 
        color: 'text-green-500',
        icon: CheckCircle 
      };
    }

    if (kycStatus === 'approved') {
      return { 
        status: 'kyc_approved', 
        message: 'KYC Approved - Awaiting Activation', 
        color: 'text-blue-500',
        icon: Clock 
      };
    }

    if (kycStatus === 'pending') {
      return { 
        status: 'kyc_pending', 
        message: 'KYC Under Review', 
        color: 'text-yellow-500',
        icon: Clock 
      };
    }

    if (kycStatus === 'rejected') {
      return { 
        status: 'kyc_rejected', 
        message: 'KYC Rejected - Resubmit Required', 
        color: 'text-red-500',
        icon: ShieldAlert 
      };
    }

    return { 
      status: 'inactive', 
      message: 'Complete KYC to Activate', 
      color: 'text-gray-500',
      icon: ShieldAlert 
    };
  };

  const getActivationButton = () => {
    if (loading) {
      return (
        <button
          disabled
          className="w-full bg-gray-400 text-white py-2.5 rounded-lg flex items-center justify-center font-medium opacity-75"
        >
          <RefreshCw size={18} className="mr-2 animate-spin" />
          Checking Status...
        </button>
      );
    }

    if (walletStatus.status === 'active') {
      return null; // No button needed for active wallets
    }

    if (walletStatus.status === 'pending_activation') {
      return (
        <div className="w-full space-y-2">
          <button
            disabled
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg flex items-center justify-center font-medium opacity-75"
          >
            <Clock size={18} className="mr-2" />
            Awaiting Admin Activation
          </button>
          <p className="text-xs text-center text-gray-600">
            Your KYC has been approved. An admin will activate your wallet shortly.
          </p>
        </div>
      );
    }

    if (walletStatus.status === 'activation_complete') {
      return (
        <div className="w-full space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-500 text-white py-2.5 rounded-lg flex items-center justify-center font-medium hover:bg-green-600"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh Page
          </button>
          <p className="text-xs text-center text-gray-600">
            Activation complete! Refresh to see your active wallet.
          </p>
        </div>
      );
    }

    if (walletStatus.status === 'kyc_pending') {
      return (
        <button
          disabled
          className="w-full bg-yellow-500 text-white py-2.5 rounded-lg flex items-center justify-center font-medium opacity-75"
        >
          <Clock size={18} className="mr-2" />
          KYC Under Review
        </button>
      );
    }

    if (walletStatus.status === 'kyc_rejected') {
      return (
        <div className="w-full space-y-2">
          <button
            onClick={() => navigate('/kyc', { state: { activeWallet: wallet.type } })}
            className="w-full bg-red-500 text-white py-2.5 rounded-lg flex items-center justify-center font-medium hover:bg-red-600 transition-colors"
          >
            <ShieldAlert size={18} className="mr-2" />
            Resubmit KYC
          </button>
          <p className="text-xs text-center text-red-600">
            Your previous KYC was rejected. Please resubmit with correct information.
          </p>
        </div>
      );
    }

    return (
      <button
        onClick={() => navigate('/kyc', { state: { activeWallet: wallet.type } })}
        className="w-full bg-[#eeb83b] text-[#00454a] py-2.5 rounded-lg flex items-center justify-center font-medium hover:bg-[#dba82a] transition-all duration-200"
      >
        <ShieldAlert size={18} className="mr-2" />
        Complete KYC
      </button>
    );
  };

  const renderUSDTAddressModal = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Your USDT Wallet Address (TRC20)</h4>
        <div className="flex items-center justify-between bg-white p-3 rounded border">
          <code className="text-sm font-mono break-all mr-2">
            {wallet.wallet_address || wallet.account_number || 'Address not available'}
          </code>
          <button
            onClick={() => copyToClipboard(wallet.wallet_address || wallet.account_number)}
            className="text-[#00454a] hover:text-[#003238] flex-shrink-0"
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Send USDT (TRC20) to this address. Transactions will be automatically detected and credited to your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNairaAccountModal = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Your Naira Wallet Details</h4>
        <div className="space-y-3">
          {/* Paystack Customer Code */}
          {wallet.paystack_customer_code && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <h5 className="font-medium text-blue-800">Paystack Integration (Coming Soon)</h5>
              </div>
              <div>
                <p className="text-xs text-blue-600">Customer Code:</p>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <code className="text-sm font-mono">{wallet.paystack_customer_code}</code>
                  <button
                    onClick={() => copyToClipboard(wallet.paystack_customer_code)}
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* PayOnUs Virtual Account Integration - Primary for Naira */}
          {(wallet.account_number && wallet.bank_name) ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <h5 className="font-medium text-blue-800">Dedicated Virtual Account</h5>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-blue-600">Account Number:</p>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-sm font-mono">{wallet.account_number}</code>
                    <button
                      onClick={() => copyToClipboard(wallet.account_number)}
                      className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Bank Name:</p>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-sm font-medium">{wallet.bank_name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Account Name:</p>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-sm font-medium">{wallet.account_name}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">B</span>
                </div>
                <h5 className="font-medium text-yellow-800">Dedicated Virtual Account</h5>
              </div>
              <div>
                <p className="text-xs text-yellow-600">Status:</p>
                <div className="bg-white p-2 rounded border">
                  <p className="text-sm font-medium">Virtual Account Pending</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Use your dedicated virtual account for deposits and send money to Nigerian bank accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const walletStatus = getWalletStatus();

  return (
    <>
      <div className={`rounded-xl overflow-hidden ${getWalletColor()} relative`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#eeb83b]"></div>
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[#eeb83b]"></div>
        </div>

        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#eeb83b] rounded-full flex items-center justify-center">
                {getWalletIcon()}
              </div>
              <div>
                <span className="font-semibold text-lg text-white">{wallet.type.toUpperCase()}</span>
                <div className="flex items-center space-x-1">
                  <walletStatus.icon size={14} className={walletStatus.color} />
                  <span className="text-xs text-white text-opacity-75">{walletStatus.message}</span>
                </div>
              </div>
            </div>
            <span className="text-sm text-white text-opacity-75">{wallet.account_number || 'N/A'}</span>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-white">
              {wallet.status === 'active' ? formatBalance() : '--'}
            </div>
          </div>

          {wallet.status === 'active' ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSendModal(true)}
                className="flex-1 bg-[#eeb83b] text-[#00454a] py-2.5 rounded-lg font-medium text-sm hover:bg-[#dba82a] transition-all duration-200 flex items-center justify-center min-w-0"
              >
                <Send size={16} className="mr-1" />
                <span className="truncate">Send</span>
              </button>
              <button
                onClick={() => setShowDepositModal(true)}
                className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm text-white py-2.5 rounded-lg font-medium text-sm hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center min-w-0"
              >
                <PlusCircle size={16} className="mr-1" />
                <span className="truncate">Deposit</span>
              </button>
              <button
                onClick={() => navigate('/exchange')}
                className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm text-white py-2.5 rounded-lg font-medium text-sm hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center min-w-0"
              >
                <RefreshCw size={16} className="mr-1" />
                <span className="truncate">Exchange</span>
              </button>
              
              {wallet.type === 'usdt' && (
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2.5 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  title="Show USDT Address"
                >
                  <Copy size={16} />
                </button>
              )}
              {wallet.type === 'naira' && (
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="bg-white bg-opacity-20 backdrop-blur-sm text-white p-2.5 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  title="Show Account Details"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          ) : (
            getActivationButton()
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        walletType={wallet.type as 'naira' | 'cfa' | 'usdt'}
        onSuccess={handleDepositSuccess}
      />

      {/* Send Modal */}
      <SendModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        wallet={wallet}
        onSuccess={handleDepositSuccess}
      />

      {/* Address Modal */}
      {showAddressModal && wallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {wallet.type.toUpperCase()} {wallet.type === 'naira' ? 'Account Details' : 'Wallet Address'}
              </h2>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-500 hover:text-gray-700">
                <Copy size={24} />
              </button>
            </div>
            <div className="p-6">
              {wallet.type === 'usdt' ? renderUSDTAddressModal() : wallet.type === 'naira' ? renderNairaAccountModal() : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletCard;