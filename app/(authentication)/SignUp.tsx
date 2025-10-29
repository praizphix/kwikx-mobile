import { Image, Pressable, ScrollView, View, Alert, ActivityIndicator } from "react-native";
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
import { signUp } from "@/services/auth";

const SignUp = () => {
  const [checked, setChecked] = useState(false);
  const { colorScheme } = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        "Success",
        "Account created successfully! Please sign in.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/SignIn"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

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
          text="Join KwikX to access multi-currency wallets and instant exchanges"
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
        <FormField
          isTitle={true}
          placeholder="Enter Password"
          title="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <FormField
          isTitle={true}
          placeholder="Re-enter Password"
          title="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
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
              text="I agree to Terms & Conditions"
              weight="medium"
            />
          </Pressable>
        </View>
      </View>

      <View className="pt-8" style={marginLeftRight}>
        <PrimaryButton
          text={loading ? "Creating Account..." : "Sign Up"}
          onPress={handleSignUp}
          disabled={loading || !checked}
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
