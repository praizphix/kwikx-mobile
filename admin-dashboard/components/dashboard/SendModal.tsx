import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, Copy, CheckCircle, Clock, Download, ChevronDown, Lock, Shield, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wallet } from '../../types'; // Assuming Wallet type is still needed
import { generateReceipt, generateReceiptFilename, ReceiptData } from '../../utils/receiptGenerator';
import { PayOnUsService } from '../../lib/payments/payonus';
import TransactionPinSetup from '../auth/TransactionPinSetup';
import toast from 'react-hot-toast';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet;
  onSuccess: () => void;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose, wallet, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountName, setAccountName] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [completedTransactionDetails, setCompletedTransactionDetails] = useState<any>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [showReceiptOptions, setShowReceiptOptions] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [payonusService] = useState(new PayOnUsService());

  useEffect(() => {
    if (isOpen && wallet.type === 'naira') {
      checkTransactionPinStatus();
      fetchBanks();
    }
    
    // Reset form when modal opens
    if (isOpen) {
      setAmount('');
      setRecipient('');
      setDescription('');
      setStep('form');
      setSelectedBank('');
      setAccountName('');
      setTransferSuccess(false);
      setCompletedTransactionDetails(null);
      setIsGeneratingReceipt(false);
      setShowReceiptOptions(false);
      setTransactionPin('');
      setHasPinSet(false);
      setCheckingPin(false);
      setShowPinSetup(false);
    }
  }, [isOpen, wallet.type]);

  const checkTransactionPinStatus = async () => {
    setCheckingPin(true);
    try {
      const pinStatus = await payonusService.checkTransactionPinStatus();
      setHasPinSet(pinStatus.hasPin);
      console.log('Transaction PIN status:', pinStatus);
    } catch (error) {
      console.error('Error checking PIN status:', error);
      setHasPinSet(false);
    } finally {
      setCheckingPin(false);
    }
  };

  const fetchBanks = async () => {
    try {
      console.log('Fetching banks for transfers...');
      const banksList = await payonusService.getBanksForTransfers();
      setBanks(banksList);
      console.log('Banks fetched:', banksList.length, 'banks available');
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Set comprehensive fallback banks if API fails
      setBanks(payonusService.getComprehensiveNigerianBanks());
    }
  };

  const validateAccountDetails = () => {
    if (!recipient || !selectedBank || !accountName.trim()) {
      return false;
    }
    
    // Basic account number validation (10 digits for Nigerian accounts)
    if (!/^\d{10}$/.test(recipient)) {
      return false;
    }
    
    return true;
  };

  const handleAccountDetailsChange = async () => {
    // Auto-verify account when all fields are filled
    if (recipient && selectedBank && recipient.length === 10 && !verifyingAccount) {
      setVerifyingAccount(true);
      try {
        console.log('🔍 Verifying account:', recipient, 'Bank:', selectedBank);
        const verificationResult = await payonusService.verifyAccountNumber(recipient, selectedBank);
        
        if (verificationResult && verificationResult.account_name) {
          setAccountName(verificationResult.account_name);
          console.log('✅ Account verified:', verificationResult.account_name);
        } else {
          setAccountName('');
          console.warn('⚠️ Account verification returned no name');
        }
      } catch (error: any) {
        console.error('❌ Account verification failed:', error);
        setAccountName('');
        toast.error('Could not verify account. Please enter the account name manually.');
      } finally {
        setVerifyingAccount(false);
      }
    }
  };

  useEffect(() => {
    handleAccountDetailsChange();
  }, [recipient, selectedBank]);

  const handleSend = async () => {
    const numAmount = parseFloat(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (wallet.type === 'naira' && numAmount < 100) {
      toast.error('Minimum transfer amount is ₦100');
      return;
    }

    if (wallet.type === 'cfa' && numAmount < 100) {
      toast.error('Minimum transfer amount is 100 CFA');
      return;
    }

    if (!recipient) {
      toast.error('Please enter recipient details');
      return;
    }

    if (wallet.type === 'naira') {
      if (!selectedBank) {
        toast.error('Please select a bank');
        return;
      }
      
      if (!accountName.trim()) {
        toast.error('Please enter the account holder name');
        return;
      }
      
      if (!transactionPin || transactionPin.length !== 4) {
        toast.error('Please enter your 4-digit transaction PIN');
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (wallet.type === 'usdt') {
        // Store transaction details for receipt
        setCompletedTransactionDetails({
          txnId: `USDT_${Date.now()}`,
          createdAt: new Date().toISOString(),
          sourceCurrency: 'USDT',
          destCurrency: 'USDT',
          amountSource: numAmount,
          amountDest: numAmount,
          effectiveRate: 1,
          fxFee: 0,
          railFee: 0,
          provider: 'tatum' as 'paystack' | 'fedapay',
          providerRef: `USDT_${Date.now()}`,
          recipientSummary: recipient,
          userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          userEmail: user.email || ''
        });
        setTransferSuccess(true);
        toast.success('USDT transfer initiated successfully!');

      } else if (wallet.type === 'cfa') {
        // CFA transfer logic
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        // Determine operator from phone number
        const operator = recipient.startsWith('01') ? 'mtn' : 'moov';

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-transfer-cfa`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: numAmount,
              recipient_phone: recipient,
              operator,
              description: description || `Bank transfer to ${accountName}`
            }),
          }
        );

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Transfer failed');
        }

        // Store transaction details for receipt
        setCompletedTransactionDetails({
          txnId: data.data?.payout_id || `CFA_${Date.now()}`,
          createdAt: new Date().toISOString(),
          sourceCurrency: 'XOF',
          destCurrency: 'XOF',
          amountSource: numAmount,
          amountDest: numAmount,
          effectiveRate: 1,
          fxFee: 0,
          railFee: 0,
          provider: 'fedapay' as 'paystack' | 'fedapay',
          providerRef: data.data?.payout_id || `CFA_${Date.now()}`,
          recipientSummary: `${recipient} (${operator.toUpperCase()})`,
          userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          userEmail: user.email || ''
        });
        setTransferSuccess(true);
        toast.success('CFA transfer initiated successfully!');

      } else if (wallet.type === 'naira') {
        // Use PayOnUs exclusively for Naira transfers
        console.log('🔑 Initiating PayOnUs payout...');
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-transfer-naira`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'payonus',
              amount: numAmount,
              recipient_account: recipient,
              recipient_bank_code: selectedBank,
              recipient_name: accountName,
              narration: description || `Bank transfer to ${accountName}`,
              transaction_pin: transactionPin,
              reference: `PAYONUS_TRF_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'PayOnUs transfer failed');
        }

        console.log('✅ PayOnUs transfer response:', data);

        // Store transaction details for receipt
        setCompletedTransactionDetails({
          txnId: data.data?.reference || `PAYONUS_${Date.now()}`,
          createdAt: new Date().toISOString(),
          sourceCurrency: 'NGN',
          destCurrency: 'NGN',
          amountSource: numAmount,
          amountDest: numAmount,
          effectiveRate: 1,
          fxFee: 0,
          railFee: 0,
          provider: 'fedapay', // Use fedapay as fallback for receipt
          providerRef: data.data?.reference || `PAYONUS_${Date.now()}`,
          recipientSummary: `${accountName} (${recipient})`,
          userName: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          userEmail: user.email || ''
        });
        setTransferSuccess(true);

        toast.success('PayOnUs transfer initiated successfully!');
      }

    } catch (error: any) {
      toast.error(error.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (format: 'pdf' | 'jpeg') => {
    if (!completedTransactionDetails) return;

    // Only support PDF format
    if (format !== 'pdf') {
      toast.error('Only PDF receipts are supported');
      return;
    }

    setIsGeneratingReceipt(true);
    setShowReceiptOptions(false);

    try {
      const receiptBlob = await generateReceipt('pdf', completedTransactionDetails);
      
      // Create download link
      const url = URL.createObjectURL(receiptBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = generateReceiptFilename(
        completedTransactionDetails.txnId,
        completedTransactionDetails.createdAt,
        'pdf'
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Receipt downloaded as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate receipt');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleCloseSuccess = () => {
    setTransferSuccess(false);
    setCompletedTransactionDetails(null);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  // Show PIN setup modal if needed
  if (showPinSetup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <TransactionPinSetup
          onComplete={() => {
            setShowPinSetup(false);
            setHasPinSet(true);
            toast.success('Transaction PIN created! You can now send money.');
          }}
          onCancel={() => {
            setShowPinSetup(false);
            onClose();
          }}
          mode="create"
        />
      </div>
    );
  }

  const getCurrencySymbol = () => {
    switch (wallet.type) {
      case 'naira': return '₦';
      case 'cfa': return 'CFA';
      case 'usdt': return 'USDT';
      default: return '';
    }
  };

  const getMinAmount = () => {
    switch (wallet.type) {
      case 'naira': return 100;
      case 'cfa': return 100;
      case 'usdt': return 1;
      default: return 1;
    }
  };

  const getRecipientPlaceholder = () => {
    switch (wallet.type) {
      case 'naira': return '0123456789';
      case 'cfa': return '+229XXXXXXXX or 0XXXXXXXX';
      case 'usdt': return 'TRC20 wallet address';
      default: return 'Recipient details';
    }
  };

  const getRecipientLabel = () => {
    switch (wallet.type) {
      case 'naira': return 'Account Number';
      case 'cfa': return 'Phone Number';
      case 'usdt': return 'Wallet Address';
      default: return 'Recipient';
    }
  };

  // If transfer was successful, show success modal
  if (transferSuccess && completedTransactionDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Transfer Completed!</h2>
            <button 
              onClick={handleCloseSuccess} 
              className="text-gray-500 hover:text-gray-700"
              disabled={isGeneratingReceipt}
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your transfer has been initiated successfully! The recipient will receive the funds shortly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Transfer Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{getCurrencySymbol()} {completedTransactionDetails.amountSource.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{completedTransactionDetails.recipientSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{completedTransactionDetails.txnId}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCloseSuccess}
                disabled={isGeneratingReceipt || showReceiptOptions}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>
              
              <div className="relative">
                <button // This button now always triggers PDF download
                  onClick={() => setShowReceiptOptions(!showReceiptOptions)}
                  disabled={isGeneratingReceipt}
                  className="flex items-center px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50"
                >
                  {isGeneratingReceipt ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Download Receipt'
                  )}
                </button>
                
                {showReceiptOptions && !isGeneratingReceipt && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={async () => {
                        setShowReceiptOptions(false);
                        setIsGeneratingReceipt(true);
                        await handleDownloadReceipt('pdf');
                        setIsGeneratingReceipt(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-md"
                    >
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Send {wallet.type.toUpperCase()}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Wallet Balance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Available Balance:</span>
              <span className="text-xl font-bold">
                {getCurrencySymbol()} {wallet.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Transaction PIN Status Check for Naira */}
          {wallet.type === 'naira' && (
            <div className="space-y-4">
              {checkingPin ? (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Checking transaction PIN status...
                      </p>
                    </div>
                  </div>
                </div>
              ) : !hasPinSet ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 mb-3">
                        <strong>Transaction PIN Required:</strong> You need to create a 4-digit transaction PIN to send money securely.
                      </p>
                      <button
                        onClick={() => setShowPinSetup(true)}
                        className="flex items-center px-3 py-2 bg-[#00454a] text-white rounded-lg hover:bg-[#003238] text-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Transaction PIN
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Transaction PIN is set. You can proceed with transfers.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'form' && (wallet.type !== 'naira' || hasPinSet) && (
            <>
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({getCurrencySymbol()})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={getMinAmount()}
                    max={wallet.balance}
                    step="any"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-lg"
                    placeholder={`${getMinAmount()}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg">{getCurrencySymbol()}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Minimum: {getCurrencySymbol()} {getMinAmount().toLocaleString()}
                </p>
              </div>

              {/* Recipient Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getRecipientLabel()}
                </label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a]"
                  placeholder={getRecipientPlaceholder()}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              {/* Bank Selection for Naira */}
              {wallet.type === 'naira' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Bank
                  </label>
                  <select
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a]"
                    value={selectedBank}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      setAccountName('');
                    }}
                  >
                    <option value="">Choose bank</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    {banks.length} banks available via PayOnUs
                  </p>
                </div>
              )}

              {/* Account Name Input for Naira */}
              {wallet.type === 'naira' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                    {verifyingAccount && (
                      <span className="ml-2 text-blue-600 text-xs">Verifying...</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={verifyingAccount ? "Verifying account..." : "Enter account holder's full name"}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a]"
                    value={accountName}
                    disabled={verifyingAccount}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                  {verifyingAccount ? (
                    <p className="mt-1 text-sm text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Verifying account with PayOnUs...
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Account name will be automatically verified when you enter the account number
                    </p>
                  )}
                </div>
              )}

              {/* Transaction PIN for Naira */}
              {wallet.type === 'naira' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction PIN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="Enter 4-digit PIN"
                      className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-center text-lg tracking-widest"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Your 4-digit transaction PIN is required to authorize PayOnUs transfers
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a]"
                  placeholder="What's this for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Warning for different wallet types */}
              {wallet.type === 'usdt' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Ensure the recipient address is a valid TRC20 USDT address. Sending to wrong addresses may result in permanent loss.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {wallet.type === 'cfa' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Mobile money transfer to MTN or Moov numbers in Benin Republic.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {wallet.type === 'naira' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Bank transfer to Nigerian bank accounts via PayOnUs. A 4-digit transaction PIN is required to authorize the transfer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={
                loading || 
                (wallet.type === 'naira' && !hasPinSet) ||
                checkingPin ||
                !amount || 
                !recipient || 
                parseFloat(amount) <= 0 || 
                parseFloat(amount) > wallet.balance ||
                (wallet.type === 'naira' && (!accountName.trim() || !selectedBank || !transactionPin || transactionPin.length !== 4))
              }
              className="flex-1 px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : checkingPin ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking PIN...
                </>
              ) : wallet.type === 'naira' && !hasPinSet ? (
                <>
                  <Shield size={18} className="mr-2" />
                  Create PIN First
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Send {getCurrencySymbol()} {amount ? parseFloat(amount).toLocaleString() : '0'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendModal;