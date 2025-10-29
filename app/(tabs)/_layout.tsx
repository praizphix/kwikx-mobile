import ThemedText from "@/components/ThemedText";
import { tabDate } from "@/constants/data";
import { router, Slot } from "expo-router";
import React, { useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";

export default function ScreenLayout() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <View className="h-full">
      <Slot />
      <View className="absolute bottom-0 left-0 right-0 z-50">
        <View className="p-6 bg-g300 rounded-t-3xl flex-row justify-between items-center">
          {tabDate.map(({ id, name, icon, link }, idx) => (
            <View key={`${id}`}>
              {name ? (
                <TouchableOpacity
                  onPress={() => {
                    setActiveTab(idx);
                    router.push(link as any);
                  }}
                  className="flex flex-col gap-y-1 justify-center items-center"
                >
                  {React.createElement(icon, {
                    color: `${activeTab === idx ? "#FFB323" : "white"}`,
                    type: `${activeTab === idx ? "fill" : ""}`,
                    size: "30px",
                  })}
                  <ThemedText
                    className="text-xs text-white"
                    text={name}
                    weight="semiBold"
                  />
                </TouchableOpacity>
              ) : (
                <Pressable
                  onPress={() => router.push("/OpenCamera")}
                  className="flex justify-center items-center p-3.5 bg-o300 rounded-full"
                >
                  {React.createElement(icon, { color: "", size: "24px" })}
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
