import { ScrollView, View } from "react-native";
import React from "react";
import ThemedText from "@/components/ThemedText";
import { marginLeftRight } from "@/styles/styles";
import PrimaryButton from "@/components/PrimaryButton";
import OtpInputField from "@/components/formField/OtpInputField";
import { router } from "expo-router";

const VerifyOTP = () => {
  return (
    <ScrollView className="h-full bg-white dark:bg-n0">
      <View className=" justify-center items-center text-center flex-col pt-4">
        <ThemedText
          className="text-2xl dark:text-white"
          text="Verify OTP"
          weight="semiBold"
        />
        <ThemedText
          className="tet-sm text-n500 dark:text-darkN500 pt-3 px-4 text-center"
          text="Reset your access effortlessly and regain control with our password recovery service."
        />
      </View>

      <View className="pt-8" style={marginLeftRight}>
        <OtpInputField disabled={false} />
      </View>

      <View className="flex-row justify-center items-center pt-3">
        <ThemedText
          className=" text-sm dark:text-white"
          text="Didn't receive email? "
        />
        <ThemedText
          className="text-g300 dark:text-p1 text-sm"
          text="Resend"
          weight="semiBold"
        />
      </View>

      <View className="pt-20" style={marginLeftRight}>
        <PrimaryButton
          text="Verify"
          onPress={() => router.push("/PasswordResetSuccessfully")}
        />
      </View>
    </ScrollView>
  );
};

export default VerifyOTP;
