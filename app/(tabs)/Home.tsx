import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { PhBell } from "@/assets/icons/BellIcon";
import user from "@/assets/images/nayeem.png";
import ThemedText from "@/components/ThemedText";
import icon1 from "@/assets/images/icon1.png";
import icon2 from "@/assets/images/icon2.png";
import icon3 from "@/assets/images/icon3.png";
import payBillIllus from "@/assets/images/pay-bill-illus.png";
import { PhArrowRight } from "@/assets/icons/ArrowRight";
import { router } from "expo-router";
import { transactionsList } from "@/constants/data";
import TransactionItemCard from "@/components/cards/TransactionItemCard";

const Home = () => {
  return (
    <View>
      <ScrollView className="bg-bgColor dark:bg-darkG300">
        <View className="px-6 flex-row justify-between items-center pt-6">
          <View className="rounded-full  overflow-hidden bg-bgColor2">
            <Image source={user} className="w-12 h-12 object-cover" />
          </View>

          <Image
            source={require('@/assets/images/Untitled design.png')}
            className="w-12 h-12"
            resizeMode="contain"
          />

          <Pressable
            onPress={() => router.push("/Notifications")}
            className="  border border-n500 !leading-none flex-row justify-center items-center rounded-full w-12 h-12 bg-white dark:bg-n0"
          >
            <View className="absolute top-0 right-0 bg-bgColor rounded-full w-3 h-3 flex justify-center items-center dark:bg-n0">
              <View className="w-2 h-2 rounded-full bg-red-500"></View>
            </View>
            <PhBell color="#328B64" size="22px" type="fill" />
          </Pressable>
        </View>

        <View className="text-center flex justify-between items-center flex-col py-8">
          <View className="flex-row">
            <ThemedText
              className="text-[52px] flex justify-start -mt-3 dark:text-white"
              text="7,895"
              weight="bold"
            />
            <ThemedText className="text-xl text-g300" text="$" weight="bold" />
          </View>

          <ThemedText
            className="text-n500 dark:text-darkN500"
            text="Your Balance"
          />
        </View>
        <View className="px-6 relative z-20">
          <View className="flex-row gap-x-3 justify-start items-center">
            <Pressable
              onPress={() => router.push("/Exchange")}
              className="bg-accent/20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 flex justify-center items-center">
                <Image source={icon1} className="w-4 h-4" />
              </View>
              <ThemedText
                className="pt-3 text-center dark:text-n0 text-sm"
                text="Exchange"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/DepositMoney")}
              className="bg-primary/20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 flex justify-center items-center">
                <Image source={icon2} className="w-4 h-4" />
              </View>
              <ThemedText
                className="pt-3 text-center dark:text-n0 text-sm"
                text="Deposit"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/WithdrawMoney")}
              className="bg-yellow-200 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 flex justify-center items-center">
                <Image source={icon3} className="w-4 h-4" />
              </View>

              <ThemedText
                className="pt-3 text-center dark:text-n0 text-sm"
                text="Withdraw"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/TopUpMoney")}
              className="bg-primary/10 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 flex justify-center items-center">
                <Image source={icon2} className="w-4 h-4" />
              </View>

              <ThemedText
                className="pt-3 text-center dark:text-n0 text-sm"
                text="Top Up"
                weight="medium"
              />
            </Pressable>
          </View>
        </View>
        <View className="bg-white rounded-t-3xl pt-14 -mt-14 flex-1 pb-32 dark:bg-n0">
          <View className="px-6 pt-8">
            <Pressable
              onPress={() => router.push("/BillPay")}
              className="bg-primary rounded-2xl py-5 px-6 flex-row justify-between items-center"
            >
              <View className="w-1/2">
                <ThemedText
                  className="text-white text-xl "
                  text="Pay Your Bill Uitility Packages"
                  weight="semiBold"
                />

                <ThemedText
                  className="text-white text-xs py-1.5"
                  text="Featured Special From $320"
                />

                <PhArrowRight color="white" size="20px" />
              </View>
              <View className="">
                <Image source={payBillIllus} />
              </View>
            </Pressable>
          </View>

          <View className="px-6 pt-8">
            <View className="flex-row justify-between items-center">
              <ThemedText
                className="text-xl dark:text-white"
                text="Recent Transaction"
                weight="semiBold"
              />
              <Pressable
                onPress={() => router.push("/TransactionHistory")}
                className=""
              >
                <ThemedText
                  className="text-primary  text-sm"
                  text=" View All"
                  weight="semiBold"
                />
              </Pressable>
            </View>

            <View className="flex flex-col gap-4 pt-6">
              {transactionsList
                .slice(0, 1)
                .map(({ id, date, transactions }) => (
                  <View key={`${id}`} className="flex-col gap-y-4">
                    {transactions.map(({ id, ...props }, idx) => (
                      <TransactionItemCard
                        key={`${id}`}
                        length={transactions.length}
                        idx={idx}
                        {...props}
                      />
                    ))}
                  </View>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
