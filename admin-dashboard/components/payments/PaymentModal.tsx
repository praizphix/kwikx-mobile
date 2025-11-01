import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentService } from '../../lib/payments';
import { PaymentRequest } from '../../types/payment';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: 'naira' | 'cfa' | 'usdt';
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currency,
  amount,
  description,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd' | 'mobile_money'>('card');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    birthDate: '',
    nationality: ''
  });
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [supportedBanks, setSupportedBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    accountNumber: '',
    accountName: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPaymentOptions();
    }
  }, [isOpen, currency]);

  if (!isOpen) return null;

  const loadPaymentOptions = async () => {
    try {
      if (currency === 'cfa') {
        const methods = await paymentService.getFedaPayPaymentMethods();
        setPaymentMethods(methods);
      } else if (currency === 'naira') {
        const banks = await paymentService.getSquadCoSupportedBanks();
        setSupportedBanks(banks);
      }
    } catch (error) {
      console.warn('Failed to load payment options:', error);
    }
  };

  const getCurrencySymbol = () => {
    return paymentService.getCurrencySymbol(currency);
  };

  const getPaymentMethodOptions = () => {
    switch (currency) {
      case 'naira':
        return [
          { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Pay with your card' },
          { id: 'bank', name: 'Bank Transfer', icon: Wallet, description: 'Transfer from your bank account' },
          { id: 'ussd', name: 'USSD', icon: Smartphone, description: 'Pay using USSD code' }
        ];
      case 'cfa':
        return [
          { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Pay with your card' },
          { id: 'mobile_money', name: 'Mobile Money', icon: Smartphone, description: 'Pay with mobile money' },
          { id: 'bank', name: 'Bank Transfer', icon: Wallet, description: 'Transfer from your bank account' }
        ];
      case 'usdt':
        return [
          { id: 'crypto', name: 'Crypto Wallet', icon: Wallet, description: 'Transfer from your crypto wallet' }
        ];
      default:
        return [];
    }
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    if (!customerInfo.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Enhanced validation for CFA payments (FedaPay)
    if (currency === 'cfa') {
      if (!customerInfo.phone.trim()) {
        toast.error('Phone number is required for CFA payments');
        return false;
      }
      
      if (!customerInfo.address.trim()) {
        toast.error('Address is required for CFA payments');
        return false;
      }
    }

    if (paymentMethod === 'bank' && currency === 'naira') {
      if (!selectedBank) {
        toast.error('Please select a bank');
        return false;
      }
      if (!accountDetails.accountNumber.trim()) {
        toast.error('Please enter your account number');
        return false;
      }
      if (!accountDetails.accountName.trim()) {
        toast.error('Please enter your account name');
        return false;
      }
    }

    const minAmount = paymentService.getMinimumAmount(currency);
    if (amount < minAmount) {
      toast.error(`Minimum amount is ${getCurrencySymbol()} ${minAmount}`);
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (currency === 'usdt') {
        toast.info('USDT payments require manual wallet transfers. Please contact support for wallet address.');
        onClose();
        return;
      }

      // Handle bank transfer separately for SquadCo
      if (paymentMethod === 'bank' && currency === 'naira') {
        const transactionRef = `SQ_BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const response = await paymentService.initiateBankTransfer({
          amount,
          email: customerInfo.email,
          bank_code: selectedBank,
          account_number: accountDetails.accountNumber,
          account_name: accountDetails.accountName,
          transaction_ref: transactionRef
        });

        if (response.success) {
          onSuccess(response.transactionId);
          onClose();
          toast.success('Bank transfer initiated successfully!');
        } else {
          toast.error(response.message || 'Bank transfer failed');
        }
        return;
      }

      // Enhanced payment request with additional customer information
      const paymentRequest: PaymentRequest = {
        amount,
        currency: currency === 'naira' ? 'NGN' : 'XOF',
        description,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        
        // Enhanced customer information for FedaPay
        ...(currency === 'cfa' && {
          customerAddress: customerInfo.address,
          customerCity: customerInfo.city,
          customerCountry: customerInfo.country || 'BJ', // Default to Benin
          customerPostalCode: customerInfo.postalCode,
          customerBirthDate: customerInfo.birthDate,
          customerNationality: customerInfo.nationality,
          preferredPaymentMethods: [paymentMethod]
        })
      };

      const response = await paymentService.createPayment(currency, paymentRequest);

      if (response.success && response.paymentUrl) {
        // Open payment URL in new window
        const paymentWindow = window.open(
          response.paymentUrl,
          'payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        if (!paymentWindow) {
          toast.error('Please allow popups for this site to complete payment');
          return;
        }

        // Poll for payment completion
        const pollPayment = setInterval(async () => {
          try {
            const verification = await paymentService.verifyPayment(currency, response.transactionId);
            
            if (verification.status === 'completed') {
              clearInterval(pollPayment);
              paymentWindow?.close();
              onSuccess(verification.transactionId);
              onClose();
              toast.success('Payment completed successfully!');
            } else if (verification.status === 'failed') {
              clearInterval(pollPayment);
              paymentWindow?.close();
              toast.error('Payment failed. Please try again.');
            }
          } catch (error) {
            console.error('Error polling payment:', error);
          }
        }, 3000);

        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollPayment);
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
            toast.info('Payment window closed. Please check your transaction status.');
          }
        }, 600000);

        // Listen for window close
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            clearInterval(pollPayment);
          }
        }, 1000);

      } else {
        toast.error(response.message || 'Payment creation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="text-xl font-bold">
                {getCurrencySymbol()} {amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Description:</span>
              <span className="text-sm">{description}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Provider:</span>
              <span className="text-sm font-medium">{paymentService.getProviderForCurrency(currency)}</span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Customer Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number {currency === 'cfa' ? '*' : ''}
              </label>
              <input
                type="tel"
                required={currency === 'cfa'}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
            </div>

            {/* Enhanced fields for CFA payments */}
            {currency === 'cfa' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Enter your address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                      value={customerInfo.country}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, country: e.target.value })}
                    >
                      <option value="">Select country</option>
                      <option value="BJ">Benin</option>
                      <option value="BF">Burkina Faso</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="GW">Guinea-Bissau</option>
                      <option value="ML">Mali</option>
                      <option value="NE">Niger</option>
                      <option value="SN">Senegal</option>
                      <option value="TG">Togo</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-medium">Payment Method</h3>
            <div className="grid gap-3">
              {getPaymentMethodOptions().map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex items-center p-3 border rounded-lg transition-colors text-left ${
                    paymentMethod === method.id
                      ? 'border-[#00454a] bg-[#00454a]/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <method.icon size={20} className="mr-3 text-gray-600" />
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Transfer Details */}
          {paymentMethod === 'bank' && currency === 'naira' && (
            <div className="space-y-4">
              <h3 className="font-medium">Bank Transfer Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Bank *</label>
                <select
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">Choose your bank</option>
                  {supportedBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Number *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                  value={accountDetails.accountNumber}
                  onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                  placeholder="Enter your account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
                  value={accountDetails.accountName}
                  onChange={(e) => setAccountDetails({ ...accountDetails, accountName: e.target.value })}
                  placeholder="Enter your account name"
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Your payment is secured with industry-standard encryption and processed by {paymentService.getProviderForCurrency(currency)}.
                </p>
              </div>
            </div>
          </div>

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
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;