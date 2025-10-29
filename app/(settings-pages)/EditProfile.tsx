import { ScrollView, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import PrimaryButton from "@/components/PrimaryButton";

const EditProfile = () => {
  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Edit Profile" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-4">
        <FormField isTitle={true} placeholder="Enter Name" title="First Name" />
        <FormField isTitle={true} placeholder="Enter Name" title="Last Name" />
        <FormField isTitle={true} placeholder="Enter City" title="Your City" />
        <FormField
          isTitle={true}
          placeholder="Enter Cuntry"
          title="Your Country"
        />
        <View className="pt-6">
          <PrimaryButton onPress={() => {}} text="Save" />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProfile;
