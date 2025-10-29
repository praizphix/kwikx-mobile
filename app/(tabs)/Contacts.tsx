import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import SearchBox from "@/components/ui/SearchBox";
import ContactList from "@/components/ContactList";
import { PhPlus } from "@/assets/icons/Plus";
import { router } from "expo-router";

const Contacts = () => {
  return (
    <View>
      <ScrollView className="bg-white dark:bg-n0  pt-4 min-h-dvh">
        <ThemedText
          className={`text-2xl text-center pb-6 dark:text-white`}
          text="Contact"
          weight="semiBold"
        />
        <SearchBox />
        <ContactList />
      </ScrollView>
      <Pressable
        onPress={() => router.push("/AddNewContact")}
        className="bg-yellow-400 absolute bottom-40 size-14 rounded-full right-6 flex justify-center items-center"
      >
        <PhPlus color="" size="24px" />
      </Pressable>
    </View>
  );
};

export default Contacts;
