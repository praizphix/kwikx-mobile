import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import ThemedText from "@/components/ThemedText";
import people from "@/assets/images/people-4.png";
import PageTitle from "@/components/ui/PageTitle";
import { PhCopy } from "@/assets/icons/Copy";
import PrimaryButton from "@/components/PrimaryButton";
import { marginLeftRight } from "@/styles/styles";
import modalWhiteBg from "@/assets/images/rounded-modal-white-bg.png";
import modalBlackBg from "@/assets/images/rounded-modal-black-bg.png";
import { PhUser } from "@/assets/icons/User";

const IncomingRequest = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  return (
    <View>
      <ScrollView className="bg-white dark:bg-n0 pt-6 h-full">
        <PageTitle title="Incoming Request" isBgWhite={true} />
        <View className="pb-8 flex justify-center items-center flex-col">
          <View className="rounded-full overflow-hidden bg-g300">
            <Image
              source={people}
              className="w-[140px] h-[140px] object-cover"
            />
          </View>
          <View className="flex-row">
            <ThemedText
              className="text-[52px] font-bold flex justify-start pt-2 dark:text-white"
              text="$125.00"
              weight="bold"
            />
            <ThemedText
              className="text-xl text-g300 pt-4"
              text="$"
              weight="bold"
            />
          </View>

          <ThemedText
            className="text-sm  pt-3 dark:text-white"
            text="You sent to Kristin Watson"
            weight="semiBold"
          />
          <ThemedText
            className="text-sm text-n500 dark:text-darkN500 pt-2"
            text="michael.mitc@example.com"
          />
        </View>
        <View className="bg-n20 border border-n40 dark:bg-darkN20 dark:border-darkN40 flex flex-col gap-5 p-4 mx-6 rounded-2xl">
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="You sent"
            />
            <ThemedText
              className="text-sm font-medium text-g300"
              text="$125.00"
              weight="medium"
            />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="To"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="Kristin Watson"
            />
          </View>

          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Email"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="clinton.mcclure@gmail.com"
            />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Payment method"
            />
            <ThemedText className="text-sm dark:text-white" text="MasterCard" />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Date"
            />
            <ThemedText
              className="text-sm dark:text-white"
              text="Dec 24, 2023 09:40 AM"
            />
          </View>
          <View className="flex-row justify-between items-center pb-5 border-b border-dashed border-n40 dark:border-darkN40">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Transaction ID"
            />
            <View className="flex-row">
              <ThemedText
                className="text-sm dark:text-white"
                text="241220230940"
              />

              <PhCopy color="" />
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <ThemedText
              className="text-sm text-n500 dark:text-darkN500"
              text="Reference ID"
            />
            <View className="flex-row">
              <ThemedText className="text-sm dark:text-white" text="H37SK7D9" />

              <PhCopy color="" />
            </View>
          </View>
        </View>
        <View className="pt-4 px-6">
          <View className="bg-bgColor border border-bgColor2 rounded-2xl p-4 dark:bg-darkN20 dark:border-darkN40">
            <ThemedText
              className="text-sm pb-4 border-b border-dashed border-n40 dark:border-darkN40 dark:text-white"
              text="Notes :"
              weight="medium"
            />

            <ThemedText
              className="text-n500 dark:text-darkN500 text-sm pt-4"
              text="Hi Jenny Wilson, now i send you $125, P/S: try your best"
            />
          </View>
        </View>
        <View
          className="pt-6 pb-12 flex-row justify-between items-center gap-x-4"
          style={marginLeftRight}
        >
          <PrimaryButton
            onPress={() => setShowCancelModal(true)}
            text="Decline"
            isSecondary={true}
          />
          <PrimaryButton
            onPress={() => setShowAcceptModal(true)}
            text="Accept Request"
          />
        </View>
      </ScrollView>

      {/* Canecl Modal Start */}
      <View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/30 flex justify-end items-center"
        }
        style={[
          {
            opacity: showCancelModal ? 1 : 0,
            zIndex: showCancelModal ? 60 : -60,
          },
        ]}
        pointerEvents={showCancelModal ? "auto" : "none"}
      >
        <View className="rounded-2xl bg-white dark:bg-n0 w-full pb-12 px-6">
          <View className="absolute bottom-0 left-0 right-0">
            <Image source={modalWhiteBg} className="flex dark:hidden" />
            <Image source={modalBlackBg} className="hidden dark:flex" />
          </View>
          <ThemedText
            className="text-2xl text-g300 text-center px-12 pb-5 border-b border-dashed border-n40 dark:border-darkN40"
            text="Decline Request"
            weight="semiBold"
          />
          <ThemedText
            className="text-center text-n500 dark:text-darkN500 pt-4"
            text="Decline request $250 from Ronald Richards?"
          />

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton
              onPress={() => setShowCancelModal(false)}
              text="Cancel"
              isSecondary={true}
            />
            <PrimaryButton onPress={() => {}} text="Yes, Cancel" />
          </View>
        </View>
      </View>
      {/* Canecl Modal End */}

      {/* Accept Modal Start */}
      <View
        className={
          "absolute inset-0 bg-black/60 dark:bg-white/30 flex justify-end items-center"
        }
        style={[
          {
            opacity: showAcceptModal ? 1 : 0,
            zIndex: showAcceptModal ? 60 : -60,
          },
        ]}
        pointerEvents={showAcceptModal ? "auto" : "none"}
      >
        <View className="rounded-2xl bg-white dark:bg-n0 w-full py-12 px-6">
          <ThemedText
            className="text-2xl text-g300 text-center px-12 pb-5 border-b border-dashed border-n40 dark:border-darkN40"
            text="Accept Request"
            weight="semiBold"
          />

          <View className="mt-8 p-6 border border-bgColor2 bg-bgColor dark:border-darkN40 dark:bg-darkN20 justify-center items-center rounded-xl flex-col">
            <ThemedText
              className="border-b pb-4 w-full text-center dark:text-white border-n40  dark:border-darkN40 border-dashed"
              text="Amount requested"
            />

            <View className="flex-row justify-center items-center">
              <ThemedText
                className="text-[52px] flex justify-start pt-2 dark:text-white"
                text="$125.00"
                weight="bold"
              />
              <ThemedText className="text-xl text-g300 pb-3" text="$" />
            </View>
          </View>

          <View className=" pt-8">
            <ThemedText
              className=" pb-3 text-start dark:text-white"
              text="Send to"
              weight="semiBold"
            />
            <View className="p-4 rounded-2xl border border-n40 flex flex-col gap-4 dark:border-darkN40">
              <View className="flex-row justify-between items-center">
                <View className="flex-row justify-start items-center gap-x-4">
                  <View className="rounded-full bg-bgColor2 object-cover overflow-hidden ">
                    <Image source={people} className=" w-[60px] h-[60px]" />
                  </View>
                  <View className="text-start">
                    <ThemedText
                      className=" dark:text-white"
                      text="Esther Howard"
                      weight="semiBold"
                    />
                    <ThemedText
                      className="text-n500 dark:text-darkN500 text-xs pt-2.5"
                      text="debbie.baker@example.com"
                    />
                  </View>
                </View>
                <View className="">
                  <PhUser color="#A6A6A6" size="24px" />
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center gap-x-4 pt-5">
            <PrimaryButton
              onPress={() => setShowAcceptModal(false)}
              text="Cancel"
              isSecondary={true}
            />
            <PrimaryButton onPress={() => {}} text="Send Money" />
          </View>
        </View>
      </View>
      {/* Accept Modal End */}
    </View>
  );
};

export default IncomingRequest;

const styles = StyleSheet.create({});
