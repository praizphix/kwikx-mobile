import { Image, Pressable, ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import { gridGap, gridItemWidth, marginLeftRight } from "@/styles/styles";
import { paybillItems } from "@/constants/data";
import payBillIllus from "@/assets/images/pay-bill-illus.png";
import { router } from "expo-router";

const BillPay = () => {
  return (
    <ScrollView className="bg-g300 dark:bg-darkG300  pt-6 min-h-dvh">
      <PageTitle title="Bill Pay" />

      <View className="bg-white py-7 rounded-t-3xl dark:bg-n0">
        <View
          className="flex-row flex-wrap gap-y-4"
          style={[marginLeftRight, gridGap(0.035)]}
        >
          {paybillItems.map(({ id, name, icon }) => (
            <Pressable
            onPress={()=> router.push("/BillPayForm")}
              key={`${id}`}
              style={gridItemWidth(0.035, 2)}
              className=" border border-n40 dark:border-darkN40 flex flex-col justify-center items-center py-7 rounded-2xl"
            >
              <View className="size-12 flex justify-center items-center rounded-full  bg-bgColor border border-bgColor2 ">
                <Image source={icon} />
              </View>
              <ThemedText className="pt-3  " text={name} weight="semiBold" />
            </Pressable>
          ))}
        </View>

        <View className="px-6 py-6">
          <View className="bg-g300 rounded-2xl py-5 px-6 flex-row justify-between items-center">
            <View className="w-1/2">
              <ThemedText
                className="text-white text-xl "
                text="Pay Your Bill Uitility Packages"
                weight="semiBold"
              />

              <ThemedText
                className="text-white text-xs py-1.5"
                text="Featured Special From $320"
              />
            </View>
            <View className="">
              <Image source={payBillIllus} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default BillPay;
