import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import { PhRadioButton } from "@/assets/icons/RadioButton";
import { gridGap, gridItemWidth, marginLeftRight } from "@/styles/styles";
import { PhPlus } from "@/assets/icons/Plus";
import { paymentMethods } from "@/constants/data";
import { router } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";

const PaymentMethods = () => {
  const [active, setActive] = useState(0);
  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 h-full">
      <PageTitle title="Payment Methods" isBgWhite={true} />
      <View
        className="flex flex-row flex-wrap"
        style={[marginLeftRight, gridGap(0.035)]}
      >
        {paymentMethods.map(({ id, name, img }, idx) => (
          <Pressable
            key={`${id}`}
            style={gridItemWidth(0.035, 2)}
            className={`border  flex flex-col justify-center items-center py-3 rounded-xl item ${
              active === idx ? "border-g300" : "border-n40 dark:border-darkN40"
            }`}
            onPress={() => setActive(idx)}
          >
            <View className="size-8 flex justify-center items-center rounded-full bg-bgColor dark:bg-darkG300">
              <Image source={img} />
            </View>
            <ThemedText className="pt-3 pb-5 dark:text-white" text={name} />

            <PhRadioButton
              color={idx === active ? "#328B64" : "#A6A6A6"}
              type={idx === active ? "fill" : ""}
              size="24px"
            />
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push("/AddNewCard")}
          style={gridItemWidth(0.035, 2)}
          className=" border border-n40 bg-bgColor dark:bg-darkN40 dark:border-darkN40 flex flex-col justify-center items-center py-8 rounded-xl"
        >
          <View className="size-8 flex justify-center items-center rounded-full bg-g300 ">
            <PhPlus color="white" />
          </View>
          <ThemedText
            className="pt-3 text-g300 "
            text="Add Card"
            weight="semiBold"
          />
        </Pressable>
      </View>
      <View style={marginLeftRight} className="pt-8">
        <PrimaryButton
          onPress={() => router.back()}
          text="Select Payment Method"
        />
      </View>
    </ScrollView>
  );
};

export default PaymentMethods;
