import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import ThemedText from "./ThemedText";
import { contactList } from "@/constants/data";
import { router, usePathname } from "expo-router";
import { PhStar } from "@/assets/icons/Star";

const tabName = ["All Contacts", "Favourites"];
const ContactList = () => {
  const [activeTab, setActiveTab] = useState(0);
  const pathname = usePathname();
  return (
    <View>
      <View className="px-6 pt-8 flex-row justify-between items-center tab-button">
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
      <View className="flex-row justify-between items-start gap-x-4 pt-8 px-6 pb-40">
        <View className="flex-1">
          <View className="flex flex-col gap-y-8 flex-1">
            {contactList.map(({ id, firstLetter, contacts }) => (
              <View key={`${id}`} className="">
                <ThemedText
                  className="text-xl pb-5 dark:text-white"
                  text={firstLetter}
                  weight="semiBold"
                />
                <View className="flex flex-col gap-y-4">
                  {contacts.map(({ id, name, img, email, isFavourite }) => (
                    <Pressable
                      key={`${id}`}
                      onPress={() => {
                        if (pathname === "/Contacts") {
                          router.push("/ContactDetails");
                        } else {
                          router.back();
                        }
                      }}
                      className="p-4 rounded-2xl border border-n40 flex flex-col gap-y-4 dark:border-darkN40"
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-row justify-start items-center gap-x-4">
                          <View className="rounded-full bg-bgColor2 w-[60px] h-[60px] overflow-hidden">
                            <Image
                              source={img}
                              className="w-full h-full object-cover"
                            />
                          </View>
                          <View className="">
                            <ThemedText
                              className=" dark:text-white"
                              text={name}
                              weight="semiBold"
                            />
                            <ThemedText
                              className="text-n500 dark:text-darkN500 text-xs pt-2.5"
                              text={email}
                            />
                          </View>
                        </View>
                        <View className="">
                          <PhStar
                            color="#FFB323"
                            size="24px"
                            type={isFavourite ? "fill" : ""}
                          />
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
        <View>
          <View className="flex flex-col gap-y-3 border border-n40 dark:border-darkN40 rounded-xl text-n500 dark:text-darkN500 p-1 sticky top-0 ">
            {[
              "A",
              "B",
              "C",
              "D",
              "E",
              "F",
              "G",
              "H",
              "I",
              "J",
              "K",
              "L",
              "M",
              "N",
              "O",
              "P",
              "Q",
              "R",
              "S",
              "T",
              "U",
              "V",
              "W",
              "X",
              "Y",
              "Z",
            ].map((item, idx) => (
              <ThemedText
                className="text-center text-sm dark:text-white"
                text={item}
                key={`${idx}`}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContactList;
