import { TouchableOpacity } from "react-native";
import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "nativewind";

const CustomSwitch = () => {
  const left = useSharedValue(3);
  const { colorScheme } = useColorScheme();
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

  const startAnimation = () => {
    if (left.value === 3) {
      left.value = withTiming(19, { duration: 500 });
      bgColor.value = withTiming("#328B64", { duration: 500 });
    } else {
      left.value = withTiming(3, { duration: 500 });
      bgColor.value = withTiming(COLOR, { duration: 500 });
    }
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={startAnimation} className="">
      <Animated.Text
        className={`h-6 w-11 rounded-full`}
        style={animatedBgStyle}
      ></Animated.Text>
      <Animated.Text
        className={`absolute top-0.5 size-5 rounded-full bg-white  z-10`}
        style={animatedStyle}
      ></Animated.Text>
    </TouchableOpacity>
  );
};

export default CustomSwitch;
