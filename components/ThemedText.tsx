import { Text } from "react-native";
import React from "react";

type ThemedTextProps = {
  text: string;
  weight?: "regular" | "medium" | "semiBold" | "bold" | "extraBold";
  className: string;
};

const ThemedText = ({
  text,
  weight = "regular",
  className,
}: ThemedTextProps) => {
  const fontWeight = {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  };

  return (
    <Text className={className} style={{ fontFamily: fontWeight[weight] }}>
      {text}
    </Text>
  );
};

export default ThemedText;
