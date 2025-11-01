"use client"

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, CreditCard, Copy, CheckCircle, Clock, AlertCircle, Wallet } from "lucide-react";
import { supabase } from "../../lib/supabase";
import toast from "react-hot-toast";
import { paymentService } from "../../lib/payments";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletType: "naira" | "cfa" | "usdt";
  onSuccess: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, walletType, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nairaDepositMethod, setNairaDepositMethod] = useState<"paystack" | "payonus" | null>(null);
  const [depositInitiated, setDepositInitiated] = useState(false);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    email: "",
    name: ""
  });
  const [fetchingCustomerDetails, setFetchingCustomerDetails] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();


  const fetchCustomerDetails = async () => {
    setFetchingCustomerDetails(true);
    console.log("DEBUG: fetchCustomerDetails - Starting to fetch customer details.");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // Get user email from session
      const userEmail = session.user.email || "";
      console.log("DEBUG: fetchCustomerDetails - User email from session:", userEmail);

      // Get user name from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle();

      let userName = "";
      if (profileError) {
        console.warn("WARNING: fetchCustomerDetails - Error fetching user profile:", profileError);
        // Fallback to user_metadata if profile fetch fails
        userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
      } else {
        console.log("DEBUG: fetchCustomerDetails - Profile data fetched:", profile);
        userName = profile?.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
      }

      // If still no name, use email prefix as fallback
      if (!userName && userEmail) {
        userName = userEmail.split('@')[0];
      }

      setCustomerDetails({
        email: userEmail,
        name: userName
      });

      console.log("DEBUG: fetchCustomerDetails - Customer details set:", { email: userEmail, name: userName });
    } catch (error) {
      console.error("ERROR: fetchCustomerDetails - Failed to load customer details:", error);
      toast.error("Failed to load customer details");
    } finally {
      setFetchingCustomerDetails(false);
      console.log("DEBUG: fetchCustomerDetails - Finished fetching customer details. fetchingCustomerDetails set to false.");
    }
  };

  useEffect(() => {
    if (isOpen && walletType === "usdt") {
      fetchUSDTAddress();
    }

    // Reset state when modal is opened
    if (isOpen) {
      setAmount("");
      setNairaDepositMethod(null);
      setDepositInitiated(false);
      setCustomerDetails({ email: "", name: "" });
      setFetchingCustomerDetails(false);

      // Clear any existing polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Fetch customer details for Naira deposits
      if (walletType === "naira") {
        fetchCustomerDetails();
      }
    }
  }, [isOpen, walletType]);

  // Set up polling for transaction status when a transaction is initiated OR DVA is shown
  useEffect(() => {
    // Regular payment polling (for Paystack/FedaPay)
  }, [pollingInterval]);

  const fetchUSDTAddress = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: wallet } = await supabase
        .from("wallets")
        .select("wallet_address, account_number")
        .eq("user_id", user.id)
        .eq("type", "usdt")
        .single();

      if (wallet) {
        setWalletAddress(wallet.wallet_address || wallet.account_number);
      }
    } catch (error) {
      console.error("Error fetching USDT address:", error);
    }
  };

  const handleContinue = async () => {
    if (walletType === "usdt") {
      // For USDT, just show the address
      return;
    }

    if (walletType === "naira") {
      // For Naira, handle payment method selection
      if (!nairaDepositMethod) {
        toast.error("Please select a payment method");
        return;
      }

      if (nairaDepositMethod === "payonus") { // This is the DVA flow
        // For PayOnUs direct payin, initiate payment
        const numAmount = Number.parseFloat(amount);
        const minAmount = getMinAmount();

        if (!numAmount || numAmount < minAmount) {
          toast.error("Minimum deposit amount is " + getCurrencySymbol() + " " + minAmount.toLocaleString());
          return;
        }

        setLoading(true);

        try {
          console.log("💰 Initiating PayOnUs direct payin for amount:", numAmount);

          // Get user session for authentication
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) throw new Error("No session");

          // Get or create PayOnUs virtual account and navigate to DVA polling page
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-deposit-naira-payonus-dva`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error('❌ PayOnUs virtual account fetch failed:', data);
            throw new Error(data.error || 'Failed to get PayOnUs virtual account');
          }

          console.log('✅ PayOnUs virtual account details retrieved:', data.data);

          // Generate unique deposit session ID to prevent duplicate processing
          const depositSessionId = `deposit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          console.log('🆔 Generated deposit session ID:', depositSessionId);

          // Navigate to DVA polling page with actual virtual account details
          navigate('/payment/dva-polling', {
            state: {
              walletType: 'naira',
              amount: numAmount,
              dvaDetails: {
                accountNumber: data.data.account_number,
                bankName: data.data.bank_name,
                accountName: data.data.account_name
              },
              depositInitiatedAt: new Date().toISOString(),
              depositSessionId: depositSessionId
            }
          });
          onClose();
          return;
        } catch (error: any) {
          console.error('❌ PayOnUs virtual account error:', error);
          toast.error(error.message || 'Failed to get PayOnUs virtual account details');
          setDepositInitiated(false);
        } finally {
          setLoading(false);
        }
        return;
      } else { // FedaPay payment failed
        // This is the Paystack flow - continue to Paystack handling below
      }
    }

    if (nairaDepositMethod === "paystack") {
      // Handle Paystack payment for Naira
      const numAmount = Number.parseFloat(amount);
      const minAmount = getMinAmount();

      if (!numAmount || numAmount < minAmount) {
        toast.error("Minimum deposit amount is " + getCurrencySymbol() + " " + minAmount.toLocaleString());
        return;
      }

      setLoading(true);

      try {
        console.log("💰 Initiating Paystack payment gateway for amount:", numAmount);

        // Get user session for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        // Call the Paystack gateway function
        const response = await paymentService.initializePaystackDeposit({
          amount: numAmount,
          email: customerDetails.email,
          name: customerDetails.name,
          userId: session.user.id,
        });

        if (response.success && response.paymentUrl) {
          console.log("✅ Paystack payment URL generated:", response.paymentUrl);
          
          setDepositInitiated(true);

          // Open payment URL in new window
          const paymentWindow = window.open(
            response.paymentUrl,
            'paystack-payment',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );
          
          // Store the payment window reference for auto-close
          setPaymentWindow(paymentWindow);

          if (!paymentWindow) {
            toast.error('Please allow popups for this site to complete payment');
            return;
          }

          toast.success("Payment window opened. Complete your payment to fund your wallet.");
        } else {
          throw new Error(response.message || "Failed to initialize payment");
        }
      } catch (error: any) {
        console.error("❌ Paystack gateway error:", error);
        toast.error(error.message || "Failed to initialize payment");
        setDepositInitiated(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    // CFA logic (only runs if walletType is "cfa")
    if (walletType === "cfa") {
      const numAmount = Number.parseFloat(amount);
      const minAmount = getMinAmount();

      if (!numAmount || numAmount < minAmount) {
        toast.error("Minimum deposit amount is " + getCurrencySymbol() + " " + minAmount.toLocaleString());
        return;
      }
      
      setLoading(true);

      try {
        console.log("💰 Initiating CFA deposit with KkiaPay for amount:", numAmount);

        // Get user session for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error("No session");

        console.log("🔑 Got user session, creating FedaPay payment");

        // Create FedaPay payment
        const response = await paymentService.createPayment("cfa", {
          amount: numAmount,
          currency: "XOF",
          description: "CFA Wallet Deposit",
          customerEmail: session.user.email || "",
          customerName: session.user.user_metadata?.full_name || "",
          userId: session.user.id,
        });

        if (response.success && response.paymentUrl) {
          console.log("✅ FedaPay payment URL generated:", response.paymentUrl);

          setDepositInitiated(true);

          // Open payment URL in new window
          const paymentWindow = window.open(
            response.paymentUrl,
            'fedapay-payment',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );
          
          // Store the payment window reference for auto-close
          setPaymentWindow(paymentWindow);

          if (!paymentWindow) {
            toast.error('Please allow popups for this site to complete payment');
            return;
          }

          toast.success("Payment window opened. Complete your payment to fund your wallet.");
        } else {
          console.error("❌ FedaPay payment failed:", response);
          throw new Error(response.message || "Failed to create payment");
        }
      } catch (error: any) {
        console.error("❌ Deposit error:", error);
        toast.error(error.message || "Failed to initiate deposit");
        setDepositInitiated(false);
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  if (!isOpen) return null;

  const getCurrencySymbol = () => {
    switch (walletType) {
      case "naira":
        return "₦";
      case "cfa":
        return "CFA";
      case "usdt":
        return "USDT";
      default:
        return "";
    }
  };

  const getMinAmount = () => {
    switch (walletType) {
      case "naira":
        return 1000;
      case "cfa":
        return 500;
      case "usdt":
        return 10;
      default:
        return 1;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Deposit to {walletType.toUpperCase()} Wallet</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {walletType === "usdt" ? (
            // USDT specific deposit instructions
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Send USDT (TRC20) to the address below. Transactions will be automatically detected and credited
                      to your wallet.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your USDT Wallet Address (TRC20)</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <code className="text-sm font-mono break-all mr-2">{walletAddress || "Loading..."}</code>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="text-[#00454a] hover:text-[#003238] flex-shrink-0"
                    disabled={!walletAddress}
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Important:</strong> Only send USDT on the TRC20 network. Sending other tokens or using
                      different networks may result in permanent loss of funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Fiat currency deposit form - simplified
            <>
              {walletType === "naira" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount ({getCurrencySymbol()})</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={getMinAmount()}
                        step="any"
                        className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-lg"
                        placeholder={`${getMinAmount().toLocaleString()}`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-lg">{getCurrencySymbol()}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Minimum deposit: {getCurrencySymbol()} {getMinAmount().toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Select Payment Method</h3>
                    
                    {/* Dedicated Virtual Account Option - Primary for Naira */}
                    <button
                      onClick={() => setNairaDepositMethod("payonus")}
                      className={`w-full p-4 border-2 rounded-lg transition-all ${
                        nairaDepositMethod === "payonus"
                          ? "border-[#00454a] bg-[#00454a]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <Wallet className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium text-gray-900">Dedicated Virtual Account</h4>
                            <p className="text-sm text-gray-500">Dedicated virtual account for deposits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Available
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {walletType === "cfa" && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> You can pay using cards (Visa, Mastercard), mobile money (MTN, Moov), or
                        bank transfers.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {walletType === "cfa" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount ({getCurrencySymbol()})</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={getMinAmount()}
                      step="any"
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-[#00454a] focus:border-[#00454a] text-lg"
                      placeholder={`${getMinAmount().toLocaleString()}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">{getCurrencySymbol()}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum deposit: {getCurrencySymbol()} {getMinAmount().toLocaleString()}
                  </p>
                </div>
              )}

              {walletType === "cfa" && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You can pay using mobile money (MTN, Moov), cards, or bank transfers via FedaPay.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => {
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {walletType === "cfa" && (
              <button
                onClick={handleContinue}
                disabled={!amount || loading}
                className="flex-1 px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Continue
                  </>
                )}
              </button>
            )}
            {walletType === "naira" && (
              <button
                onClick={handleContinue} // This will trigger PayOnUs DVA display or Paystack gateway
                disabled={loading || fetchingCustomerDetails || !customerDetails.email || !customerDetails.name}
                className="flex-1 px-4 py-2 bg-[#00454a] text-white rounded-md hover:bg-[#003238] disabled:opacity-50 flex items-center justify-center"
              >
                {loading || fetchingCustomerDetails ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {fetchingCustomerDetails ? "Loading..." : "Processing..."}
                  </>
                ) : (
                  <> 
                    <Plus size={18} className="mr-2" />
                    Continue
                  </>
                )}
              </button>
            )}
          </div>

          {/* Show loading state for customer details */}
          {fetchingCustomerDetails && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Loading customer details...
            </div>
          )}

          {/* Show warning if customer details are missing */}
          {!fetchingCustomerDetails && (!customerDetails.email || !customerDetails.name) && walletType === "naira" && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded-r-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please complete your profile information to proceed with deposits.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;