import { ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import CustomSwitch from "@/components/ui/CustomSwitch";

const notificationItems = [
  "Transaction status updates",
  "Fraud or suspicious activity alerts",
  "Payment request notifications",
  "Card activity notifications",
  "Customer support notifications:",
  "Account balance alerts",
  "Security alerts",
  "Daily or weekly summary",
  "App updates & enhancements",
  "Promotional offers & updates",
  "Participate in a survey",
];

const NotificationSettings = () => {
  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Notifications Settings" isBgWhite={true} />

      <View className=" p-6 border border-bgColor2 rounded-2xl mx-6 dark:border-darkN40 dark:bg-n0">
        <ThemedText
          className="border-b border-dashed border-n40 pb-6 text-p1 dark:border-darkN40 text-g300"
          text="Manage Notification"
          weight="semiBold"
        />

        <View className=" flex flex-col gap-y-4 pt-5">
          {notificationItems.map((item, idx) => (
            <View
              key={`${idx}`}
              className={`flex-row items-center justify-between  ${
                notificationItems.length === idx + 1
                  ? ""
                  : "border-b border-dashed border-n40 pb-5 dark:border-darkN40"
              }`}
            >
              <ThemedText
                className=" dark:text-white"
                text={item}
                weight="semiBold"
              />

              <CustomSwitch />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default NotificationSettings;
