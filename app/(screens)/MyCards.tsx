import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import { PhTrash } from "@/assets/icons/Trash";
import { PhGearSix } from "@/assets/icons/GearSix";
import { PhWifiHigh } from "@/assets/icons/WifiHigh";
import visaLogo from "@/assets/images/visa-logo.png";
import { marginLeftRight } from "@/styles/styles";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import PageTitle from "@/components/ui/PageTitle";
import useModalAnimation from "@/hooks/useModalAnimation";
import PrimaryButton from "@/components/PrimaryButton";
import { myCardsData } from "@/constants/data";
import { router } from "expo-router";

const MyCards = () => {
  const [slideItem, setSlideItem] = useState<number | null>(null);
  const { modalBgAnimatedStyles, modalAnimation } = useModalAnimation();

  const translateXValues = myCardsData.map(() => useSharedValue(0));
  const getSlideLeftStyles = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateXValues[index].value }],
      };
    });
  };

  const slideLeftHandle = (index: number) => {
    // If the card is not the currently slid card
    if (slideItem !== index) {
      // Reset any previously slid card
      if (slideItem !== null) {
        translateXValues[slideItem].value = withTiming(0, { duration: 500 });
      }

      // Slide the new card
      translateXValues[index].value = withTiming(-50, { duration: 500 });
      setSlideItem(index);
    } else {
      // If clicking the same card, toggle its position
      translateXValues[index].value =
        translateXValues[index].value === 0
          ? withTiming(-50, { duration: 500 })
          : withTiming(0, { duration: 500 });
      setSlideItem(index);
    }
  };
  return (
    <View>
      <ScrollView className="bg-g300 dark:bg-darkG300 pt-6 h-full">
        <View className="">
          <PageTitle title="My Card" />

          <View className="bg-white py-7 rounded-t-3xl dark:bg-n0">
            <View className=" flex-col gap-y-4 ">
              {myCardsData.map(
                (
                  { id, bank, cardNo, cardHolderName, expiryDate, cardBg },
                  idx
                ) => (
                  <View
                    key={`${id}`}
                    className="flex flex-col gap-y-4 "
                    style={marginLeftRight}
                  >
                    <View className="relative">
                      <View className="flex flex-col gap-y-8 justify-center items-center absolute top-16 right-0">
                        <Pressable
                          onPressOut={modalAnimation}
                          className="flex justify-center items-center bg-n20  p-2 rounded-full text-lg !leading-none dark:bg-darkG300    "
                        >
                          <PhTrash color="#FFB323" type="fill" size="20px" />
                        </Pressable>
                        <View className="flex justify-center items-center bg-n20 p-2 rounded-full text-lg !leading-none dark:bg-darkG300">
                          <PhGearSix color="#328B64" type="fill" size="20px" />
                        </View>
                      </View>
                      <Animated.View style={getSlideLeftStyles(idx)}>
                        <Pressable
                          className=" z-10 justify-center items-center rounded-2xl overflow-hidden"
                          onPress={() => slideLeftHandle(idx)}
                        >
                          <Image source={cardBg} className="" />
                          <View className="absolute top-0 left-0 right-0 bottom-0 p-6">
                            <View className="flex-row justify-between items-center font-bold">
                              <ThemedText className="text-white" text={bank} />

                              <View className="rotate-90">
                                <PhWifiHigh
                                  color="white"
                                  size="30px"
                                  type="bold"
                                />
                              </View>
                            </View>
                            <ThemedText
                              className="text-lg  py-10 text-white"
                              text={cardNo}
                              weight="medium"
                            />

                            <View className="flex-row justify-between items-end">
                              <View className="">
                                <ThemedText
                                  className="text-[9px] text-white"
                                  text="Card Holder name"
                                />
                                <ThemedText
                                  className="text-sm pt-1 text-white"
                                  text={cardHolderName}
                                />
                              </View>
                              <View className="">
                                <ThemedText
                                  className="text-[9px] text-white"
                                  text="Expiry date"
                                />
                                <ThemedText
                                  className="text-sm pt-1 text-white"
                                  text={expiryDate}
                                />
                              </View>

                              <Image source={visaLogo} />
                            </View>
                          </View>
                        </Pressable>
                      </Animated.View>
                    </View>
                  </View>
                )
              )}
            </View>

            <View className="px-6 py-8">
              <PrimaryButton
                onPress={() => router.push("/AddNewCard")}
                text="Add New Card"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <Animated.View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/60 flex justify-center items-center px-6"
        }
        style={[modalBgAnimatedStyles]}
      >
        <View className="rounded-2xl bg-white p-7 dark:bg-n0 w-full">
          <ThemedText
            className="text-lg text-center px-12 pb-5 border-b border-dashed dark:text-white border-n40 dark:border-darkN40"
            text="Are you sure you want to remove card?"
            weight="semiBold"
          />

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton onPress={modalAnimation} text="Cancel" />
            <PrimaryButton
              onPress={modalAnimation}
              text="Yes, Remove"
              isSecondary={true}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default MyCards;
