import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";
import { getCurrentUser, getUserProfile } from "@/services/auth";
import { getWalletByCurrency } from "@/services/wallets";
import fedaPayService from "@/services/fedapay";
import { supabase } from "@/lib/supabase";

const CFAWithdraw = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);

  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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

      const profile = await getUserProfile(user.id);
      if (profile) {
        setUserName(profile.full_name || "");
        setUserPhone(profile.phone || "");
        setPhoneNumber(profile.phone || "");
      }

      const wallet = await getWalletByCurrency(user.id, 'CFA');
      if (wallet) {
        setAvailableBalance(wallet.available_balance);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toString());
    }
  };

  const validateWithdrawal = (): boolean => {
    if (!phoneNumber) {
      Alert.alert("Phone Required", "Please enter a phone number for withdrawal");
      return false;
    }

    if (!fedaPayService.isValidBeninPhone(phoneNumber)) {
      Alert.alert("Invalid Phone", "Please enter a valid Benin phone number (e.g., 0197123456)");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return false;
    }

    const withdrawAmount = parseFloat(amount);
    const validation = fedaPayService.validateAmount(withdrawAmount, 500, availableBalance);

    if (!validation.valid) {
      Alert.alert("Invalid Amount", validation.message);
      return false;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You only have ${availableBalance.toLocaleString()} CFA available`
      );
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    const withdrawAmount = parseFloat(amount);

    Alert.alert(
      "Confirm Withdrawal",
      `You are about to withdraw ${withdrawAmount.toLocaleString()} CFA to phone number ${phoneNumber}.\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: processWithdrawal
        }
      ]
    );
  };

  const processWithdrawal = async () => {
    setProcessing(true);
    try {
      const withdrawAmount = parseFloat(amount);

      const result = await fedaPayService.createPayout({
        amount: withdrawAmount,
        customerPhone: phoneNumber,
        customerName: userName,
        description: `CFA withdrawal for ${userName}`,
        userId
      });

      if (!result.success) {
        Alert.alert("Withdrawal Failed", result.message);
        return;
      }

      // Deduct from wallet balance
      const newBalance = availableBalance - withdrawAmount;

      await supabase
        .from('wallets')
        .update({
          balance: newBalance,
          available_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('currency', 'CFA');

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          status: 'pending',
          from_currency: 'CFA',
          from_amount: withdrawAmount,
          reference: result.reference,
          description: `CFA withdrawal to ${phoneNumber}`,
          metadata: {
            provider: 'fedapay',
            payout_id: result.transactionId,
            phone_number: phoneNumber
          }
        });

      Alert.alert(
        "Withdrawal Initiated",
        `Your withdrawal of ${withdrawAmount.toLocaleString()} CFA has been initiated.\n\nThe money will be sent to ${phoneNumber} within a few minutes.\n\nTransaction ID: ${result.transactionId}`,
        [{ text: "OK", onPress: () => router.back() }]
      );

      // Reset form
      setAmount("");
      loadUserData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-n900">
        <ActivityIndicator size="large" color="#0A5344" />
      </View>
    );
  }

  const withdrawAmount = parseFloat(amount) || 0;

  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Withdraw CFA" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-6 py-6">
        {/* Available Balance */}
        <View className="bg-primary/10 dark:bg-accent/10 p-6 rounded-2xl">
          <ThemedText className="text-n600 dark:text-darkN600 text-sm mb-2">
            Available Balance
          </ThemedText>
          <View className="flex-row items-baseline">
            <ThemedText className="text-3xl text-primary dark:text-accent" weight="bold">
              {availableBalance.toLocaleString()}
            </ThemedText>
            <ThemedText className="text-xl text-primary dark:text-accent ml-2" weight="semiBold">
              CFA
            </ThemedText>
          </View>
        </View>

        {/* Warning Banner */}
        <View className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <ThemedText className="text-orange-800 dark:text-orange-200 text-sm mb-2" weight="bold">
            Mobile Money Withdrawal
          </ThemedText>
          <ThemedText className="text-orange-700 dark:text-orange-300 text-xs">
            • Withdrawals sent to your mobile money account{'\n'}
            • Supports MTN and Moov{'\n'}
            • Minimum withdrawal: 500 CFA{'\n'}
            • Processing time: 1-5 minutes{'\n'}
            • Ensure your mobile money account is active
          </ThemedText>
        </View>

        {/* Phone Number */}
        <View>
          <FormField
            isTitle={true}
            title="Mobile Money Number"
            placeholder="0197123456"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <ThemedText className="text-xs text-n600 dark:text-darkN600 mt-1">
            Enter your MTN or Moov mobile money number
          </ThemedText>
        </View>

        {/* Amount Input */}
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <ThemedText className="text-n800 dark:text-white" weight="medium">
              Amount (CFA)
            </ThemedText>
            <ThemedText
              className="text-primary dark:text-accent text-sm"
              weight="semiBold"
              onPress={handleMaxAmount}
            >
              MAX
            </ThemedText>
          </View>
          <FormField
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <ThemedText className="text-xs text-n600 dark:text-darkN600 mt-1">
            Minimum: 500 CFA
          </ThemedText>
        </View>

        {/* Transaction Summary */}
        {withdrawAmount > 0 && (
          <View className="bg-n100 dark:bg-darkN100 p-4 rounded-xl gap-y-2">
            <ThemedText className="text-n800 dark:text-white mb-2" weight="bold">
              Transaction Summary
            </ThemedText>

            <View className="flex-row justify-between">
              <ThemedText className="text-n600 dark:text-darkN600">
                Withdrawal Amount
              </ThemedText>
              <ThemedText className="text-n800 dark:text-white" weight="semiBold">
                {withdrawAmount.toLocaleString()} CFA
              </ThemedText>
            </View>

            <View className="flex-row justify-between">
              <ThemedText className="text-n600 dark:text-darkN600">
                Mobile Number
              </ThemedText>
              <ThemedText className="text-n800 dark:text-white" weight="semiBold">
                {phoneNumber}
              </ThemedText>
            </View>

            <View className="border-t border-n300 dark:border-darkN300 my-2" />

            <View className="flex-row justify-between">
              <ThemedText className="text-n800 dark:text-white" weight="bold">
                You Will Receive
              </ThemedText>
              <ThemedText className="text-primary dark:text-accent text-lg" weight="bold">
                {withdrawAmount.toLocaleString()} CFA
              </ThemedText>
            </View>
          </View>
        )}

        {/* Important Notice */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <ThemedText className="text-blue-800 dark:text-blue-200 text-sm mb-2" weight="bold">
            Important Information
          </ThemedText>
          <ThemedText className="text-blue-700 dark:text-blue-300 text-xs">
            • Ensure your mobile money account is registered{'\n'}
            • Phone number must match your account{'\n'}
            • Keep your phone on to receive SMS confirmation{'\n'}
            • Withdrawal is irreversible{'\n'}
            • Processing time: typically 1-5 minutes
          </ThemedText>
        </View>

        {/* Withdraw Button */}
        <View className="pt-4 pb-8">
          <PrimaryButton
            onPress={handleWithdraw}
            text={
              processing
                ? "Processing..."
                : `Withdraw ${withdrawAmount > 0 ? withdrawAmount.toLocaleString() + ' CFA' : ''}`
            }
            disabled={processing || !phoneNumber || !amount || withdrawAmount <= 0}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CFAWithdraw;
