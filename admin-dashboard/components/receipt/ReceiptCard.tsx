import React from 'react';
import QRCode from 'qrcode.react';

interface ReceiptCardProps {
  txnId: string;
  createdAt: string;
  sourceCurrency: string;
  destCurrency: string;
  amountSource: number;
  amountDest: number;
  effectiveRate: number;
  fxFee: number;
  railFee: number;
  provider: 'paystack' | 'fedapay';
  providerRef: string;
  recipientSummary: string;
  userName: string;
  userEmail: string;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({
  txnId,
  createdAt,
  sourceCurrency,
  destCurrency,
  amountSource,
  amountDest,
  effectiveRate,
  fxFee,
  railFee,
  provider,
  providerRef,
  recipientSummary,
  userName,
  userEmail
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'NGN') return `₦${amount.toLocaleString()}`;
    if (currency === 'XOF') return `${amount.toLocaleString()} CFA`;
    if (currency === 'USDT') return `${amount.toLocaleString()} USDT`;
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const getProviderName = () => {
    return provider === 'paystack' ? 'Paystack' : 'FedaPay';
  };

  const qrCodeData = `${window.location.origin}/receipt/verify?txn=${txnId}`;

  return (
    <div className="bg-white p-6 max-w-md mx-auto" style={{ width: '400px', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-[#00454a] rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-[#eeb83b] font-bold text-xl">K</span>
        </div>
        <h1 className="text-2xl font-bold text-[#00454a] mb-1">KwikX</h1>
        <p className="text-sm text-gray-600">Transfer Receipt</p>
      </div>

      {/* Transaction Status */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
        <div className="flex items-center">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-xs">✓</span>
          </div>
          <div>
            <p className="text-green-800 font-semibold">Transfer Successful</p>
            <p className="text-green-700 text-sm">{formatDate(createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Transaction Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Sent:</span>
              <span className="font-semibold">{formatCurrency(amountSource, sourceCurrency)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Received:</span>
              <span className="font-semibold">{formatCurrency(amountDest, destCurrency)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Exchange Rate:</span>
              <span className="font-semibold">1 {sourceCurrency} = {effectiveRate} {destCurrency}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">FX Fee:</span>
              <span className="font-semibold">{formatCurrency(fxFee, sourceCurrency)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Transfer Fee:</span>
              <span className="font-semibold">{formatCurrency(railFee, sourceCurrency)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Transfer Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm">{txnId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Provider Reference:</span>
              <span className="font-mono text-sm">{providerRef}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-semibold">{getProviderName()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Recipient:</span>
              <span className="font-semibold text-right max-w-[200px] break-words">{recipientSummary}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{userName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{userEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-3">Verify this receipt online</p>
        <div className="inline-block p-3 bg-white border-2 border-gray-200 rounded-lg">
          <QRCode value={qrCodeData} size={80} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Scan to verify transaction</p>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-1">
          Generated on {new Date().toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Thank you for using KwikX
        </p>
        <p className="text-xs text-[#00454a] font-semibold">
          www.getkwikx.com | The faster, cheaper way to send money internationally
        </p>
      </div>
    </div>
  );
};

export default ReceiptCard;