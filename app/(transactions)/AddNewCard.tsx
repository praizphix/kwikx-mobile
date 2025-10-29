import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import newCardImg from "@/assets/images/new-card.png";
import FormField from "@/components/formField/FormField";
import { marginLeftRight } from "@/styles/styles";
import { PhCheck } from "@/assets/icons/Check";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";

const AddNewCard = () => {
  const [checked, setChecked] = useState(false);
  return (
    <ScrollView className="bg-white dark:bg-n0  pt-4">
      <PageTitle title="Add New Card" isBgWhite={true} />
      <View className=" justify-center items-center -mt-4">
        <Image source={newCardImg} />
      </View>
      <View className=" flex-col gap-y-4" style={marginLeftRight}>
        <FormField
          isTitle={true}
          placeholder="Your Name"
          title="Card Holder Name"
        />
        <FormField isTitle={true} placeholder="**** 2564" title="Card number" />
        <View className="flex-row justify-center items-center gap-4">
          <View className="flex-1">
            <FormField
              isTitle={true}
              placeholder="DD.MM.YYY"
              title="Exp Date"
            />
          </View>
          <View className="flex-1">
            <FormField isTitle={true} placeholder="****" title="CVV Code" />
          </View>
        </View>
        <FormField isTitle={true} placeholder="Singapore" title="Country" />
        <View>
          <Pressable
            onPress={() => setChecked((prev) => !prev)}
            className=" flex-row gap-x-3 justify-start items-center"
          >
            <View
              className={`border  w-6 h-6 rounded-md justify-center items-center     ${
                checked
                  ? "bg-g300 border-g300"
                  : "border-n40 dark:border-darkN40"
              }`}
            >
              {checked && (
                <PhCheck
                  color={checked ? "white" : ""}
                  type="bold"
                  size="14px"
                />
              )}
            </View>
            <ThemedText
              className="text-sm dark:text-white"
              text="Remember Password"
              weight="medium"
            />
          </Pressable>
        </View>
      </View>
      <View className="px-6 pb-8 pt-4">
        <PrimaryButton onPress={() => {}} text="Save" />
      </View>
    </ScrollView>
  );
};

export default AddNewCard;
