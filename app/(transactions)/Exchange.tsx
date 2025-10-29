import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import ThemedText from "@/components/ThemedText";
import { PhArrowLeft } from "@/assets/icons/ArrowRight";
import { PhSwap } from "@/assets/icons/Swap";
import PrimaryButton from "@/components/PrimaryButton";
import { createQuote, getActiveExchangeRate } from "@/services/quotes";
import { getCurrentUser } from "@/services/auth";
import type { Currency, ExchangeRate } from "@/types/database";
import { CURRENCY_SYMBOLS } from "@/types/database";

const Exchange = () => {
  const [fromCurrency, setFromCurrency] = useState<Currency>("CFA");
  const [toCurrency, setToCurrency] = useState<Currency>("NGN");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
  }, [fromCurrency, toCurrency]);

  const fetchExchangeRate = async () => {
    if (fromCurrency === toCurrency) return;

    setLoadingRate(true);
    try {
      const exchangeRate = await getActiveExchangeRate(fromCurrency, toCurrency);
      setRate(exchangeRate);
    } catch (error) {
      console.error("Failed to fetch rate:", error);
      Alert.alert("Error", "Failed to load exchange rate");
    } finally {
      setLoadingRate(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleGetQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert("Same Currency", "Please select different currencies");
      return;
    }

    setLoading(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Not Authenticated", "Please sign in to continue");
        router.push("/SignIn");
        return;
      }

      if (!rate) {
        Alert.alert("Error", "Exchange rate not available");
        return;
      }

      const fromAmount = parseFloat(amount);
      const feeFlat = rate.fee_flat;
      const feePercentage = rate.fee_percentage;
      const totalFee = feeFlat + (fromAmount * feePercentage);
      const toAmount = (fromAmount - totalFee) * rate.rate;

      const quote = await createQuote(
        user.id,
        rate.id,
        fromCurrency,
        toCurrency,
        fromAmount,
        rate.rate,
        feeFlat,
        feePercentage,
        totalFee,
        toAmount,
        rate.quote_ttl_seconds
      );

      router.push({
        pathname: "/(transactions)/ExchangeQuote",
        params: {
          quote: JSON.stringify(quote),
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create quote");
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = () => {
    if (!rate || !amount || parseFloat(amount) <= 0) return "0";

    const amountNum = parseFloat(amount);
    const totalFee = rate.fee_flat + (amountNum * rate.fee_percentage);
    const grossAmount = amountNum * rate.rate;
    const netAmount = grossAmount - totalFee;

    return netAmount > 0 ? netAmount.toFixed(2) : "0";
  };

  return (
    <View className="flex-1">
      <ScrollView className="bg-bgColor dark:bg-darkG300">
        <View className="px-6 flex-row justify-between items-center pt-6 pb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <PhArrowLeft color="#0A5344" size="24px" />
          </Pressable>
          <ThemedText
            className="text-2xl dark:text-white"
            text="Exchange"
            weight="semiBold"
          />
          <View className="w-8" />
        </View>

        <View className="bg-white rounded-t-3xl pt-8 px-6 flex-1 pb-32 dark:bg-n0">
          <ThemedText
            className="text-lg dark:text-white mb-6"
            text="Select Currencies"
            weight="semiBold"
          />

          <View className="mb-6">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="From Currency"
            />
            <View className="flex-row gap-3">
              {(["CFA", "NGN", "USDT"] as Currency[]).map((currency) => (
                <Pressable
                  key={currency}
                  onPress={() => setFromCurrency(currency)}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    fromCurrency === currency
                      ? "border-primary bg-primary/10"
                      : "border-n40 dark:border-darkN40"
                  }`}
                >
                  <ThemedText
                    className={`text-center ${
                      fromCurrency === currency
                        ? "text-primary"
                        : "text-n500 dark:text-darkN500"
                    }`}
                    text={currency}
                    weight="semiBold"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable onPress={handleSwapCurrencies} className="items-center py-3">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
              <PhSwap color="#0A5344" size="20px" />
            </View>
          </Pressable>

          <View className="mb-6">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="To Currency"
            />
            <View className="flex-row gap-3">
              {(["CFA", "NGN", "USDT"] as Currency[]).map((currency) => (
                <Pressable
                  key={currency}
                  onPress={() => setToCurrency(currency)}
                  className={`flex-1 py-3 rounded-xl border-2 ${
                    toCurrency === currency
                      ? "border-primary bg-primary/10"
                      : "border-n40 dark:border-darkN40"
                  }`}
                >
                  <ThemedText
                    className={`text-center ${
                      toCurrency === currency
                        ? "text-primary"
                        : "text-n500 dark:text-darkN500"
                    }`}
                    text={currency}
                    weight="semiBold"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="bg-n20 dark:bg-darkN20 rounded-2xl p-4 mb-6">
            {loadingRate ? (
              <ActivityIndicator color="#0A5344" />
            ) : rate ? (
              <>
                <View className="flex-row justify-between items-center mb-2">
                  <ThemedText
                    className="text-sm text-n500 dark:text-darkN500"
                    text="Exchange Rate"
                  />
                  <ThemedText
                    className="text-lg text-primary dark:text-white"
                    text={`1 ${fromCurrency} = ${rate.rate} ${toCurrency}`}
                    weight="semiBold"
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <ThemedText
                    className="text-sm text-n500 dark:text-darkN500"
                    text="Fee"
                  />
                  <ThemedText
                    className="text-sm dark:text-white"
                    text={`${rate.fee_flat} + ${(rate.fee_percentage * 100).toFixed(2)}%`}
                  />
                </View>
              </>
            ) : (
              <ThemedText
                className="text-center text-n500 dark:text-darkN500"
                text="No rate available for this pair"
              />
            )}
          </View>

          <View className="mb-6">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="Amount to Exchange"
            />
            <View className="bg-n20 dark:bg-darkN20 rounded-xl p-4 border-2 border-n40 dark:border-darkN40">
              <TextInput
                className="text-2xl dark:text-white text-center font-bold"
                placeholder="0"
                placeholderTextColor="#A6A6A6"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {amount && parseFloat(amount) > 0 && rate && (
            <View className="bg-accent/10 rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between items-center">
                <ThemedText
                  className="text-sm text-n500 dark:text-darkN500"
                  text="You will receive approximately"
                />
                <ThemedText
                  className="text-lg text-primary dark:text-white"
                  text={`${CURRENCY_SYMBOLS[toCurrency]} ${calculateEstimate()}`}
                  weight="bold"
                />
              </View>
            </View>
          )}

          <View className="mb-6">
            <PrimaryButton
              onPress={handleGetQuote}
              text={loading ? "Loading..." : "Get Quote"}
              disabled={loading || !rate || !amount || parseFloat(amount) <= 0}
            />
          </View>

          <View className="bg-accent/10 rounded-xl p-4">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 text-center"
              text="You will receive a live quote valid for 120 seconds. The rate will be locked during this time."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Exchange;
