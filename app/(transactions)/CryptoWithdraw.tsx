import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";
import { getCurrentUser } from "@/services/auth";
import { getWalletByCurrency } from "@/services/wallets";
import { withdrawCrypto, estimateWithdrawalFee } from "@/services/crypto";
import tatumService from "@/services/tatum";
import { router } from "expo-router";
import { CURRENCY_SYMBOLS } from "@/types/database";

const CryptoWithdraw = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [estimatedFee, setEstimatedFee] = useState(1.4);

  useEffect(() => {
    loadWalletData();
    loadEstimatedFee();
  }, []);

  const loadWalletData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/SignIn");
        return;
      }
      setUserId(user.id);

      const wallet = await getWalletByCurrency(user.id, 'USDT');
      if (wallet) {
        setAvailableBalance(wallet.available_balance);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const loadEstimatedFee = async () => {
    try {
      const fee = await estimateWithdrawalFee();
      setEstimatedFee(fee);
    } catch (error) {
      console.error("Failed to load fee estimate:", error);
    }
  };

  const handleMaxAmount = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toString());
    }
  };

  const validateWithdrawal = (): boolean => {
    if (!toAddress) {
      Alert.alert("Missing Address", "Please enter a withdrawal address");
      return false;
    }

    if (!tatumService.isValidTronAddress(toAddress)) {
      Alert.alert("Invalid Address", "Please enter a valid TRON (TRC20) address");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return false;
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < 1) {
      Alert.alert("Amount Too Low", "Minimum withdrawal amount is 1 USDT");
      return false;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert("Insufficient Balance", `You only have ${availableBalance.toFixed(2)} USDT available`);
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateWithdrawal()) return;

    const withdrawAmount = parseFloat(amount);
    const total = withdrawAmount;

    Alert.alert(
      "Confirm Withdrawal",
      `You are about to withdraw ${withdrawAmount.toFixed(2)} USDT to:\n\n${toAddress}\n\nEstimated fee: ${estimatedFee} TRX\n\nThis action cannot be undone.`,
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
    setSubmitting(true);
    try {
      const result = await withdrawCrypto({
        userId,
        toAddress,
        amount: parseFloat(amount),
        currency: 'USDT'
      });

      if (!result.success) {
        Alert.alert("Withdrawal Failed", result.message);
        return;
      }

      Alert.alert(
        "Withdrawal Initiated",
        `Your withdrawal has been initiated successfully.\n\nTransaction ID: ${result.txId}\n\nYou can track this transaction on the blockchain.`,
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );

      // Reset form
      setToAddress("");
      setAmount("");
      loadWalletData();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process withdrawal");
    } finally {
      setSubmitting(false);
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
      <PageTitle title="Withdraw USDT" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-6 py-6">
        {/* Balance Display */}
        <View className="bg-primary/10 dark:bg-accent/10 p-6 rounded-2xl">
          <ThemedText className="text-n600 dark:text-darkN600 text-sm mb-2">
            Available Balance
          </ThemedText>
          <View className="flex-row items-baseline">
            <ThemedText className="text-3xl text-primary dark:text-accent" weight="bold">
              {availableBalance.toFixed(2)}
            </ThemedText>
            <ThemedText className="text-xl text-primary dark:text-accent ml-2" weight="semiBold">
              USDT
            </ThemedText>
          </View>
        </View>

        {/* Warning Banner */}
        <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
          <ThemedText className="text-red-800 dark:text-red-200 text-sm mb-2" weight="bold">
            ⚠️ Important Warning
          </ThemedText>
          <ThemedText className="text-red-700 dark:text-red-300 text-xs">
            • Only withdraw to TRON (TRC20) addresses{'\n'}
            • Withdrawing to other networks will result in loss of funds{'\n'}
            • Double-check the address before confirming{'\n'}
            • Withdrawals are irreversible
          </ThemedText>
        </View>

        {/* Withdrawal Form */}
        <View className="gap-y-4">
          <FormField
            isTitle={true}
            title="Withdrawal Address"
            placeholder="TRON (TRC20) address"
            value={toAddress}
            onChangeText={setToAddress}
            autoCapitalize="none"
          />

          <View>
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText className="text-n800 dark:text-white" weight="medium">
                Amount (USDT)
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
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <ThemedText className="text-xs text-n600 dark:text-darkN600 mt-1">
              Minimum: 1 USDT
            </ThemedText>
          </View>
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
                {withdrawAmount.toFixed(2)} USDT
              </ThemedText>
            </View>

            <View className="flex-row justify-between">
              <ThemedText className="text-n600 dark:text-darkN600">
                Network Fee (estimated)
              </ThemedText>
              <ThemedText className="text-n800 dark:text-white" weight="semiBold">
                {estimatedFee.toFixed(2)} TRX
              </ThemedText>
            </View>

            <View className="border-t border-n300 dark:border-darkN300 my-2" />

            <View className="flex-row justify-between">
              <ThemedText className="text-n800 dark:text-white" weight="bold">
                You Will Receive
              </ThemedText>
              <ThemedText className="text-primary dark:text-accent text-lg" weight="bold">
                {withdrawAmount.toFixed(2)} USDT
              </ThemedText>
            </View>
          </View>
        )}

        {/* Network Information */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <ThemedText className="text-blue-800 dark:text-blue-200 text-sm mb-2" weight="bold">
            Network Information
          </ThemedText>
          <ThemedText className="text-blue-700 dark:text-blue-300 text-xs">
            • Network: TRON (TRC20){'\n'}
            • Confirmation Time: ~1 minute (19 blocks){'\n'}
            • Network Fee: Paid in TRX (~{estimatedFee} TRX){'\n'}
            • Transaction is irreversible
          </ThemedText>
        </View>

        {/* Withdraw Button */}
        <View className="pt-4 pb-8">
          <PrimaryButton
            onPress={handleWithdraw}
            text={submitting ? "Processing..." : `Withdraw ${withdrawAmount > 0 ? withdrawAmount.toFixed(2) : ''} USDT`}
            disabled={submitting || !toAddress || !amount || withdrawAmount <= 0}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default CryptoWithdraw;
