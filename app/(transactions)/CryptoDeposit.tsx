import { View, ScrollView, Alert, ActivityIndicator, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";
import { getCurrentUser } from "@/services/auth";
import { generateDepositAddress, getCryptoAddress, syncCryptoBalance } from "@/services/crypto";
import { router } from "expo-router";
import { Copy } from "@/assets/icons/Copy";
import { useColorScheme } from "nativewind";
import * as Clipboard from 'expo-clipboard';

const CryptoDeposit = () => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    loadDepositAddress();
  }, []);

  const loadDepositAddress = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/SignIn");
        return;
      }
      setUserId(user.id);

      const existingAddress = await getCryptoAddress(user.id);
      if (existingAddress) {
        setDepositAddress(existingAddress.address);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load deposit address");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAddress = async () => {
    if (generating) return;

    setGenerating(true);
    try {
      const depositInfo = await generateDepositAddress(userId);
      setDepositAddress(depositInfo.address);
      Alert.alert(
        "Address Generated",
        "Your USDT deposit address has been created. You can now receive USDT on the TRON network (TRC20)."
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to generate deposit address");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!depositAddress) return;

    await Clipboard.setStringAsync(depositAddress);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  const handleSyncBalance = async () => {
    if (syncing) return;

    setSyncing(true);
    try {
      const balance = await syncCryptoBalance(userId);
      Alert.alert(
        "Balance Synced",
        `Your USDT balance has been updated: ${balance.toFixed(2)} USDT`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to sync balance");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-n900">
        <ActivityIndicator size="large" color="#0A5344" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Deposit USDT" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-6 py-6">
        {/* Information Banner */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <ThemedText className="text-blue-800 dark:text-blue-200 text-sm mb-2" weight="bold">
            How to Deposit USDT
          </ThemedText>
          <ThemedText className="text-blue-700 dark:text-blue-300 text-xs">
            • Send USDT only on TRON network (TRC20){'\n'}
            • Do not send other tokens to this address{'\n'}
            • Minimum deposit: 1 USDT{'\n'}
            • Deposits appear after 19 confirmations (~1 minute)
          </ThemedText>
        </View>

        {!depositAddress ? (
          /* Generate Address Section */
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
              <ThemedText className="text-4xl">💰</ThemedText>
            </View>

            <ThemedText className="text-xl text-center text-n800 dark:text-white mb-2" weight="bold">
              No Deposit Address Yet
            </ThemedText>

            <ThemedText className="text-center text-n600 dark:text-darkN600 mb-6 px-4">
              Generate your unique USDT deposit address to start receiving cryptocurrency
            </ThemedText>

            <PrimaryButton
              onPress={handleGenerateAddress}
              text={generating ? "Generating..." : "Generate Deposit Address"}
              disabled={generating}
            />
          </View>
        ) : (
          /* Display Address Section */
          <>
            <View>
              <ThemedText className="text-n800 dark:text-white mb-2" weight="bold">
                Your USDT Deposit Address
              </ThemedText>
              <ThemedText className="text-xs text-n600 dark:text-darkN600 mb-3">
                TRON Network (TRC20)
              </ThemedText>

              {/* Address Display */}
              <View className="bg-n100 dark:bg-darkN100 p-4 rounded-xl mb-3">
                <ThemedText className="text-n800 dark:text-white text-sm break-all" weight="medium">
                  {depositAddress}
                </ThemedText>
              </View>

              {/* Copy Button */}
              <Pressable
                onPress={handleCopyAddress}
                className="bg-primary py-3 px-4 rounded-xl flex-row items-center justify-center"
              >
                <Copy color="white" size={20} />
                <ThemedText className="text-white ml-2" weight="semiBold">
                  Copy Address
                </ThemedText>
              </Pressable>
            </View>

            {/* QR Code Section (Future Enhancement) */}
            <View className="items-center py-6">
              <View className="w-48 h-48 bg-n100 dark:bg-darkN100 rounded-xl items-center justify-center mb-3">
                <ThemedText className="text-n500 dark:text-darkN500 text-center px-4">
                  QR Code{'\n'}Coming Soon
                </ThemedText>
              </View>
              <ThemedText className="text-xs text-n600 dark:text-darkN600 text-center">
                Scan this QR code to deposit USDT
              </ThemedText>
            </View>

            {/* Sync Balance Button */}
            <View>
              <PrimaryButton
                onPress={handleSyncBalance}
                text={syncing ? "Syncing..." : "Sync Balance"}
                disabled={syncing}
              />
              <ThemedText className="text-xs text-n600 dark:text-darkN600 text-center mt-2">
                Click to check for new deposits
              </ThemedText>
            </View>

            {/* Important Notes */}
            <View className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl">
              <ThemedText className="text-yellow-800 dark:text-yellow-200 text-sm mb-2" weight="bold">
                ⚠️ Important
              </ThemedText>
              <ThemedText className="text-yellow-700 dark:text-yellow-300 text-xs">
                • Only send USDT on TRON (TRC20) network{'\n'}
                • Sending other networks will result in loss of funds{'\n'}
                • Double-check the address before sending{'\n'}
                • Keep your address secure and private
              </ThemedText>
            </View>

            {/* Transaction History Link */}
            <Pressable
              onPress={() => router.push("/TransactionHistory")}
              className="bg-n100 dark:bg-darkN100 py-4 rounded-xl items-center"
            >
              <ThemedText className="text-primary dark:text-accent" weight="semiBold">
                View Transaction History
              </ThemedText>
            </Pressable>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default CryptoDeposit;
