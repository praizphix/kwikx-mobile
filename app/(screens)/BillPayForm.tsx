import { Pressable, ScrollView, TextInput, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { router } from "expo-router";
import ThemedText from "@/components/ThemedText";
import { PhCaretRight } from "@/assets/icons/CaretRight";
import { PhInfo } from "@/assets/icons/Info";
import { marginLeftRight } from "@/styles/styles";
import PrimaryButton from "@/components/PrimaryButton";

const BillPayForm = () => {
  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 h-full">
      <PageTitle title="Gas Bill Pay" isBgWhite={true} />

      <View className="px-6 flex flex-col gap-y-4">
        
        <Pressable
          onPress={() => router.push("/PaymentMethods")}
          className="flex flex-col justify-start"
        >
          <ThemedText
            className="text-sm pb-2 dark:text-white"
            text="Select Payment Method"
            weight="semiBold"
          />
          <View className="p-4 bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex-row justify-between items-center rounded-xl">
            <ThemedText
              className="text-n90 text-sm dark:text-white"
              text="Select payment method"
            />

            <PhCaretRight color="#898989" size="18px" />
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push("/")}
          className="flex flex-col justify-start"
        >
          <ThemedText
            className="text-sm pb-2 dark:text-white"
            text="Write a note"
            weight="semiBold"
          />
          <View className="px-4 py-1 bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40  rounded-xl">
            <TextInput
              placeholder="Input text here..."
              placeholderTextColor="#898989"
              className="text-n90 text-sm dark:text-white "
              style={{
                height: 100,
                textAlignVertical: "top",
              }}
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push("/")}
          className="flex flex-col justify-start"
        >
          <ThemedText
            className="text-sm pb-2 dark:text-white"
            text="Enter number"
            weight="semiBold"
          />
          <View className="px-4 py-1 bg-white border border-n40 dark:bg-darkN20 dark:border-darkN40  rounded-xl">
            <TextInput
              placeholder="|"
              placeholderTextColor="black"
              className=" text-[52px] dark:text-white font-bold "
              numberOfLines={1}
            />
          </View>
        </Pressable>
      </View>
      <View
        className="flex-row justify-between items-center pt-2"
        style={marginLeftRight}
      >
        <View className="flex-row justify-start items-center gap-2">
          <ThemedText
            className="text-n500 text-sm dark:text-darkN500 "
            text="Bank Fee"
            weight="semiBold"
          />
          <PhInfo color="#328B64" size="20px" />
        </View>
        <ThemedText
          className="text-n500 text-sm dark:text-darkN500"
          text="$ 2.00"
        />
      </View>

      <View className="pt-8" style={marginLeftRight}>
        <PrimaryButton
          onPress={() => router.push("/BillPaySuccessfully")}
          text="Pay Money"
        />
      </View>
    </ScrollView>
  );
};

export default BillPayForm;
