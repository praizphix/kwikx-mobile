import { Image, ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { PhCheck } from "@/assets/icons/Check";
import ThemedText from "@/components/ThemedText";
import border from "@/assets/images/check-border.png";
import PrimaryButton from "@/components/PrimaryButton";
import { PhCopy } from "@/assets/icons/Copy";
import { router } from "expo-router";

const BillPaySuccessfully = () => {
  return (
    <ScrollView className="bg-g300 dark:bg-darkG300  pt-6 min-h-dvh">
      <PageTitle title="Bill Pay Successfully" />

      <View className=" justify-center items-center pt-9 -mb-14 z-10">
        <View className="bg-g300 rounded-full p-2">
          <View className="flex justify-center items-center bg-white dark:bg-darkN40 h-[108px] w-[108px] rounded-full">
            <Image
              source={border}
              className="absolute top-0 left-0 right-0 bottom-0 "
            />
            <PhCheck color="#FFB323" size="52px" />
          </View>
        </View>
      </View>
      <View className="bg-white py-7 px-6 rounded-t-3xl dark:bg-n0">
        <View className="flex-row justify-between items-start">
          <View className="">
            <ThemedText
              className="text-xs font-medium dark:text-white"
              text="Transaction ID"
              weight="medium"
            />
            <ThemedText
              className="text-xs text-n500 pt-1 dark:text-darkN500"
              text="24122023"
            />
          </View>
          <ThemedText
            className="text-green-500 text-xs py-1 px-3 bg-green-100 rounded-md dark:bg-darkN40"
            text="Accepted"
          />
        </View>
        <View className="flex flex-col justify-center items-center text-center gap-1 pb-7">
          <ThemedText
            className="text-2xl pt-6 dark:text-white"
            text="NexGen Solution Inc"
            weight="semiBold"
          />
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500"
            text="Gas Bill"
          />
        </View>
        <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 rounded-2xl">
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Status"
            />
            <ThemedText
              className="text-sm font-medium text-g300"
              text="Completed"
              weight="medium"
            />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Category"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="Housing"
              weight="medium"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Notes"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="Gas Bill"
            />
          </View>
        </View>
        <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 rounded-2xl mt-6">
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Account"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="MasterCard"
              weight="medium"
            />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Total paid amount"
            />
            <ThemedText className="text-sm dark:text-white" text="$200.000" />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Transaction cost"
            />
            <View className="flex-row">
              <ThemedText className="text-sm dark:text-white" text="-$10.000" />
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Discount"
            />
            <View className="flex-row">
              <ThemedText className="text-sm dark:text-white" text="-$5.000" />

              <PhCopy color="" />
            </View>
          </View>
        </View>
        <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 rounded-2xl mt-6">
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Date"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="Aug 17, 2025"
              weight="medium"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Time"
            />
            <View className="flex-row">
              <ThemedText className="text-sm dark:text-white" text="9.53 PM" />
            </View>
          </View>
        </View>
        <View className="pt-6 pb-12">
          <PrimaryButton
            onPress={() => router.push("/MoneyReceipt")}
            text="View Receipt"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default BillPaySuccessfully;
