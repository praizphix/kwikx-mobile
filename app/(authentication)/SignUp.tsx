import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import FormField from "@/components/formField/FormField";
import { marginLeftRight } from "@/styles/styles";
import { PhCheck } from "@/assets/icons/Check";
import PrimaryButton from "@/components/PrimaryButton";
import { PhFacebookLogo } from "@/assets/icons/Facebook";
import google from "@/assets/images/google.png";
import { PhAppleLogo } from "@/assets/icons/AppleLogo";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";

const SignUp = () => {
  const [checked, setChecked] = useState(false);
  const { colorScheme } = useColorScheme();
  return (
    <ScrollView className="h-full bg-white dark:bg-n0">
      <View className=" justify-center items-center text-center flex-col pt-4">
        <ThemedText
          className="text-2xl dark:text-white"
          text="Create an Account"
          weight="semiBold"
        />
        <ThemedText
          className="tet-sm text-n500 dark:text-darkN500 pt-3 px-4 text-center"
          text="Stay connected, follow teams, and never miss thrilling Stay connected"
        />
      </View>

      <View className="pt-8 flex-col gap-4" style={marginLeftRight}>
        <FormField isTitle={true} placeholder="Enter Name" title="Email" />
        <FormField isTitle={true} placeholder="Password" title="Password" />
        <FormField
          isTitle={true}
          placeholder="Confirm Password"
          title="Confirm Password"
        />
        <View>
          <Pressable
            onPress={() => setChecked((prev) => !prev)}
            className=" flex-row gap-x-3 justify-start items-center"
          >
            <View
              className={`border  w-6 h-6 rounded-md justify-center items-center     ${
                checked
                  ? "bg-primary border-primary"
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
      <View className="pt-8" style={marginLeftRight}>
        <PrimaryButton text="Sign Up" onPress={() => router.push("/SignIn")} />
      </View>

      <View
        className="flex-row items-center justify-between gap-x-2 py-7"
        style={marginLeftRight}
      >
        <View className="flex-1 border border-b border-dashed border-n40 dark:border-darkN40"></View>
        <ThemedText
          className="text-nowrap text-sm dark:text-white"
          text="Or Continue With"
          weight="semiBold"
        />

        <View className=" flex-1 border-b border-dashed border-n40 dark:border-darkN40"></View>
      </View>

      <View className="flex-row items-center justify-center gap-x-4">
        <View className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <Image source={google} />
        </View>
        <View className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <PhFacebookLogo color="#4267B2" type="fill" size="24px" />
        </View>
        <View className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <PhAppleLogo
            color={colorScheme === "dark" ? "white" : "black"}
            type="fill"
            size="22px"
          />
        </View>
      </View>

      <View className="pt-4 flex-row justify-center items-center ">
        <ThemedText
          className=" text-sm text-n500 dark:text-darkN500"
          text="Already have an account? "
        />
        <Pressable onPress={() => router.push("/SignIn")}>
          <ThemedText
            className="text-primary  text-sm"
            text="Sign In "
            weight="semiBold"
          />
        </Pressable>
        <ThemedText
          className="text-sm text-n500 dark:text-darkN500"
          text="here"
        />
      </View>
    </ScrollView>
  );
};

export default SignUp;
