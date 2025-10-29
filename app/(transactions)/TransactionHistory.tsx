import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { PhMagnifyingGlass } from "@/assets/icons/MagnifyingGlass";
import { PhMicrophone } from "@/assets/icons/Microphone";
import { PhSlidersHorizontal } from "@/assets/icons/SlidersHorizontal";
import ThemedText from "@/components/ThemedText";
import { transactionsList } from "@/constants/data";
import TransactionItemCard from "@/components/cards/TransactionItemCard";
import { marginLeftRight } from "@/styles/styles";

const tabItems = ["All", "Income", "Request", "Sent", "Received", "Declined"];

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <ScrollView className="bg-white dark:bg-n0  pt-6 min-h-dvh">
      <PageTitle title="Transation History" isBgWhite={true} />
      <View className="pt-2 flex-row justify-start items-center gap-x-2 px-6">
        <View className="flex-row justify-between items-center flex-1 border border-n40 rounded-xl px-3 gap-x-2 dark:border-darkN40 dark:bg-darkN20">
          <View className="">
            <PhMagnifyingGlass color="#A6A6A6" />
          </View>

          <TextInput
            placeholder="Search here..."
            className="flex-1 dark:text-white py-4"
            numberOfLines={1}
          />

          <PhMicrophone color="#A6A6A6" />
        </View>
        <Pressable className="p-3 bg-g300 rounded-md  flex-row justify-center items-center">
          <PhSlidersHorizontal color="white" size="24px" />
        </Pressable>
      </View>

      <View className="pl-6 pt-6">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          data={tabItems}
          keyExtractor={(_, index) => "key" + index}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setActiveTab(index)}
              className={`${tabItems.length === index + 1 && "pr-6"} pb-1`}
            >
              <ThemedText
                className={`px-6 py-3 rounded-full  border   ${
                  index === activeTab
                    ? " bg-g300 text-white border-g300"
                    : "bg-n20 border-n40 dark:bg-darkN20 dark:border-darkN40 dark:text-white"
                }`}
                text={item}
                weight="medium"
              />
            </Pressable>
          )}
        />
      </View>
      <View
        className="flex flex-col gap-y-6 pt-6 pb-16"
        style={marginLeftRight}
      >
        {transactionsList.map(({ id, date, transactions }) => (
          <View key={`${id}`}>
            <View className="flex-row justify-start items-center gap-x-2">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500"
                text={date}
                weight="semiBold"
              />
              <View className="flex-1 border border-dashed border-n40 dark:border-darkN40"></View>
            </View>
            <View className="flex-col gap-y-4 pt-4">
              {transactions.map(({ id, ...props }, idx) => (
                <TransactionItemCard
                  key={`${id}`}
                  length={transactions.length}
                  idx={idx}
                  {...props}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default TransactionHistory;
