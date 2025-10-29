import { TouchableOpacity } from "react-native";
import React from "react";
import ThemedText from "./ThemedText";

const PrimaryButton = ({
  text,
  onPress,
  isSecondary,
  disabled,
}: {
  text: string;
  onPress: () => void;
  isSecondary?: boolean;
  disabled?: boolean;
}) => {
  return (
    <TouchableOpacity
      className={`flex-1 py-3 border  rounded-lg ${
        isSecondary
          ? "bg-bgColor  border-bgColor2 dark:bg-darkN20 dark:border-darkN40 "
          : "bg-g300 border-g300"
      } ${disabled ? "opacity-50" : ""}`}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText
        className={` text-center ${isSecondary ? "text-g300" : "text-white"}`}
        text={text}
        weight="semiBold"
      />
    </TouchableOpacity>
  );
};

export default PrimaryButton;
