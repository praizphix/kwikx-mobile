import { ScrollView, View, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import PrimaryButton from "@/components/PrimaryButton";
import { getCurrentUser, getUserProfile, updateUserProfile } from "@/services/auth";
import { router } from "expo-router";

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/SignIn");
          return;
        }
        setUserId(user.id);

        const profile = await getUserProfile(user.id);
        if (profile) {
          setFullName(profile.full_name || "");
          setPhone(profile.phone || "");
          setCountry(profile.country || "");
        }
      } catch (error: any) {
        Alert.alert("Error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!fullName || !phone || !country) {
      Alert.alert("Missing Information", "Please fill out all fields to proceed with KYC.");
      return;
    }
    
    setSaving(true);
    try {
      await updateUserProfile(userId, { full_name: fullName, phone, country });
      Alert.alert("Profile Submitted", "Your information has been submitted for verification.");
      router.back();
    } catch (error: any) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-n900">
        <ActivityIndicator size="large" color="#0A5344" />
      </View>
    );
  }

  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Complete Your Profile (KYC)" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-4 py-6">
        <FormField
          isTitle={true}
          title="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />
        <FormField
          isTitle={true}
          title="Phone Number"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <FormField
          isTitle={true}
          title="Country"
          placeholder="Enter your country"
          value={country}
          onChangeText={setCountry}
        />
        <View className="pt-6">
          <PrimaryButton onPress={handleUpdateProfile} text={saving ? "Saving..." : "Save and Submit for KYC"} disabled={saving} />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProfile;
