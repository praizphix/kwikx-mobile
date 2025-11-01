import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface TransactionPinSetupProps {
  onComplete: () => void;
  onCancel: () => void;
  mode?: 'create' | 'update';
  currentPinRequired?: boolean;
}

const TransactionPinSetup: React.FC<TransactionPinSetupProps> = ({ 
  onComplete, 
  onCancel, 
  mode = 'create',
  currentPinRequired = false 
}) => {
  const [step, setStep] = useState<'intro' | 'current' | 'new' | 'confirm'>('intro');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [formData, setFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [pinValidation, setPinValidation] = useState({
    isValid: false,
    isNumeric: false,
    isCorrectLength: false
  });

  const validatePin = (pin: string) => {
    const isNumeric = /^\d+$/.test(pin);
    const isCorrectLength = pin.length === 4;
    const isValid = isNumeric && isCorrectLength;

    setPinValidation({
      isValid,
      isNumeric,
      isCorrectLength
    });

    return isValid;
  };

  const handlePinChange = (field: 'currentPin' | 'newPin' | 'confirmPin', value: string) => {
    // Only allow digits and limit to 4 characters
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));

    // Validate new PIN
    if (field === 'newPin') {
      validatePin(numericValue);
    }
  };

  const handleSubmit = async () => {
    if (step === 'intro') {
      if (mode === 'update' && currentPinRequired) {
        setStep('current');
      } else {
        setStep('new');
      }
      return;
    }

    if (step === 'current') {
      if (!formData.currentPin || formData.currentPin.length !== 4) {
        toast.error('Please enter your current 4-digit PIN');
        return;
      }
      setStep('new');
      return;
    }

    if (step === 'new') {
      if (!pinValidation.isValid) {
        toast.error('Please enter a valid 4-digit PIN');
        return;
      }
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      if (formData.newPin !== formData.confirmPin) {
        toast.error('PINs do not match');
        return;
      }

      setLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const payload: any = {
          action: mode,
          pin: formData.newPin
        };

        if (mode === 'update' && formData.currentPin) {
          payload.current_pin = formData.currentPin;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-transaction-pin`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        toast.success(`Transaction PIN ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        onComplete();
      } catch (error: any) {
        toast.error(error.message || `Failed to ${mode} transaction PIN`);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'intro':
        return mode === 'create' ? 'Create Transaction PIN' : 'Update Transaction PIN';
      case 'current':
        return 'Enter Current PIN';
      case 'new':
        return 'Enter New PIN';
      case 'confirm':
        return 'Confirm New PIN';
      default:
        return 'Transaction PIN Setup';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'intro':
        return mode === 'create' 
          ? 'Create a 4-digit PIN to authorize your transfers securely'
          : 'Update your existing 4-digit transaction PIN';
      case 'current':
        return 'Enter your current PIN to proceed with the update';
      case 'new':
        return 'Choose a new 4-digit PIN for your transactions';
      case 'confirm':
        return 'Re-enter your new PIN to confirm';
      default:
        return '';
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
        <h3 className="text-lg font-medium text-gray-900">{getStepTitle()}</h3>
        <p className="mt-2 text-sm text-gray-500">{getStepDescription()}</p>
      </div>

      <div className="space-y-6">
        {step === 'intro' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Security Notice:</strong> Your transaction PIN is required to authorize all money transfers. 
                    Choose a PIN that you can remember but others cannot guess.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">PIN Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Exactly 4 digits
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Numbers only (0-9)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Easy to remember but hard to guess
                </li>
                <li className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                  Avoid obvious patterns (1234, 0000, etc.)
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 'current' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Transaction PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-center text-lg tracking-widest"
                placeholder="••••"
                value={formData.currentPin}
                onChange={(e) => handlePinChange('currentPin', e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
        )}

        {step === 'new' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'create' ? 'Create' : 'New'} Transaction PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-center text-lg tracking-widest"
                placeholder="••••"
                value={formData.newPin}
                onChange={(e) => handlePinChange('newPin', e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            {/* PIN Validation Indicators */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center text-sm">
                {pinValidation.isCorrectLength ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                )}
                <span className={pinValidation.isCorrectLength ? "text-green-700" : "text-gray-600"}>
                  Exactly 4 digits
                </span>
              </div>
              <div className="flex items-center text-sm">
                {pinValidation.isNumeric ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-gray-300 mr-2" />
                )}
                <span className={pinValidation.isNumeric ? "text-green-700" : "text-gray-600"}>
                  Numbers only
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Transaction PIN
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={4}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-center text-lg tracking-widest"
                placeholder="••••"
                value={formData.confirmPin}
                onChange={(e) => handlePinChange('confirmPin', e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPin(!showPin)}
              >
                {showPin ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            {formData.newPin && formData.confirmPin && formData.newPin !== formData.confirmPin && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                PINs do not match
              </div>
            )}

            {formData.newPin && formData.confirmPin && formData.newPin === formData.confirmPin && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                PINs match
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (step === 'new' && !pinValidation.isValid) || (step === 'confirm' && formData.newPin !== formData.confirmPin)}
            className="flex-1 px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {step === 'intro' ? 'Continue' : 
                 step === 'current' ? 'Verify' :
                 step === 'new' ? 'Next' : 
                 `${mode === 'create' ? 'Create' : 'Update'} PIN`}
              </>
            )}
          </button>
        </div>

        {step !== 'intro' && (
          <button
            onClick={() => {
              if (step === 'current') setStep('intro');
              else if (step === 'new') setStep(mode === 'update' && currentPinRequired ? 'current' : 'intro');
              else if (step === 'confirm') setStep('new');
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionPinSetup;