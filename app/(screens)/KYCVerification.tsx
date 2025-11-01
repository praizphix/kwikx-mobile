import { ScrollView, View, Alert, ActivityIndicator, Pressable, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import PageTitle from "@/components/ui/PageTitle";
import { marginLeftRight } from "@/styles/styles";
import FormField from "@/components/formField/FormField";
import PrimaryButton from "@/components/PrimaryButton";
import ThemedText from "@/components/ThemedText";
import { getCurrentUser, getUserProfile } from "@/services/auth";
import { submitKYCDocuments } from "@/services/kyc";
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { FileArrowUp } from "@/assets/icons/FileArrowUp";
import { Check } from "@/assets/icons/Check";
import { useColorScheme } from "nativewind";

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const KYCVerification = () => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [kycStatus, setKycStatus] = useState<string>("");

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");

  // Address Information
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  // Document Information
  const [documentType, setDocumentType] = useState<'passport' | 'national_id' | 'drivers_license'>('national_id');
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentFile, setDocumentFile] = useState<any>(null);
  const [proofOfAddressFile, setProofOfAddressFile] = useState<any>(null);
  const [selfieFile, setSelfieFile] = useState<any>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

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
        setAddress(prev => ({ ...prev, country: profile.country || "" }));
        setKycStatus(profile.kyc_status);

        if (profile.kyc_status === 'verified') {
          Alert.alert(
            "Already Verified",
            "Your KYC is already verified. You can now use all features.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async (type: 'id' | 'address' | 'selfie') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert("File Too Large", "Please select a file smaller than 5MB");
        return;
      }

      if (type === 'id') setDocumentFile(file);
      else if (type === 'address') setProofOfAddressFile(file);
      else if (type === 'selfie') setSelfieFile(file);

    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const validateForm = () => {
    if (!fullName || !dateOfBirth || !phone || !nationality) {
      Alert.alert("Missing Information", "Please fill in all personal information fields");
      return false;
    }

    if (!address.street || !address.city || !address.state || !address.postalCode || !address.country) {
      Alert.alert("Missing Address", "Please fill in all address fields");
      return false;
    }

    if (!documentNumber) {
      Alert.alert("Missing Document Number", "Please enter your document number");
      return false;
    }

    if (!documentFile) {
      Alert.alert("Missing Document", "Please upload your ID document");
      return false;
    }

    if (!proofOfAddressFile) {
      Alert.alert("Missing Proof of Address", "Please upload a proof of address (utility bill, bank statement)");
      return false;
    }

    if (!selfieFile) {
      Alert.alert("Missing Selfie", "Please upload a selfie holding your ID document");
      return false;
    }

    return true;
  };

  const handleSubmitKYC = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await submitKYCDocuments(userId, {
        fullName,
        dateOfBirth,
        phone,
        nationality,
        address,
        documentType,
        documentNumber,
        documentFile,
        proofOfAddressFile,
        selfieFile,
      });

      Alert.alert(
        "KYC Submitted Successfully",
        "Your documents have been submitted for verification. This usually takes 24-48 hours. You will be notified once your account is verified.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Submission Failed", error.message || "Failed to submit KYC documents");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-n900">
        <ActivityIndicator size="large" color="#0A5344" />
      </View>
    );
  }

  const FileUploadButton = ({
    title,
    file,
    onPress
  }: {
    title: string;
    file: any;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={`border-2 border-dashed rounded-xl p-4 ${
        file ? 'border-primary bg-primary/5' : 'border-n500 dark:border-darkN500'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <ThemedText className="text-n800 dark:text-white font-medium mb-1">
            {title}
          </ThemedText>
          {file ? (
            <ThemedText className="text-primary text-sm">
              {file.name}
            </ThemedText>
          ) : (
            <ThemedText className="text-n500 dark:text-darkN500 text-sm">
              Tap to upload (Max 5MB)
            </ThemedText>
          )}
        </View>
        {file ? (
          <View className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Check color="white" size={20} />
          </View>
        ) : (
          <View className="w-10 h-10 bg-n200 dark:bg-darkN200 rounded-full flex items-center justify-center">
            <FileArrowUp color={colorScheme === 'dark' ? '#fff' : '#0A5344'} size={20} />
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <ScrollView className="bg-white dark:bg-n0 pt-6 min-h-dvh">
      <PageTitle title="Complete KYC Verification" isBgWhite={true} />

      <View style={marginLeftRight} className="flex flex-col gap-y-6 py-6">
        {/* Personal Information Section */}
        <View>
          <ThemedText className="text-lg font-bold text-n800 dark:text-white mb-4">
            Personal Information
          </ThemedText>

          <View className="gap-y-4">
            <FormField
              isTitle={true}
              title="Full Legal Name"
              placeholder="As shown on your ID"
              value={fullName}
              onChangeText={setFullName}
            />
            <FormField
              isTitle={true}
              title="Date of Birth"
              placeholder="DD/MM/YYYY"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
            <FormField
              isTitle={true}
              title="Phone Number"
              placeholder="+234 or +225"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <FormField
              isTitle={true}
              title="Nationality"
              placeholder="Your country of citizenship"
              value={nationality}
              onChangeText={setNationality}
            />
          </View>
        </View>

        {/* Address Information Section */}
        <View>
          <ThemedText className="text-lg font-bold text-n800 dark:text-white mb-4">
            Residential Address
          </ThemedText>

          <View className="gap-y-4">
            <FormField
              isTitle={true}
              title="Street Address"
              placeholder="House number and street name"
              value={address.street}
              onChangeText={(text) => setAddress(prev => ({ ...prev, street: text }))}
            />
            <FormField
              isTitle={true}
              title="City"
              placeholder="City or town"
              value={address.city}
              onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
            />
            <FormField
              isTitle={true}
              title="State/Province"
              placeholder="State or province"
              value={address.state}
              onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
            />
            <FormField
              isTitle={true}
              title="Postal Code"
              placeholder="ZIP or postal code"
              value={address.postalCode}
              onChangeText={(text) => setAddress(prev => ({ ...prev, postalCode: text }))}
            />
            <FormField
              isTitle={true}
              title="Country"
              placeholder="Country of residence"
              value={address.country}
              onChangeText={(text) => setAddress(prev => ({ ...prev, country: text }))}
            />
          </View>
        </View>

        {/* Document Information Section */}
        <View>
          <ThemedText className="text-lg font-bold text-n800 dark:text-white mb-4">
            Identity Document
          </ThemedText>

          <View className="gap-y-4">
            <View>
              <ThemedText className="text-n800 dark:text-white font-medium mb-2">
                Document Type
              </ThemedText>
              <View className="flex-row gap-x-2">
                {(['national_id', 'passport', 'drivers_license'] as const).map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setDocumentType(type)}
                    className={`flex-1 py-3 px-4 rounded-lg border ${
                      documentType === type
                        ? 'border-primary bg-primary/10'
                        : 'border-n500 dark:border-darkN500'
                    }`}
                  >
                    <ThemedText className={`text-center text-sm ${
                      documentType === type ? 'text-primary font-medium' : 'text-n700 dark:text-darkN700'
                    }`}>
                      {type === 'national_id' ? 'National ID' :
                       type === 'passport' ? 'Passport' : 'Driver\'s License'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <FormField
              isTitle={true}
              title="Document Number"
              placeholder="Enter your ID number"
              value={documentNumber}
              onChangeText={setDocumentNumber}
            />

            <FileUploadButton
              title="Upload ID Document"
              file={documentFile}
              onPress={() => pickDocument('id')}
            />
          </View>
        </View>

        {/* Additional Documents Section */}
        <View>
          <ThemedText className="text-lg font-bold text-n800 dark:text-white mb-4">
            Additional Documents
          </ThemedText>

          <View className="gap-y-4">
            <FileUploadButton
              title="Proof of Address"
              file={proofOfAddressFile}
              onPress={() => pickDocument('address')}
            />
            <ThemedText className="text-xs text-n600 dark:text-darkN600 -mt-2">
              Utility bill, bank statement, or government letter (dated within last 3 months)
            </ThemedText>

            <FileUploadButton
              title="Selfie with ID"
              file={selfieFile}
              onPress={() => pickDocument('selfie')}
            />
            <ThemedText className="text-xs text-n600 dark:text-darkN600 -mt-2">
              Clear photo of yourself holding your ID document
            </ThemedText>
          </View>
        </View>

        {/* Important Notice */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <ThemedText className="text-blue-800 dark:text-blue-200 text-sm mb-2" weight="bold">
            Important Information
          </ThemedText>
          <ThemedText className="text-blue-700 dark:text-blue-300 text-xs">
            • All documents must be clear and legible{'\n'}
            • Ensure your full name matches across all documents{'\n'}
            • Verification typically takes 24-48 hours{'\n'}
            • Your wallets will be activated upon approval
          </ThemedText>
        </View>

        {/* Submit Button */}
        <View className="pt-4 pb-8">
          <PrimaryButton
            onPress={handleSubmitKYC}
            text={submitting ? "Submitting..." : "Submit KYC Documents"}
            disabled={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default KYCVerification;
