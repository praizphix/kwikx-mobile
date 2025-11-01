import React, { useState } from 'react';
import { Shield, Copy, Check, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify'>('intro');
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauth: string;
    backupCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/two-factor-auth`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'setup' }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSetupData(data);
      setStep('qr');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/two-factor-auth`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'verify',
            code: verificationCode,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Two-factor authentication enabled successfully');
      onComplete();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-white rounded-lg max-w-md mx-auto">
      {step === 'intro' && (
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 bg-[#00454a] rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#eeb83b]" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Enable Two-Factor Authentication</h3>
            <p className="mt-2 text-sm text-gray-500">
              Add an extra layer of security to your account by requiring both your password and an authentication code.
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a] disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
            <button
              onClick={onCancel}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'qr' && setupData && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Scan QR Code</h3>
            <p className="mt-2 text-sm text-gray-500">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div className="flex justify-center">
            <div className="p-4 bg-white border rounded-lg">
              <QRCode value={setupData.otpauth} size={200} />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Manual Setup Code</p>
            <div className="flex items-center justify-between bg-white p-2 rounded border">
              <code className="text-sm">{setupData.secret}</code>
              <button
                onClick={() => copyToClipboard(setupData.secret)}
                className="text-gray-500 hover:text-gray-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator device.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-sm font-mono text-center">
                  {code}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep('verify')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Verify Setup</h3>
            <p className="mt-2 text-sm text-gray-500">
              Enter the verification code from your authenticator app
            </p>
          </div>

          <div>
            <label htmlFor="code" className="sr-only">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              maxLength={6}
              className="block w-full px-4 py-2 text-center text-2xl tracking-widest border-gray-300 rounded-md shadow-sm focus:ring-[#00454a] focus:border-[#00454a]"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a] disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={() => setStep('qr')}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;