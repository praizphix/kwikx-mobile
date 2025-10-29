import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";
import { PhTrash } from "@/assets/icons/Trash";
import { PhScan } from "@/assets/icons/Scan";
import { PhWhatsappLogo } from "@/assets/icons/WhatsApp";
import { PhChatsTeardrop } from "@/assets/icons/ChatsTeardrop";
import userImg from "@/assets/images/contact-user.png";
import { PhPhoneCall } from "@/assets/icons/PhoneCall";
import { PhVideoCamera } from "@/assets/icons/VideoCamera";
import modalWhiteBg from "@/assets/images/rounded-modal-white-bg.png";
import modalBlackBg from "@/assets/images/rounded-modal-black-bg.png";
import PrimaryButton from "@/components/PrimaryButton";
import { router } from "expo-router";

const ContactDetails = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <View>
      <ScrollView className="bg-g300 dark:bg-darkG300  pt-6 min-h-dvh">
        <PageTitle title="" />
        <View className="bg-white mt-32 py-7 px-6 rounded-t-3xl flex flex-col gap-4 relative flex-1 dark:bg-n0">
          <View className="flex justify-center items-center -mt-24 flex-col text-center pb-8 border-b border-dashed border-n40 dark:border-darkN40">
            <View className="bg-g300 p-1.5 rounded-full">
              <Image source={userImg} />
            </View>
            <View className="pt-6">
              <ThemedText
                className="text-2xl text-center dark:text-white"
                text="Alex Avalos"
                weight="semiBold"
              />
              <ThemedText
                className="pt-1 text-n500 dark:text-darkN500 text-sm text-center"
                text="+546 541 453 453"
              />

              <View className="pt-4 flex-row justify-center items-center gap-x-3">
                <View className="flex justify-center items-center p-1.5 rounded-md bg-g300  ">
                  <PhWhatsappLogo color="white" size="24px" />
                </View>
                <View className="flex justify-center items-center p-1.5 rounded-md bg-[#5AA4E9] text-white ">
                  <PhPhoneCall color="white" size="24px" />
                </View>
                <View className="flex justify-center items-center p-1.5 rounded-md bg-o300 text-white ">
                  <PhVideoCamera color="white" size="24px" />
                </View>
                <View className="flex justify-center items-center p-1.5 rounded-md bg-n40 dark:bg-darkN40 text-white ">
                  <PhChatsTeardrop color="#328B64" size="24px" />
                </View>
              </View>
            </View>
          </View>

          <View className="flex flex-col gap-4 pt-8">
            <View className="p-4 rounded-2xl border border-n40 dark:border-darkN40 flex-row justify-between items-center">
              <View className="">
                <ThemedText
                  className=" dark:text-white"
                  text="Mobile"
                  weight="semiBold"
                />
                <ThemedText
                  className="pt-1 text-n500 dark:text-darkN500 text-sm"
                  text="+546 541 453"
                />
              </View>
              <View className="flex-row justify-center items-center gap-x-3">
                <View className="flex justify-center items-center p-1.5 rounded-md bg-g300  ">
                  <PhWhatsappLogo color="white" size="24px" />
                </View>

                <View className="flex justify-center items-center p-1.5 rounded-md bg-bgColor text-g300 dark:bg-darkN40 ">
                  <PhChatsTeardrop color="#328B64" size="24px" />
                </View>
              </View>
            </View>
            <View className="p-4 rounded-2xl border border-n40 dark:border-darkN40 flex-row justify-between items-center">
              <View className="">
                <ThemedText
                  className="dark:text-white"
                  text="Work"
                  weight="semiBold"
                />
                <ThemedText
                  className="pt-1 text-n500 dark:text-darkN500 text-sm"
                  text="+546 541 453"
                />
              </View>
              <View className="flex-row justify-center items-center gap-x-3">
                <View className="flex justify-center items-center p-1.5 rounded-md bg-g300  ">
                  <PhWhatsappLogo color="white" size="24px" />
                </View>

                <View className="flex justify-center items-center p-1.5 rounded-md bg-bgColor text-g300 dark:bg-darkN40 ">
                  <PhChatsTeardrop color="#328B64" size="24px" />
                </View>
              </View>
            </View>
            <View className="p-4 rounded-2xl border border-n40 dark:border-darkN40 flex-row justify-between items-center">
              <View className="">
                <ThemedText
                  className="dark:text-white"
                  text="Home"
                  weight="semiBold"
                />
                <ThemedText
                  className="pt-1 text-n500 dark:text-darkN500 text-sm"
                  text="+546 541 453"
                />
              </View>
              <View className="flex-row justify-center items-center gap-x-3">
                <View className="flex justify-center items-center p-1.5 rounded-md bg-bgColor text-g300 dark:bg-darkN40 ">
                  <PhWhatsappLogo color="#328B64" size="24px" />
                </View>
              </View>
            </View>
          </View>

          <View className="py-16 flex-row justify-center items-center gap-x-5">
            <View className="flex flex-col gap-1 text-center justify-center items-center">
              <View className="flex justify-center items-center p-1.5 rounded-md bg-bgColor text-g300 dark:bg-darkN40 ">
                <PhScan color="#328B64" size="24px" />
              </View>
              <ThemedText
                className="text-sm dark:text-white "
                text="Location"
                weight="medium"
              />
            </View>
            <Pressable
              onPress={() => router.push("/OpenCamera")}
              className="flex flex-col gap-1 text-center justify-center items-center"
            >
              <View className="flex justify-center items-center p-1.5 rounded-md bg-bgColor text-g300 dark:bg-darkN40 ">
                <PhScan color="#328B64" size="24px" />
              </View>
              <ThemedText
                className="text-sm dark:text-white "
                text="QR Code"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              className="flex flex-col gap-1 text-center justify-center items-center "
            >
              <View className="flex justify-center items-center p-1.5 rounded-md bg-red-100 dark:bg-darkN40 text-red-500 ">
                <PhTrash color="#ef4444" type="fill" size="24px" />
              </View>
              <ThemedText
                className="text-sm dark:text-white"
                text="Delete"
                weight="medium"
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/30 flex justify-end items-center"
        }
        style={[
          {
            opacity: showDeleteModal ? 1 : 0,
            zIndex: showDeleteModal ? 60 : -60,
          },
        ]}
        pointerEvents={showDeleteModal ? "auto" : "none"}
      >
        <View className="rounded-2xl bg-white dark:bg-n0 w-full pb-12 px-6">
          <View className="absolute bottom-0 left-0 right-0">
            <Image source={modalWhiteBg} className="flex dark:hidden" />
            <Image source={modalBlackBg} className="hidden dark:flex" />
          </View>
          <ThemedText
            className="text-2xl text-g300 text-center px-12 pb-5 border-b border-dashed border-n40 dark:border-darkN40"
            text="Delete Contact"
            weight="semiBold"
          />
          <ThemedText
            className="text-center text-n500 dark:text-darkN500 pt-4"
            text="Decline request $250 from Ronald Richards?"
          />

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton
              onPress={() => setShowDeleteModal(false)}
              text="Cancel"
              isSecondary={true}
            />
            <PrimaryButton onPress={() => {}} text="Yes, Delete" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ContactDetails;
