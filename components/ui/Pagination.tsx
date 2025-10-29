import { View } from "react-native";
import React from "react";
import { SharedValue } from "react-native-reanimated";
import Dot from "./Dot";

type DataProps = Array<{
  id: number;
}>;

type Props = {
  onbordingSliderData: DataProps;
  x: SharedValue<number>;
};

const Pagination = ({ onbordingSliderData, x }: Props) => {
  return (
    <View className="flex-row justify-start items-center  ">
      {onbordingSliderData.map((_, index) => {
        return <Dot key={index} index={index} x={x} />;
      })}
    </View>
  );
};

export default Pagination;
