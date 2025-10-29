import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ThemedText from "@/components/ThemedText";
import illus from "@/assets/images/money-sent-successfully.png";
import CircleBg from "@/components/ui/CircleBg";
import { PhCopy } from "@/assets/icons/Copy";
import PrimaryButton from "@/components/PrimaryButton";
import { marginLeftRight } from "@/styles/styles";
import { router } from "expo-router";

const SIZE = 120;
const RequestMoneySuccessfull = () => {
  return (
    <ScrollView className="dark:bg-n0">
      <View className="w-full justify-center items-center pt-28 ">
        <View
          style={[
            styles.dot,
            {
              backgroundColor: "#328B64",
            },
          ]}
          className=" items-center justify-center"
        >
          <Image source={illus} style={{ zIndex: 100 }} />

          {[...Array(3).keys()].map((_, idx) => (
            <CircleBg key={idx} index={idx} />
          ))}
        </View>
      </View>
      <View className="flex flex-col justify-center items-center text-center pt-12 pb-6">
        <ThemedText
          className="text-2xl dark:text-white"
          text="Request Successful!"
          weight="semiBold"
        />
        <ThemedText
          className="text-sm  pt-3 dark:text-white"
          text="Jenny Wilson"
          weight="semiBold"
        />
        <ThemedText
          className="text-sm text-n500 dark:text-darkN500 pt-2"
          text="Your request has been processed."
        />

        <ThemedText
          className="pt-6 text-[52px] dark:text-white "
          text="$125.00"
          weight="extraBold"
        />
      </View>
      <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 mx-6 rounded-2xl">
        <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="You requested"
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

      <View
        className="py-8 flex-row justify-between items-center gap-x-2"
        style={marginLeftRight}
      >
        <PrimaryButton
          onPress={() => router.push("/MoneyReceipt")}
          text="Donwload Receipt"
          isSecondary={true}
        />
        <PrimaryButton onPress={() => {}} text="Share Receipt" />
      </View>
    </ScrollView>
  );
};

export default RequestMoneySuccessfull;

const styles = StyleSheet.create({
  dot: {
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE / 2,
  },
});
