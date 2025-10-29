import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { useColorScheme } from "nativewind";

const SIZE = 50;

const CircleBg = ({ index }: { index: number }) => {
  const opacityValue = useSharedValue(2);
  const scaleValue = useSharedValue(0);
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    opacityValue.value = withDelay(
      index * 400,
      withRepeat(
        withTiming(0, {
          duration: 4000,
        }),
        0,
        false
      )
    );

    scaleValue.value = withDelay(
      index * 400,
      withRepeat(
        withTiming(4, {
          duration: 4000,
        }),
        0,
        false
      )
    );
  }, [opacityValue, scaleValue, index]);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        rStyle,
        {
          backgroundColor: "#328B64",
        },
      ]}
    />
  );
};
const styles = StyleSheet.create({
  dot: {
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE / 2,
    position: "absolute",
  },
});

export default CircleBg;
