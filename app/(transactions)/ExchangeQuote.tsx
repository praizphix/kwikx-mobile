import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import ThemedText from "@/components/ThemedText";
import { PhArrowLeft } from "@/assets/icons/ArrowRight";
import { PhSwap } from "@/assets/icons/Swap";
import PrimaryButton from "@/components/PrimaryButton";
import type { Quote } from "@/types/database";
import { getQuoteTimeRemaining } from "@/services/quotes";
import { CURRENCY_SYMBOLS } from "@/types/database";

const ExchangeQuote = () => {
  const params = useLocalSearchParams();
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [executing, setExecuting] = useState(false);

  const quote = params.quote ? JSON.parse(params.quote as string) as Quote : null;

  useEffect(() => {
    if (!quote) return;

    const interval = setInterval(() => {
      const remaining = getQuoteTimeRemaining(quote);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        router.back();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote]);

  const handleExecute = async () => {
    if (!quote) return;

    setExecuting(true);
    try {
      // TODO: Execute the exchange via API
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push({
        pathname: "/(transactions)/ExchangeSuccess",
        params: {
          fromCurrency: quote.from_currency,
          toCurrency: quote.to_currency,
          fromAmount: quote.from_amount.toString(),
          toAmount: quote.to_amount.toString(),
          fee: quote.total_fee.toString(),
        },
      });
    } catch (error) {
      console.error("Exchange failed:", error);
      setExecuting(false);
    }
  };

  if (!quote) {
    return (
      <View className="flex-1 bg-white dark:bg-n0 items-center justify-center">
        <ThemedText text="Invalid quote" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="bg-bgColor dark:bg-darkG300">
        <View className="px-6 flex-row justify-between items-center pt-6 pb-4">
          <Pressable onPress={() => router.back()} className="p-2">
            <PhArrowLeft color="#0A5344" size="24px" />
          </Pressable>
          <ThemedText
            className="text-2xl dark:text-white"
            text="Confirm Exchange"
            weight="semiBold"
          />
          <View className="w-8" />
        </View>

        <View className="bg-white rounded-t-3xl pt-8 px-6 flex-1 pb-32 dark:bg-n0">
          <View className="bg-accent/10 rounded-2xl p-4 mb-6 items-center">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="Quote expires in"
            />
            <View className={`${timeRemaining <= 30 ? "bg-red-500" : "bg-primary"} px-6 py-2 rounded-full`}>
              <ThemedText
                className="text-3xl text-white"
                text={`${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, "0")}`}
                weight="bold"
              />
            </View>
          </View>

          <View className="bg-n20 dark:bg-darkN20 rounded-2xl p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="You Send"
              />
              <ThemedText
                className="text-2xl text-primary dark:text-white"
                text={`${CURRENCY_SYMBOLS[quote.from_currency]} ${quote.from_amount.toLocaleString()}`}
                weight="bold"
              />
            </View>

            <View className="items-center py-3">
              <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                <PhSwap color="#0A5344" size="20px" />
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="You Receive"
              />
              <ThemedText
                className="text-2xl text-accent dark:text-white"
                text={`${CURRENCY_SYMBOLS[quote.to_currency]} ${quote.to_amount.toLocaleString()}`}
                weight="bold"
              />
            </View>
          </View>

          <View className="bg-n20 dark:bg-darkN20 rounded-2xl p-4 mb-6">
            <ThemedText
              className="text-lg dark:text-white mb-4"
              text="Exchange Details"
              weight="semiBold"
            />

            <View className="flex-row justify-between items-center mb-3">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="Exchange Rate"
              />
              <ThemedText
                className="text-sm dark:text-white"
                text={`1 ${quote.from_currency} = ${quote.exchange_rate} ${quote.to_currency}`}
                weight="medium"
              />
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="Flat Fee"
              />
              <ThemedText
                className="text-sm dark:text-white"
                text={`${CURRENCY_SYMBOLS[quote.from_currency]} ${quote.fee_flat}`}
              />
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="Percentage Fee"
              />
              <ThemedText
                className="text-sm dark:text-white"
                text={`${(quote.fee_percentage * 100).toFixed(2)}%`}
              />
            </View>

            <View className="border-t border-n40 dark:border-darkN40 pt-3 mt-3">
              <View className="flex-row justify-between items-center">
                <ThemedText
                  className="text-sm text-n500 dark:text-darkN500"
                  text="Total Fee"
                  weight="semiBold"
                />
                <ThemedText
                  className="text-sm dark:text-white"
                  text={`${CURRENCY_SYMBOLS[quote.from_currency]} ${quote.total_fee.toLocaleString()}`}
                  weight="semiBold"
                />
              </View>
            </View>
          </View>

          <View className="mb-6">
            <PrimaryButton
              onPress={handleExecute}
              text={executing ? "Processing..." : "Confirm Exchange"}
              disabled={executing || timeRemaining <= 0}
            />
          </View>

          {executing && (
            <View className="items-center mb-6">
              <ActivityIndicator size="large" color="#0A5344" />
            </View>
          )}

          <View className="bg-accent/10 rounded-xl p-4">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 text-center"
              text="This rate is locked for the duration shown above. After expiration, you'll need to request a new quote."
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ExchangeQuote;
