import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface TwoFactorVerifyProps {
  onVerify: () => void;
  onCancel: () => void;
}

const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
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
            code,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onVerify();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <div className="h-12 w-12 bg-[#00454a] rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-[#eeb83b]" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
        <p className="mt-2 text-sm text-gray-500">
          Enter the verification code from your authenticator app
        </p>
      </div>

      <div className="space-y-6">
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
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00454a] hover:bg-[#003238] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a] disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00454a]"
          >
            Cancel
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Lost access to your authenticator app?{' '}
          <button
            className="text-[#00454a] hover:text-[#003238] font-medium"
            onClick={() => {/* Handle backup code flow */}}
          >
            Use a backup code
          </button>
        </p>
      </div>
    </div>
  );
};

export default TwoFactorVerify;