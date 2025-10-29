import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import { PhCaretLeft } from "@/assets/icons/CaretLeft";
import { gridGap, gridItemWidth, marginLeftRight } from "@/styles/styles";
import { useColorScheme } from "nativewind";
import { LineChart } from "react-native-chart-kit";
import { noOfTransactions } from "@/constants/data";
import { PhCaretDown } from "@/assets/icons/CaretDown";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const data = [12, 42, 23, 56, 62, 35, 28, 16, 17, 34];
const chartSortByItems = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
];
const Statistics = () => {
  const [sortBy,setSortBy] = useState("Last 7 Days")
  const [modalPointerEvents, setModalPointerEvents] = useState<"none" | "auto">(
    "none"
  );
  const { colorScheme } = useColorScheme();
  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const modalOpacity = useSharedValue(0);
  const modaltranslateY = useSharedValue(20);

  const modalStyles = useAnimatedStyle(() => {
    return {
      opacity: modalOpacity.value,
      transform: [{ translateY: modaltranslateY.value }],
    };
  });

  const modalAnimation = () => {
    if (modalOpacity.value === 0) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      setModalPointerEvents("auto")
      modaltranslateY.value = withTiming(0, { duration: 300 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 300 });
      modaltranslateY.value = withTiming(20, { duration: 300 });
      setModalPointerEvents("none")
    }
  };
  return (
    <ScrollView className="bg-white dark:bg-n0  pt-4">
      <ThemedText
        className={`text-2xl text-center dark:text-white`}
        text="Statistics"
        weight="semiBold"
      />
      <View
        className="p-4 mt-8 rounded-2xl border border-n40 dark:border-darkN40 flex-row justify-between items-center"
        style={marginLeftRight}
      >
        <View className="flex-row justify-start items-start gap-x-3">
          <View className="flex justify-center items-center bg-g300 w-10 h-10 rounded-full">
            <PhCaretLeft color="white" size="20px" />
          </View>
          <View className="">
            <ThemedText
              className="text-xl  text-g300"
              text="$145.00"
              weight="semiBold"
            />
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 pt-1"
              text="Income"
            />
          </View>
        </View>
        <View className="border border-n40 dark:border-darkN40 border-dashed h-9 w-px"></View>
        <View className="flex-row justify-start items-start gap-x-3">
          <View className="flex justify-center items-center bg-o300 w-10 h-10 rounded-full">
            <PhCaretLeft color="" size="20px" />
          </View>
          <View className="">
            <ThemedText
              className="text-xl  text-g300"
              text="$145.00"
              weight="semiBold"
            />
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500 pt-1"
              text="Income"
            />
          </View>
        </View>
      </View>
      <View className="pt-6">
        <View className="flex-row justify-between items-center px-6 pb-4">
          <ThemedText
            className="text-lg dark:text-white"
            text="Show Chart in"
            weight="semiBold"
          />

          <View className="">
            <Pressable
              onPress={() => {
                modalAnimation();
              }}
              className="flex-row justify-center items-center gap-x-2 border border-n40 dark:border-darkN40 rounded-lg p-3"
            >
              <ThemedText
                className="text-n500 dark:text-darkN500 text-sm "
                text={sortBy}
              />

              <PhCaretDown color="" />
            </Pressable>
            <Animated.View
              className="bg-white p-4 z-50 rounded-xl border border-n40 dark:border-darkN40 dark:bg-darkG300 w-[150px] absolute right-0 top-12"
              style={modalStyles}
              pointerEvents={modalPointerEvents}
          
            >
              <View className="flex flex-col gap-2">
                {chartSortByItems.map((item, idx) => (
                  <Pressable  onPress={()=> {
                    setSortBy(item)
                    modalAnimation()
                    }} key={`${idx}`} className="">
                    <ThemedText
                      className={`text-[13px] text-n500 dark:text-darkN500  ${
                        chartSortByItems.length === idx + 1
                          ? ""
                          : "pb-2 border-b border-dashed border-n40 dark:border-darkN40"
                      }`}
                      text={item}
                    />
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          </View>
        </View>
        <LineChart
          data={{
            labels: ["Sat", "Sun", "Mon", "Tue", "Wen", "Thu", "Fri"],
            datasets: [
              {
                data: [...data],
              },
            ],
          }}
          width={SCREEN_WIDTH}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          yAxisInterval={1}
          withVerticalLines={true}
          withHorizontalLines={true}
          withInnerLines={false}
          withOuterLines={false}
          chartConfig={{
            backgroundGradientFrom: `${
              colorScheme === "dark" ? "#090909" : "#ffff"
            }`,
            backgroundGradientTo: `${
              colorScheme === "dark" ? "#090909" : "#ffff"
            }`,
            decimalPlaces: 0,
            strokeWidth: 3,
            color: (opacity = 1) => `#328B64`,
            labelColor: (opacity = 1) =>
              `${colorScheme === "dark" ? "#ffff" : "black"}`,

            propsForDots: {
              r: "0",
              strokeWidth: ".5",
              stroke: "#328B64",
            },
          }}
          bezier
        />
      </View>
      <View className=" pt-8" style={marginLeftRight}>
        <ThemedText
          className="text-lg dark:text-white"
          text="Number of Transactions"
          weight="semiBold"
        />
        <View className="pt-5 flex-row flex-wrap " style={gridGap(0.035)}>
          {noOfTransactions.map(({ id, name, totalNo }) => (
            <View
              key={`${id}`}
              className=" p-4 border border-n40 dark:border-darkN40 rounded-md flex flex-col gap-2 justify-center items-center text-center"
              style={gridItemWidth(0.035, 3)}
            >
              <View className="w-10 h-10 rounded-full border border-bgColor2 flex justify-center items-center dark:border-darkN40">
                <ThemedText
                  className="font-medium text-g300"
                  text={totalNo}
                  weight="medium"
                />
              </View>
              <ThemedText
                className="text-sm font-medium text-n500 dark:text-darkN500"
                text={name}
                weight="semiBold"
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Statistics;
