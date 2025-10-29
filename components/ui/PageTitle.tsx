import { Pressable, View } from "react-native";
import React from "react";
import { PhCaretLeft } from "@/assets/icons/CaretLeft";
import ThemedText from "../ThemedText";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";

const PageTitle = ({
  title,
  isBgWhite,
}: {
  title: string;
  isBgWhite?: boolean;
}) => {
  const { colorScheme } = useColorScheme();
  return (
    <View className="px-6 flex-row justify-between items-center pb-8">
      <Pressable
        onPress={() => router.back()}
        className={`flex-row justify-center items-center  w-12 h-12 rounded-full text-2xl ${
          isBgWhite ? "bg-g300" : "bg-white"
        }`}
      >
        <PhCaretLeft color={isBgWhite ? "white" : "black"} size="20px" />
      </Pressable>
      <View className="flex-1 flex justify-center items-center pr-12">
        <ThemedText
          className={`text-2xl ${
            isBgWhite ? " dark:text-white" : "text-white"
          }`}
          text={title}
          weight="semiBold"
        />
      </View>
    </View>
  );
};

export default PageTitle;
