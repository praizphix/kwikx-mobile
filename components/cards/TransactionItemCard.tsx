import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React from "react";
import ThemedText from "../ThemedText";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

type TransactionItemCard = {
  length: number;
  idx: number;
  icon?: React.ElementType;
  img?: ImageSourcePropType;
  name: string;
  time: string;
  amount: string;
  type: string;
  link: string;
};

const TransactionItemCard = ({
  length,
  idx,
  icon,
  img,
  name,
  time,
  amount,
  type,
  link,
}: TransactionItemCard) => {
  const { colorScheme } = useColorScheme();
  return (
    <Pressable
      className={`flex-row justify-between items-center   ${
        length === idx + 1
          ? ""
          : "border-b border-dashed border-n40 dark:border-darkN40 pb-4"
      }`}
      onPress={() => router.push(link as any)}
    >
      <View className="flex-row justify-start items-center gap-4">
        <View className="rounded-full bg-bgColor2 dark:bg-darkN40 justify-center items-center overflow-hidden size-[60px]">
          {icon ? (
            <View>
              {React.createElement(icon, {
                color: colorScheme === "dark" ? "white" : "",
                size: "36px",
              })}
            </View>
          ) : (
            <Image source={img} className="w-full h-full object-cover" />
          )}
        </View>
        <View className="">
          <ThemedText
            className=" dark:text-white"
            text={name}
            weight="semiBold"
          />
          <ThemedText
            className="text-n500 dark:text-darkN500 text-xs pt-2.5"
            text={time}
          />
        </View>
      </View>
      <View className="flex flex-col justify-end items-end">
        <ThemedText
          className=" pb-2 dark:text-white"
          text={`$${amount}`}
          weight="semiBold"
        />
        <ThemedText
          className={` text-xs py-0.5 px-2  rounded-md dark:bg-darkN40 ${
            type === "Incoming Request"
              ? "text-orange-500 bg-orange-200"
              : type === "Sent"
              ? "text-red-500 bg-red-200"
              : type === "Outgoing Request"
              ? "text-purple-500 bg-purple-200"
              : type === "Withdraw"
              ? "text-yellow-700 bg-yellow-200"
              : type === "Received"
              ? "text-g300 bg-bgColor"
              : "bg-n40 dark:bg-darkN40 dark:text-white"
          }`}
          text={type}
        />
      </View>
    </Pressable>
  );
};

export default TransactionItemCard;
