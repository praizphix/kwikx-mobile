import { View, Image, Pressable } from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";
import successImage from "@/assets/images/money-sent-successfully.png";
import { PhCheckCircle } from "@/assets/icons/CheckCircle";
import { CURRENCY_SYMBOLS } from "@/types/database";

const ExchangeSuccess = () => {
  const params = useLocalSearchParams();
  const { fromCurrency, toCurrency, fromAmount, toAmount, fee } = params;

  return (
    <View className="flex-1 bg-white dark:bg-n0">
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center mb-8">
          <View className="w-32 h-32 rounded-full bg-primary/10 items-center justify-center mb-6">
            <PhCheckCircle color="#0A5344" size="80px" type="fill" />
          </View>

          <ThemedText
            className="text-3xl dark:text-white mb-3 text-center"
            text="Exchange Successful!"
            weight="bold"
          />

          <ThemedText
            className="text-sm text-n500 dark:text-darkN500 text-center"
            text="Your currency exchange has been completed successfully"
          />
        </View>

        <View className="w-full bg-n20 dark:bg-darkN20 rounded-2xl p-6 mb-6">
          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="From"
            />
            <ThemedText
              className="text-lg dark:text-white"
              text={`${CURRENCY_SYMBOLS[fromCurrency as string]} ${parseFloat(fromAmount as string).toLocaleString()} ${fromCurrency}`}
              weight="semiBold"
            />
          </View>

          <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="To"
            />
            <ThemedText
              className="text-lg text-accent dark:text-white"
              text={`${CURRENCY_SYMBOLS[toCurrency as string]} ${parseFloat(toAmount as string).toLocaleString()} ${toCurrency}`}
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
              text={`${CURRENCY_SYMBOLS[fromCurrency as string]} ${parseFloat(fee as string).toLocaleString()}`}
            />
          </View>
        </View>

        <View className="w-full mb-6">
          <PrimaryButton
            onPress={() => router.push("/Home")}
            text="Back to Home"
          />
        </View>

        <Pressable onPress={() => router.push("/TransactionHistory")}>
          <ThemedText
            className="text-primary text-sm"
            text="View Transaction History"
            weight="semiBold"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default ExchangeSuccess;
