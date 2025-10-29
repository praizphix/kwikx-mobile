import { Image, Pressable, ScrollView, View } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import userImg from "@/assets/images/nayeem.png";
import { PhQrCode } from "@/assets/icons/QrCode";
import { PhCaretRight } from "@/assets/icons/CaretRight";
import { settingsLists } from "@/constants/data";
import { PhSun } from "@/assets/icons/PhSun";
import { PhSignOut } from "@/assets/icons/SignOut";
import DarkModeSwitch from "@/components/ui/DarkModeSwitch";
import { useRouter } from "expo-router";
import Animated from "react-native-reanimated";
import PrimaryButton from "@/components/PrimaryButton";
import modalWhiteBg from "@/assets/images/rounded-modal-white-bg.png";
import modalBlackBg from "@/assets/images/rounded-modal-black-bg.png";
import qrCodeDark from "@/assets/images/qr-code.png";
import qrCodeWhite from "@/assets/images/qr-code-white.png";

const Account = () => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  return (
    <View>
      <ScrollView className="bg-white dark:bg-n0  pt-4 ">
        <ThemedText
          className={`text-2xl text-center dark:text-white`}
          text="Account"
          weight="semiBold"
        />
        <View className="flex-row justify-between items-center bg-g300 p-6 rounded-2xl  mx-6 mt-6">
          <View className="flex-row justify-start items-center gap-x-4">
            <Image
              source={userImg}
              className="size-16 rounded-full bg-yellow-400"
            />
            <View className="">
              <ThemedText
                className="text-xl text-white"
                text="Nayeem Khan "
                weight="semiBold"
              />
              <ThemedText className="pt-1 text-white" text="example@mail.com" />
            </View>
          </View>
          <Pressable
            onPress={() => setShowQrModal(true)}
            className=" size-11 rounded-full bg-white flex justify-center items-center "
          >
            <PhQrCode color="#090909" size="20px" />
          </Pressable>
        </View>
        <View className="pt-8 flex flex-col gap-y-5 pb-40">
          {settingsLists.map(({ id, icon, name, link }, idx) => (
            <Pressable
              key={`${id}`}
              onPress={() => router.push(link as any)}
              className={`flex-row justify-between items-center  px-6 pb-5 border-b border-dashed border-n40 dark:border-darkN40`}
            >
              <View className="flex-row justify-start items-center gap-x-4 flex-1">
                <View className="size-11 rounded-full border border-bgColor2 flex justify-center items-center bg-bgColor text-g300 dark:bg-n0 dark:border-darkN40">
                  {React.createElement(icon, {
                    color: "#328B64",
                    size: "20px",
                  })}
                </View>
                <ThemedText
                  className="text-lg dark:text-white"
                  text={name}
                  weight="semiBold"
                />
              </View>
              <PhCaretRight color="#A6A6A6" size="20px" />
            </Pressable>
          ))}
          <View
            className={`flex-row justify-between items-center  px-6 pb-5 border-b border-dashed border-n40 dark:border-darkN40`}
          >
            <View className="flex-row justify-start items-center gap-x-4">
              <View className="size-11 rounded-full border border-bgColor2 flex justify-center items-center bg-bgColor text-g300 dark:bg-n0 dark:border-darkN40">
                <PhSun color="#328B64" size="20px" />
              </View>
              <ThemedText
                className="text-lg dark:text-white"
                text="Dark Mode"
                weight="semiBold"
              />
            </View>
            <Pressable className="">
              <DarkModeSwitch />
            </Pressable>
          </View>
          <Pressable
            onPress={() => setShowLogoutModal(true)}
            className={`flex-row justify-between items-center  px-6`}
          >
            <View className="flex-row justify-start items-center gap-x-4">
              <View className="size-11 rounded-full border border-bgColor2 flex justify-center items-center bg-bgColor text-g300 dark:bg-n0 dark:border-darkN40">
                <PhSignOut color="#328B64" size="20px" />
              </View>
              <ThemedText
                className="text-lg text-g300"
                text="Logout"
                weight="semiBold"
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
      <View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/30 flex justify-end items-center"
        }
        style={[
          {
            opacity: showLogoutModal ? 1 : 0,
            zIndex: showLogoutModal ? 60 : -60,
          },
        ]}
        pointerEvents={showLogoutModal ? "auto" : "none"}
      >
        <View className="rounded-2xl bg-white dark:bg-n0 w-full pb-12 px-6">
          <View className="absolute bottom-0 left-0 right-0">
            <Image source={modalWhiteBg} className="flex dark:hidden" />
            <Image source={modalBlackBg} className="hidden dark:flex" />
          </View>
          <ThemedText
            className="text-2xl text-g300 text-center px-12 pb-5 border-b border-dashed border-n40 dark:border-darkN40"
            text="Logout"
            weight="semiBold"
          />
          <ThemedText
            className="text-center text-n500 dark:text-darkN500 pt-4"
            text="Do you want to logout?"
          />

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton
              onPress={() => setShowLogoutModal(false)}
              text="Cancel"
            />
            <PrimaryButton
              onPress={() => router.push("/SignIn")}
              text="Yes, Logout"
              isSecondary={true}
            />
          </View>
        </View>
      </View>

      {/* Qr Code Modal Start */}
      <View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/30 flex justify-end items-center"
        }
        style={[
          {
            opacity: showQrModal ? 1 : 0,
            zIndex: showQrModal ? 60 : -60,
          },
        ]}
        pointerEvents={showQrModal ? "auto" : "none"}
      >
        <View className="rounded-t-2xl bg-white dark:bg-n0 w-full py-12 px-6">
          <ThemedText
            className="text-2xl text-g300 text-center px-12 pb-5 border-b border-dashed border-n40 dark:border-darkN40"
            text="My QR Code"
            weight="semiBold"
          />
          <View className="bg-n20 p-6 rounded-xl dark:bg-darkN20 mt-6">
            <Image source={qrCodeDark} className="flex dark:hidden" />
            <Image source={qrCodeWhite} className="hidden dark:flex" />
          </View>

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton
              onPress={() => setShowQrModal(false)}
              text="Cancel"
              isSecondary={true}
            />
          </View>
        </View>
      </View>
      {/* Qr Code Modal End */}
    </View>
  );
};

export default Account;
