import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import { PhMagnifyingGlass } from "@/assets/icons/MagnifyingGlass";
import { PhMicrophone } from "@/assets/icons/Microphone";
import { PhSlidersHorizontal } from "@/assets/icons/SlidersHorizontal";
import { faqData } from "@/constants/data";
import { Octicons } from "@expo/vector-icons";
import { PhHeadset } from "@/assets/icons/Headset";
import { PhWhatsappLogo } from "@/assets/icons/WhatsApp";
import { PhGlobeSimple } from "@/assets/icons/GlobeSimple";
import { PhFacebookLogo } from "@/assets/icons/Facebook";
import { PhInstagramLogo } from "@/assets/icons/Instagram";
import { marginLeftRight } from "@/styles/styles";
import { PhTwitterLogo } from "@/assets/icons/Twitter";

const tabName = ["All Contacts", "Favourites"];
const tabItems = ["All", "Income", "Request", "Sent", "Received", "Declined"];

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeTag, setActiveTag] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  return (
    <ScrollView className="bg-white dark:bg-n900 pt-6 ">
      <PageTitle title="Help Center" isBgWhite={true} />

      <View className="px-6 flex-row justify-between items-center tab-button">
        {tabName.map((item, idx) => (
          <Pressable
            key={`${idx}`}
            onPress={() => setActiveTab(idx)}
            className="flex-1"
          >
            <ThemedText
              className={`text-lg text-center pb-1 border-b-2  ${
                activeTab === idx
                  ? "border-g300 text-g300"
                  : "border-n40 dark:text-white"
              }`}
              text={item}
              weight="semiBold"
            />
          </Pressable>
        ))}
      </View>

      {activeTab === 0 && (
        <View>
          <View className="pl-6 pt-6">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              data={tabItems}
              keyExtractor={(_, index) => "key" + index}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => setActiveTag(index)}
                  className={`${tabItems.length === index + 1 && "pr-6"} pb-1`}
                >
                  <ThemedText
                    className={`px-6 py-3 rounded-full  border   ${
                      index === activeTag
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
          <View className="pt-2 flex-row justify-start items-center gap-x-2 px-6 mt-6">
            <View className="flex-row justify-between items-center flex-1 border border-n40 rounded-xl px-3 py-0.5 gap-x-2 dark:border-darkN40 dark:bg-darkN20">
              <View className="">
                <PhMagnifyingGlass color="#A6A6A6" />
              </View>

              <TextInput
                placeholder="Search here..."
                className="flex-1 dark:text-white"
                numberOfLines={1}
              />

              <PhMicrophone color="#A6A6A6" />
            </View>
            <Pressable className="p-3 bg-g300 rounded-md  flex-row justify-center items-center">
              <PhSlidersHorizontal color="white" size="24px" />
            </Pressable>
          </View>
          <View className="pt-6 gap-y-3 px-6">
            {faqData.map(({ id, question, answer }, idx) => (
              <Pressable
                onPress={() => setActiveFaq(idx)}
                className={` px-4 pt-4 border  rounded-2xl dark:bg-n0  ${
                  activeFaq === idx
                    ? "border-g300 "
                    : "border-n40 dark:border-darkN40 "
                }`}
                key={id}
              >
                <View className="flex-row justify-between items-start">
                  <ThemedText
                    className={` text-base pr-5 pb-4 ${
                      activeFaq === idx ? "text-g300" : " dark:text-white"
                    }`}
                    text={question}
                    weight="semiBold"
                  />

                  <Octicons
                    name={activeFaq === idx ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#3f3f3f"
                  />
                </View>
                {activeFaq === idx && (
                  <ThemedText
                    className="pt-3 pb-3  border-t border-dashed border-n40  text-sm text-n500 dark:border-darkN40 dark:text-darkN500 "
                    text={answer}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
      {activeTab === 1 && (
        <View
          className="border border-n40 dark:border-darkN40 rounded-xl p-5 flex flex-col gap-y-5 mt-6"
          style={marginLeftRight}
        >
          <View className="flex-row justify-start items-center gap-x-3 border-b border-dashed pb-5 border-n40 dark:border-darkN40">
            <PhHeadset color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="Customer Service"
              weight="semiBold"
            />
          </View>
          <View className="flex-row justify-start items-center gap-x-3 border-b border-dashed pb-5 border-n40 dark:border-darkN40">
            <PhWhatsappLogo color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="WhatsApp"
              weight="semiBold"
            />
          </View>
          <View className="flex-row justify-start items-center gap-x-3 border-b border-dashed pb-5 border-n40 dark:border-darkN40">
            <PhGlobeSimple color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="Website"
              weight="semiBold"
            />
          </View>
          <View className="flex-row justify-start items-center gap-x-3 border-b border-dashed pb-5 border-n40 dark:border-darkN40">
            <PhFacebookLogo color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="Facebook"
              weight="semiBold"
            />
          </View>
          <View className="flex-row justify-start items-center gap-x-3 border-b border-dashed pb-5 border-n40 dark:border-darkN40">
            <PhTwitterLogo color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="Twitter"
              weight="semiBold"
            />
          </View>
          <View className="flex-row justify-start items-center gap-x-3">
            <PhInstagramLogo color="#328B64" type="fill" size="24px" />
            <ThemedText
              className="text-base dark:text-white"
              text="Instagram"
              weight="semiBold"
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default HelpCenter;
