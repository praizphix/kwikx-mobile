import { View, ScrollView, Alert, ActivityIndicator, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { WebView } from "react-native-webview";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";
import { getCurrentUser, getUserProfile } from "@/services/auth";
import { getWalletByCurrency } from "@/services/wallets";
import fedaPayService from "@/services/fedapay";
import { supabase } from "@/lib/supabase";

const CFADeposit = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [currentBalance, setCurrentBalance] = useState(0);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/SignIn");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserName(profile.full_name || "");
        setUserPhone(profile.phone || "");
      }

      const wallet = await getWalletByCurrency(user.id, 'CFA');
      if (wallet) {
        setCurrentBalance(wallet.balance);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (!amount || depositAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    const validation = fedaPayService.validateAmount(depositAmount, 100, 1000000);
    if (!validation.valid) {
      Alert.alert("Invalid Amount", validation.message);
      return;
    }

    if (!userName || !userEmail) {
      Alert.alert("Missing Information", "Please complete your profile first");
      router.push("/(settings-pages)/EditProfile");
      return;
    }

    if (paymentMethod === 'mobile_money' && !userPhone) {
      Alert.alert("Phone Required", "Mobile money requires a phone number. Please update your profile.");
      return;
    }

    setProcessing(true);
    try {
      const result = await fedaPayService.createDeposit({
        amount: depositAmount,
        description: `CFA deposit for ${userName}`,
        customerEmail: userEmail,
        customerName: userName,
        customerPhone: userPhone,
        userId
      });

      if (!result.success) {
        Alert.alert("Deposit Failed", result.message);
        return;
      }

      // Store pending transaction in database
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          status: 'pending',
          from_currency: 'CFA',
          from_amount: depositAmount,
          reference: result.reference,
          description: `CFA deposit via FedaPay`,
          metadata: {
            provider: 'fedapay',
            transaction_id: result.transactionId,
            payment_method: paymentMethod
          }
        });

      if (txError) {
        console.error('Failed to save transaction:', txError);
      }

      if (result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        setTransactionId(result.transactionId);
        setShowPayment(true);
      } else {
        Alert.alert(
          "Payment Created",
          "Your payment has been created. Transaction ID: " + result.transactionId,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create deposit");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentComplete = async () => {
    // Verify transaction
    try {
      const result = await fedaPayService.verifyTransaction(transactionId);

      if (result.success && result.status === 'completed') {
        // Update wallet balance
        const newBalance = currentBalance + parseFloat(amount);

        await supabase
          .from('wallets')
          .update({
            balance: newBalance,
            available_balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('currency', 'CFA');

        // Update transaction status
        await supabase
          .from('transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('reference', result.reference);

        Alert.alert(
          "Deposit Successful",
          `Your account has been credited with ${parseFloat(amount).toLocaleString()} CFA`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Payment Status", `Transaction status: ${result.status}`);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      Alert.alert("Notice", "Your payment is being processed. Check your balance in a few minutes.");
      router.back();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-n900">
        <ActivityIndicator size="large" color="#0A5344" />
      </View>
    );
  }

  if (showPayment && paymentUrl) {
    return (
      <View className="flex-1 bg-white dark:bg-n0">
        <PageTitle title="Complete Payment" isBgWhite={true} />
        <WebView
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onNavigationStateChange={(navState) => {
            if (navState.url.includes('success') || navState.url.includes('callback')) {
              setShowPayment(false);
              handlePaymentComplete();
            } else if (navState.url.includes('cancel') || navState.url.includes('error')) {
              setShowPayment(false);
              Alert.alert("Payment Cancelled", "Your payment was not completed");
            }
          }}
        />
        <View className="p-4 bg-white dark:bg-n0">
          <PrimaryButton
            text="Cancel Payment"
            onPress={() => {
              setShowPayment(false);
              Alert.alert("Payment Cancelled", "You cancelled the payment");
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Deposit CFA" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-6 py-6">
        {/* Current Balance */}
        <View className="bg-primary/10 dark:bg-accent/10 p-6 rounded-2xl">
          <ThemedText className="text-n600 dark:text-darkN600 text-sm mb-2">
            Current Balance
          </ThemedText>
          <View className="flex-row items-baseline">
            <ThemedText className="text-3xl text-primary dark:text-accent" weight="bold">
              {currentBalance.toLocaleString()}
            </ThemedText>
            <ThemedText className="text-xl text-primary dark:text-accent ml-2" weight="semiBold">
              CFA
            </ThemedText>
          </View>
        </View>

        {/* Information Banner */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <ThemedText className="text-blue-800 dark:text-blue-200 text-sm mb-2" weight="bold">
            Deposit via FedaPay
          </ThemedText>
          <ThemedText className="text-blue-700 dark:text-blue-300 text-xs">
            • Secure payment processing{'\n'}
            • Mobile Money: MTN, Moov{'\n'}
            • Credit/Debit cards accepted{'\n'}
            • Minimum deposit: 100 CFA{'\n'}
            • Instant credit to your wallet
          </ThemedText>
        </View>

        {/* Payment Method Selection */}
        <View>
          <ThemedText className="text-n800 dark:text-white mb-3" weight="bold">
            Payment Method
          </ThemedText>
          <View className="flex-row gap-x-3">
            <Pressable
              onPress={() => setPaymentMethod('mobile_money')}
              className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                paymentMethod === 'mobile_money'
                  ? 'border-primary bg-primary/10'
                  : 'border-n300 dark:border-darkN300'
              }`}
            >
              <ThemedText
                className={`text-center ${
                  paymentMethod === 'mobile_money'
                    ? 'text-primary font-semibold'
                    : 'text-n700 dark:text-darkN700'
                }`}
              >
                📱 Mobile Money
              </ThemedText>
              <ThemedText className="text-center text-xs text-n600 dark:text-darkN600 mt-1">
                MTN, Moov
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setPaymentMethod('card')}
              className={`flex-1 py-4 px-4 rounded-xl border-2 ${
                paymentMethod === 'card'
                  ? 'border-primary bg-primary/10'
                  : 'border-n300 dark:border-darkN300'
              }`}
            >
              <ThemedText
                className={`text-center ${
                  paymentMethod === 'card'
                    ? 'text-primary font-semibold'
                    : 'text-n700 dark:text-darkN700'
                }`}
              >
                💳 Card
              </ThemedText>
              <ThemedText className="text-center text-xs text-n600 dark:text-darkN600 mt-1">
                Visa, Mastercard
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Amount Input */}
        <View>
          <FormField
            isTitle={true}
            title="Amount (CFA)"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <ThemedText className="text-xs text-n600 dark:text-darkN600 mt-1">
            Min: 100 CFA • Max: 1,000,000 CFA
          </ThemedText>
        </View>

        {/* Quick Amount Buttons */}
        <View>
          <ThemedText className="text-n800 dark:text-white mb-3" weight="medium">
            Quick Amounts
          </ThemedText>
          <View className="flex-row flex-wrap gap-2">
            {[500, 1000, 2000, 5000, 10000, 20000].map((quickAmount) => (
              <Pressable
                key={quickAmount}
                onPress={() => setAmount(quickAmount.toString())}
                className="bg-n100 dark:bg-darkN100 py-2 px-4 rounded-lg"
              >
                <ThemedText className="text-primary dark:text-accent" weight="semiBold">
                  {quickAmount.toLocaleString()} CFA
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Deposit Button */}
        <View className="pt-4 pb-8">
          <PrimaryButton
            onPress={handleDeposit}
            text={processing ? "Processing..." : `Deposit ${parseFloat(amount) > 0 ? parseFloat(amount).toLocaleString() + ' CFA' : ''}`}
            disabled={processing || !amount || parseFloat(amount) <= 0}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CFADeposit;
