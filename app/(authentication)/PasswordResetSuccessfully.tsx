import { StyleSheet, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import PrimaryButton from "@/components/PrimaryButton";
import ThemedText from "@/components/ThemedText";
import { Feather } from "@expo/vector-icons";
import CircleBg from "@/components/ui/CircleBg";

const SIZE = 100;

const PasswordResetSuccessfully = () => {
  return (
    <View className="bg-white h-full justify-center items-center dark:bg-n0">
      <View className=" justify-center items-center ">
        <View className="w-full justify-center px-6 mb-16 items-center ">
          <View
            style={[
              styles.dot,
              {
                backgroundColor: "#328B64",
              },
            ]}
            className=" items-center justify-center"
          >
            <Feather
              name="check"
              size={48}
              color="white"
              style={{ zIndex: 100 }}
            />

            {[...Array(3).keys()].map((_, idx) => (
              <CircleBg key={idx} index={idx} />
            ))}
          </View>

          <View className="pt-16">
            <ThemedText
              className="text-2xl text-g300 text-center"
              text="Reset Successfully!"
              weight="semiBold"
            />
            <ThemedText
              className="text-[14px] text-n500 pt-3 px-4 text-center dark:text-darkN500"
              text="Your password has been successfully updated. Sing in now."
            />
          </View>
        </View>
      </View>
      <View className="absolute bottom-8 left-6 right-6">
        <PrimaryButton onPress={() => router.push("/SignIn")} text="Sign In" />
      </View>
    </View>
  );
};

export default PasswordResetSuccessfully;

const styles = StyleSheet.create({
  dot: {
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE / 2,
  },
});
