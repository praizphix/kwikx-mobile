import { ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import { PhCaretDown } from "@/assets/icons/CaretDown";
import { useColorScheme } from "nativewind";
import { notifications } from "@/constants/data";

const Notifications = () => {
  const { colorScheme } = useColorScheme();
  return (
    <ScrollView className="bg-g300 dark:bg-darkG300  pt-6 min-h-dvh">
      <PageTitle title="Notifications" />

      <View className="bg-white py-7 px-6 rounded-t-3xl dark:bg-n0">
        <View className="flex-row justify-between items-center pb-6 border-b border-dashed border-n40 dark:border-darkN40">
          <ThemedText
            className="text-lg dark:text-white"
            text="All Notification"
            weight="semiBold"
          />
          <View className="flex-row justify-start items-center gap-2">
            <ThemedText
              className="text-xs text-n500 dark:text-darkN500"
              text="Short By :"
            />
            <View className="relative cursor-pointer">
              <View className="flex-row justify-center items-center gap-1 py-2 px-4 border border-n40 rounded-lg dark:border-darkN40 selectSortBy">
                <ThemedText className=" dark:text-white" text="All" />
                <PhCaretDown
                  color={colorScheme === "dark" ? "#B3B3B3" : "#424242"}
                  size="14px"
                />
              </View>
            </View>
          </View>
        </View>
        <View className="pt-6 flex flex-col gap-y-8 pb-8">
          {notifications.map(({ id, date, notificationList }) => (
            <View key={`${id}`} className=" ">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text={date}
                weight="semiBold"
              />

              <View className="pt-5 flex flex-col gap-y-4 ">
                {notificationList.map(({ id, title, desc, time, icon }) => (
                  <View
                    key={`${id}`}
                    className="flex-row justify-between items-start p-4 border border-n40 rounded-3xl  dark:border-darkN40"
                  >
                    <View className="flex-row justify-start items-start  gap-x-3 w-[80%] ">
                      <View className="flex justify-center items-center  bg-bgColor dark:bg-darkG300 dark:border-darkN40 p-3.5 rounded-full  !leading-none border border-n40">
                        {React.createElement(icon, {
                          color: "#328B64",
                          size: "24px",
                        })}
                      </View>
                      <View className=" w-full flex flex-col">
                        <ThemedText
                          className=" dark:text-white"
                          text={title}
                          weight="semiBold"
                        />
                        <ThemedText
                          className="text-sm text-n500 dark:text-darkN500 w-[80%] "
                          text={desc}
                        />
                      </View>
                    </View>
                    <ThemedText className="text-xs " text={time} />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Notifications;
