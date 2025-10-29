import { ScrollView, View } from "react-native";
import React from "react";
import ThemedText from "@/components/ThemedText";
import FormField from "@/components/formField/FormField";
import { marginLeftRight } from "@/styles/styles";
import PrimaryButton from "@/components/PrimaryButton";
import { router } from "expo-router";

const ForgotPassword = () => {
  return (
    <ScrollView className="h-full bg-white dark:bg-n0">
      <View className=" justify-center items-center text-center flex-col pt-4">
        <ThemedText
          className="text-2xl dark:text-white"
          text="Forgot Password"
          weight="semiBold"
        />
        <ThemedText
          className="tet-sm text-n500 dark:text-darkN500 pt-3 px-4 text-center"
          text="Stay connected, follow teams, and never miss thrilling Stay connected"
        />
      </View>

      <View className="pt-8 flex-col gap-4" style={marginLeftRight}>
        <FormField isTitle={true} placeholder="Enter Name" title="Email" />
      </View>
      <View className="pt-20" style={marginLeftRight}>
        <PrimaryButton
          text="Send OTP"
          onPress={() => router.push("/VerifyOTP")}
        />
      </View>
    </ScrollView>
  );
};

export default ForgotPassword;
