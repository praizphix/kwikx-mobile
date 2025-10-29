import { ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import FormField from "@/components/formField/FormField";
import { marginLeftRight } from "@/styles/styles";
import PrimaryButton from "@/components/PrimaryButton";
import { router } from "expo-router";

const AddNewContact = () => {
  return (
    <ScrollView className="bg-white dark:bg-n900 pt-6 ">
      <PageTitle title="Add New Contact" isBgWhite={true} />

      <View className="pt-8 flex-col gap-4" style={marginLeftRight}>
        <FormField
          isTitle={true}
          placeholder="Enter Name"
          title="Account Holder Name"
        />
        <FormField isTitle={true} placeholder="Enter Email" title="Email" />
      </View>

      <View className="pt-8" style={marginLeftRight}>
        <PrimaryButton text="Save" onPress={() => router.push("/Contacts")} />
      </View>
    </ScrollView>
  );
};

export default AddNewContact;
