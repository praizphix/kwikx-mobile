import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { PhMagnifyingGlass } from "@/assets/icons/MagnifyingGlass";
import { PhMicrophone } from "@/assets/icons/Microphone";
import { PhSlidersHorizontal } from "@/assets/icons/SlidersHorizontal";
import { useColorScheme } from "nativewind";

const SearchBox = () => {
  const { colorScheme } = useColorScheme();
  return (
    <View className=" flex-row justify-start items-center gap-x-2 px-6">
      <View className="flex-row justify-between items-center flex-1 border border-n40 rounded-xl px-3 gap-x-2 dark:border-darkN40 dark:bg-darkN20">
        <View className="">
          <PhMagnifyingGlass color="#A6A6A6" />
        </View>

        <TextInput
          placeholder="Search here..."
          className="flex-1 dark:text-white py-3.5"
          numberOfLines={1}
          placeholderTextColor={colorScheme === "dark" ? "#ffff" : "#14141466"}
        />

        <PhMicrophone color="#A6A6A6" />
      </View>
      <Pressable className="p-3 bg-g300 rounded-md  flex-row justify-center items-center">
        <PhSlidersHorizontal color="white" size="24px" />
      </Pressable>
    </View>
  );
};

export default SearchBox;
