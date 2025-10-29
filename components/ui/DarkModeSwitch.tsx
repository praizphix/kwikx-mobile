import { TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

const DarkModeSwitch = () => {
  const left = useSharedValue(3);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const COLOR = colorScheme === "dark" ? "#292929" : "#EDEDED";
  const bgColor = useSharedValue(COLOR);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: left.value,
    };
  });

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: bgColor.value,
    };
  });

  useEffect(() => {
    if (colorScheme === "dark") {
      left.value = withTiming(19, { duration: 500 });
      bgColor.value = withTiming("#328B64", { duration: 500 });
    } else {
      left.value = withTiming(3, { duration: 500 });
      bgColor.value = withTiming(COLOR, { duration: 500 });
    }
  }, [colorScheme]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={toggleColorScheme}
      className=""
    >
      <Animated.Text
        className={`h-6 w-11 rounded-full`}
        style={animatedBgStyle}
      ></Animated.Text>
      <Animated.Text
        className={`absolute top-0.5 size-5 rounded-full bg-white  z-10 ${
          colorScheme === "dark" ? "" : ""
        }`}
        style={animatedStyle}
      ></Animated.Text>
    </TouchableOpacity>
  );
};

export default DarkModeSwitch;
