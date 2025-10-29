import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ThemedText from "@/components/ThemedText";
import PageTitle from "@/components/ui/PageTitle";
import { PhCopy } from "@/assets/icons/Copy";
import PrimaryButton from "@/components/PrimaryButton";
import { marginLeftRight } from "@/styles/styles";
import { PhDownloadSimple } from "@/assets/icons/DownloadSimple";
import { router } from "expo-router";

const MoneyTopUp = () => {
  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 h-full">
      <PageTitle title="Money Top Up" isBgWhite={true} />
      <View className="pb-8 flex justify-center items-center flex-col">
        <View className="rounded-full overflow-hidden bg-g300 size-[140px] flex justify-center items-center">
          <PhDownloadSimple color="white" size="80px" />
        </View>
        <View className="flex-row">
          <ThemedText
            className="text-[52px] font-bold flex justify-start pt-2 dark:text-white"
            text="$125.00"
            weight="bold"
          />
          <ThemedText
            className="text-xl text-g300 pt-4"
            text="$"
            weight="bold"
          />
        </View>

        <ThemedText
          className="text-sm  pt-3 dark:text-white"
          text="You sent to Kristin Watson"
          weight="semiBold"
        />
        <ThemedText
          className="text-sm text-n500 dark:text-darkN500 pt-2"
          text="michael.mitc@example.com"
        />
      </View>
      <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 mx-6 rounded-2xl">
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Top Up"
          />
          <ThemedText
            className="text-sm font-medium text-g300"
            text="$125.00"
            weight="medium"
          />
        </View>
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="To"
          />
          <ThemedText
            className="text-sm dark:text-white"
            text="Kristin Watson"
          />
        </View>

        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Email"
          />
          <ThemedText
            className="text-sm dark:text-white"
            text="clinton.mcclure@gmail.com"
          />
        </View>
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Payment method"
          />
          <ThemedText className="text-sm dark:text-white" text="MasterCard" />
        </View>
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Date"
          />
          <ThemedText
            className="text-sm dark:text-white"
            text="Dec 24, 2023 09:40 AM"
          />
        </View>

        <View className="flex-row justify-between items-center">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Reference ID"
          />
          <View className="flex-row">
            <ThemedText className="text-sm dark:text-white" text="H37SK7D9" />

            <PhCopy color="" />
          </View>
        </View>
      </View>
      <View className="pt-4 px-6">
        <View className="bg-bgColor border border-bgColor2 rounded-2xl p-4 dark:bg-darkN20 dark:border-darkN40">
          <ThemedText
            className="text-sm pb-4 border-b border-dashed border-n40 dark:border-darkN40 dark:text-white"
            text="Notes :"
            weight="medium"
          />

          <ThemedText
            className="text-n500 dark:text-darkN500 text-sm pt-4"
            text="Hi Jenny Wilson, now i send you $125, P/S: try your best"
          />
        </View>
      </View>
      <View className="pt-6 pb-12" style={marginLeftRight}>
        <PrimaryButton
          onPress={() => router.push("/MoneyReceipt")}
          text="View Receipt"
        />
      </View>
    </ScrollView>
  );
};

export default MoneyTopUp;

const styles = StyleSheet.create({});
