import { Image, Pressable, ScrollView, View, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import FormField from "@/components/formField/FormField";
import { marginLeftRight } from "@/styles/styles";
import PrimaryButton from "@/components/PrimaryButton";
import { PhFacebookLogo } from "@/assets/icons/Facebook";
import google from "@/assets/images/google.png";
import { PhAppleLogo } from "@/assets/icons/AppleLogo";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { signIn } from "@/services/auth";

const SignIn = () => {
  const { colorScheme } = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/Home");
    } catch (error: any) {
      Alert.alert("Sign In Failed", error.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="h-full bg-white dark:bg-n0">
      <View className=" justify-center items-center text-center flex-col pt-4">
        <ThemedText
          className="text-2xl dark:text-white"
          text="Sign In"
          weight="semiBold"
        />
        <ThemedText
          className="tet-sm text-n500 dark:text-darkN500 pt-3 px-4 text-center"
          text="Welcome back! Sign in to access your multi-currency wallets"
        />
      </View>

      <View className="pt-8 flex-col gap-4" style={marginLeftRight}>
        <FormField
          isTitle={true}
          placeholder="Enter Email"
          title="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View>
          <FormField
            isTitle={true}
            placeholder="Password"
            title="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable
            onPress={() => router.push("/ForgotPassword")}
            className="flex-row justify-end pt-2"
          >
            <ThemedText
              className="text-sm text-primary"
              text="Forgot password?"
              weight="semiBold"
            />
          </Pressable>
        </View>
      </View>

      <View className="pt-8" style={marginLeftRight}>
        <PrimaryButton
          text={loading ? "Signing In..." : "Sign In"}
          onPress={handleSignIn}
          disabled={loading}
        />
        {loading && (
          <View className="mt-4 items-center">
            <ActivityIndicator color="#0A5344" />
          </View>
        )}
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
        <Pressable className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <Image source={google} />
        </Pressable>
        <Pressable className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <PhFacebookLogo color="#4267B2" type="fill" size="24px" />
        </Pressable>
        <Pressable className="flex size-12 items-center justify-center rounded-full bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40">
          <PhAppleLogo
            color={colorScheme === "dark" ? "white" : "black"}
            type="fill"
            size="22px"
          />
        </Pressable>
      </View>

      <View className="pt-4 flex-row justify-center items-center pb-8">
        <ThemedText
          className=" text-sm text-n500 dark:text-darkN500"
          text="Don't have an account? "
        />
        <Pressable onPress={() => router.push("/SignUp")}>
          <ThemedText
            className="text-primary  text-sm"
            text="Sign Up "
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

export default SignIn;
