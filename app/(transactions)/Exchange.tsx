import { View, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import ThemedText from "@/components/ThemedText";
import { PhArrowLeft } from "@/assets/icons/ArrowRight";
import { PhSwap } from "@/assets/icons/Swap";
import PrimaryButton from "@/components/PrimaryButton";

const Exchange = () => {
  const [fromCurrency, setFromCurrency] = useState("CFA");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");

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
              {["CFA", "NGN", "USDT"].map((currency) => (
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

          <View className="items-center py-3">
            <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
              <PhSwap color="#0A5344" size="20px" />
            </View>
          </View>

          <View className="mb-6">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="To Currency"
            />
            <View className="flex-row gap-3">
              {["CFA", "NGN", "USDT"].map((currency) => (
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
            <View className="flex-row justify-between items-center mb-2">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text="Exchange Rate"
              />
              <ThemedText
                className="text-lg text-primary dark:text-white"
                text="1 CFA = 2.50 NGN"
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
                text="50 + 0.5%"
              />
            </View>
          </View>

          <View className="mb-8">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 mb-2"
              text="Amount"
            />
            <View className="bg-n20 dark:bg-darkN20 rounded-xl p-4">
              <ThemedText
                className="text-2xl dark:text-white text-center"
                text={amount || "0"}
                weight="bold"
              />
            </View>
          </View>

          <View className="mb-6">
            <PrimaryButton
              onPress={() => console.log("Get quote")}
              text="Get Quote"
            />
          </View>

          <View className="bg-accent/10 rounded-xl p-4">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 text-center"
              text="You will receive a live quote valid for 120 seconds"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Exchange;
