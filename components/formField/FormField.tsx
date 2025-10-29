import { Pressable, TextInput, View } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import ThemedText from "../ThemedText";

type PropsType = {
  isTitle: boolean;
  title?: string;
  placeholder: string;
  otherStyle?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  isRightIcon?: boolean;
  children?: React.ReactNode;
};

const FormField = ({
  isTitle,
  title = "field",
  placeholder,
  otherStyle,
  keyboardType = "default",
  isRightIcon,
  children,
}: PropsType) => {
  const { colorScheme } = useColorScheme();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`   ${otherStyle} pt-1`}>
      {isTitle && (
        <ThemedText
          className="text-base pb-2 dark:text-white"
          weight="semiBold"
          text={title}
        />
      )}
      <View
        className={` px-4  border border-n40 rounded-xl dark:border-darkN40 flex-row justify-between items-center gap-x-3 bg-n20 dark:bg-darkN20 `}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colorScheme === "dark" ? "#ffff" : "#14141466"}
          className=" flex-1 py-4 "
          secureTextEntry={
            [
              "Password",
              "Old Password",
              "New password",
              "Confirm Password",
            ].includes(title) && !showPassword
          }
          keyboardType={keyboardType}
          numberOfLines={1}
        />
        {["Password", "Confirm Password", "New password"].includes(title) && (
          <Pressable
            className="pt-1"
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colorScheme === "dark" ? "#B6B6B6" : "#14141466"}
            />
          </Pressable>
        )}

        {isRightIcon && children}
      </View>
    </View>
  );
};

export default FormField;
