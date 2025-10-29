import { Pressable, ScrollView, Text, View } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PageTitle from "@/components/ui/PageTitle";
import { PhRadioButton } from "@/assets/icons/RadioButton";
import ThemedText from "@/components/ThemedText";
import PrimaryButton from "@/components/PrimaryButton";

const suggestedLanguage = ["English (UK)", "English (US)"];
const LanguageList = [
  "Chineses (CN)",
  "Croatian",
  "Czech",
  "Danish",
  "Hindi",
  "Spanish",
  "Bengali",
  "Russian",
  "Arabic",
];

const LanguageSettings = () => {
  const [selectSuggested, setSelectSuggested] = useState(1);
  const [selectLanguage, setSelectLanguage] = useState(1);
  return (
    <SafeAreaView>
      <ScrollView className="bg-white dark:bg-n900 pt-6 ">
        <PageTitle title="Language Settings" isBgWhite={true} />
        <View className="pb-6">
          <View className="mx-6 p-6 border border-n40 dark:border-darkN40 rounded-xl">
            <ThemedText
              className="border-b border-dashed border-n40 pb-6 text-p1 dark:border-darkN40 text-g300"
              text="Suggest Language"
              weight="semiBold"
            />
            <View className="pt-2 ">
              {suggestedLanguage.map((item, idx) => (
                <Pressable
                  onPress={() => {
                    setSelectSuggested(idx);
                  }}
                  key={`${item}`}
                  className={`flex-row justify-between items-center pt-4 ${
                    suggestedLanguage.length === idx + 1
                      ? ""
                      : "border-b border-dashed border-n40 pb-5 dark:border-darkN40"
                  }`}
                >
                  <Text className="text-base font-medium dark:text-white">
                    {item}
                  </Text>

                  <PhRadioButton
                    color="#328B64"
                    size="20px"
                    type={selectSuggested === idx ? "fill" : ""}
                  />
                </Pressable>
              ))}
            </View>
          </View>
          <View className="mt-8 p-6 border border-n40 dark:border-darkN40 rounded-xl mx-6">
            <ThemedText
              className="border-b border-dashed border-n40 pb-6 text-p1 dark:border-darkN40 text-g300"
              text="Other Language"
              weight="semiBold"
            />

            <View className="pt-2">
              {LanguageList.map((item, idx) => (
                <Pressable
                  onPress={() => setSelectLanguage(idx)}
                  key={`${item}`}
                  className={`flex-row justify-between items-center pt-4 ${
                    LanguageList.length === idx + 1
                      ? ""
                      : "border-b border-dashed border-n40 pb-5 dark:border-darkN40"
                  }`}
                >
                  <Text className="text-base font-medium dark:text-white">
                    {item}
                  </Text>
                  <PhRadioButton
                    color="#328B64"
                    size="20px"
                    type={selectLanguage === idx ? "fill" : ""}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
        <View className="px-6 pb-8">
          <PrimaryButton onPress={() => {}} text="Save" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LanguageSettings;
