import {
  FlatList,
  Image,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import React from "react";
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import element1 from "@/assets/images/element-1.png";
import element2 from "@/assets/images/element-2.png";
import { onbordingSliderData } from "@/constants/data";
import OnBoardingSliderItem, {
  ItemProps,
} from "@/components/ui/OnBoardingSliderItem";
import Pagination from "@/components/ui/Pagination";
import SliderButton from "@/components/ui/SliderButton";
import sliderBgWhite from "@/assets/images/slider-bg-white.png";
import sliderBgBlack from "@/assets/images/slider-bg-black.png";
import onBoardingSliderImg2 from "@/assets/images/onboarding-slider-img2.png";

const OnBoardingSlider = () => {
  const flatListRef = useAnimatedRef<FlatList<ItemProps>>();
  const x = useSharedValue(0);
  const flatListIndex = useSharedValue(0);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (viewableItems[0].index !== null) {
      flatListIndex.value = viewableItems[0].index;
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });
  return (
    <View className="h-full bg-bgColor dark:bg-n0 pt-20">
      <Image source={element1} className="absolute top-[40%] left-0" />
      <Image source={element2} className="absolute top-20 right-0" />
      <Image
        source={sliderBgWhite}
        className="absolute bottom-0 left-0 w-full z-20 dark:hidden"
      />
      <Image
        source={sliderBgBlack}
        className="absolute bottom-0 left-0 w-full z-20 hidden dark:flex"
      />

      <View className="z-10">
        <View
          className=" justify-center items-center"
          style={{
            width: SCREEN_WIDTH * 0.9,
            margin: SCREEN_WIDTH * 0.05,
          }}
        >
          <Image source={onBoardingSliderImg2} className=" object-cover" />
        </View>
      </View>
      <View className="z-30">
        <Animated.FlatList
          ref={flatListRef}
          data={onbordingSliderData}
          onScroll={onScroll}
          keyExtractor={(item) => `key:${item.id}`}
          renderItem={({ item, index }) => {
            return <OnBoardingSliderItem item={item} idx={index} />;
          }}
          scrollEventThrottle={16}
          horizontal={true}
          bounces={false}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{
            minimumViewTime: 300,
            viewAreaCoveragePercentThreshold: 10,
          }}
        />
        <View className="flex-row justify-between items-center pt-8 px-6">
          <Pagination onbordingSliderData={onbordingSliderData} x={x} />
          <SliderButton
            flatListRef={flatListRef}
            flatListIndex={flatListIndex}
            dataLength={onbordingSliderData.length}
            x={x}
          />
        </View>
      </View>
    </View>
  );
};

export default OnBoardingSlider;
