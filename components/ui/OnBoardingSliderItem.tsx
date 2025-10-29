import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";

export type ItemProps = {
  id: number;
  img: ImageSourcePropType;
  title: string;
  description: string;
};

type Props = {
  item: ItemProps;
  idx: number;
};

import { useColorScheme } from "nativewind";
import ThemedText from "../ThemedText";

const OnBoardingSliderItem = ({ item, idx }: Props) => {
  const { colorScheme } = useColorScheme();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  return (
    <View>
      <View className="">
        <View
          style={{ width: SCREEN_WIDTH * 0.9, margin: SCREEN_WIDTH * 0.05 }}
          className=" justify-start items-start "
        >
          <ThemedText
            className="text-4xl text-center dark:text-white"
            text={item.title}
            weight="bold"
          />
          <ThemedText
            className="pt-5 text-n500 dark:text-darkN500"
            text={item.description}
          />
        </View>
      </View>
    </View>
  );
};

export default OnBoardingSliderItem;
