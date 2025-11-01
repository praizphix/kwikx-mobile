import { Image, Pressable, ScrollView, StyleSheet, View, ActivityIndicator, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
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
import { getCurrentUser, getUserProfile } from "@/services/auth";
import { getUserWallets, getTotalBalance } from "@/services/wallets";
import { CURRENCY_SYMBOLS, Profile } from "@/types/database";
import type { Wallet } from "@/types/database";
import { useColorScheme } from "nativewind";
import WalletCard from "@/components/cards/WalletCard";
import PrimaryButton from "@/components/PrimaryButton";

const KYCGate = ({ status }: { status: Profile['kyc_status'] | null }) => (
  <View className="absolute inset-0 bg-black/50 z-50 flex justify-center items-center p-8">
    <View className="bg-white dark:bg-darkN20 p-6 rounded-2xl w-full items-center">
      <ThemedText className="text-xl dark:text-white text-center" weight="bold">
        {status === 'pending' ? 'Verification Pending' : 'Verify Your Identity'}
      </ThemedText>
      <ThemedText className="text-n500 dark:text-darkN500 text-center mt-2 mb-6">
        {status === 'pending'
          ? 'Your documents are under review. This usually takes 24-48 hours. Your wallets are currently frozen.'
          : 'Complete KYC verification to activate your wallets and start using the app.'}
      </ThemedText>
      {status === 'pending' ? (
        <PrimaryButton
          text="View Status"
          onPress={() => router.push('/(settings-pages)/EditProfile')}
        />
      ) : (
        <PrimaryButton
          text="Start KYC Verification"
          onPress={() => router.push('/KYCVerification')}
        />
      )}
    </View>
  </View>
);

const Home = () => {
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/SignIn");
        return;
      }
      
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);

      if (userProfile?.kyc_status === 'verified') {
        const userWallets = await getUserWallets(user.id);
        setWallets(userWallets);

        const total = await getTotalBalance(user.id);
        setTotalBalance(total);
      } else {
        // Show frozen wallets for non-verified users
        const allWallets = await getUserWallets(user.id, true);
        setWallets(allWallets);
      }

    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView className="bg-bgColor dark:bg-darkG300">
        <View className="px-6 flex-row justify-between items-center pt-6">
          <View className="rounded-full overflow-hidden bg-bgColor2">
            <Image source={user} className="w-12 h-12 object-cover" />
          </View>
          <Image
            source={require('@/assets/images/Untitled design.png')}
            className="w-12 h-12"
            resizeMode="contain"
          />
          <Pressable
            onPress={() => router.push("/Notifications")}
            className="border border-n500 !leading-none flex-row justify-center items-center rounded-full w-12 h-12 bg-white dark:bg-darkN20"
          >
            <View className="absolute top-0 right-0 bg-bgColor rounded-full w-3 h-3 flex justify-center items-center dark:bg-n0">
              <View className="w-2 h-2 rounded-full bg-red-500"></View>
            </View>
            <PhBell color={colorScheme === 'dark' ? 'white' : '#0A5344'} size="22px" type="fill" />
          </Pressable>
        </View>

        {loading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#0A5344" />
          </View>
        ) : (
          <>
            <View className="text-center flex justify-between items-center flex-col py-8">
              <View className="flex-row">
                <ThemedText
                  className="text-[52px] flex justify-start -mt-3 dark:text-white"
                  text={totalBalance.toLocaleString()}
                  weight="bold"
                />
                <ThemedText className="text-xl text-primary dark:text-accent" text=" FCFA" weight="bold" />
              </View>

              <ThemedText
                className="text-n500 dark:text-darkN500"
                text="Total Balance"
              />
            </View>

            <View className="mb-4">
              <ThemedText
                className="text-sm text-n500 dark:text-darkN500 mb-3 px-6"
                text="Your Wallets"
                weight="semiBold"
              />
              <FlatList
                data={wallets}
                renderItem={({ item }) => <WalletCard wallet={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
              />
            </View>
          </>
        )}

        <View className="px-6 relative z-20">
          <View className="flex-row gap-x-3 justify-start items-center">
            <Pressable
              onPress={() => router.push("/Exchange")}
              className="bg-accent/20 dark:bg-darkN20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 dark:bg-darkN40 flex justify-center items-center">
                <Image source={icon1} className="w-4 h-4" />
              </View>
              <ThemedText
                className="pt-3 text-center text-n500 dark:text-white text-sm"
                text="Exchange"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/DepositMoney")}
              className="bg-primary/20 dark:bg-darkN20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 dark:bg-darkN40 flex justify-center items-center">
                <Image source={icon2} className="w-4 h-4" />
              </View>
              <ThemedText
                className="pt-3 text-center text-n500 dark:text-white text-sm"
                text="Deposit"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/WithdrawMoney")}
              className="bg-yellow-200 dark:bg-darkN20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 dark:bg-darkN40 flex justify-center items-center">
                <Image source={icon3} className="w-4 h-4" />
              </View>

              <ThemedText
                className="pt-3 text-center text-n500 dark:text-white text-sm"
                text="Withdraw"
                weight="medium"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/TopUpMoney")}
              className="bg-primary/10 dark:bg-darkN20 rounded-2xl py-4 flex-1 max-w-[85px] flex flex-col justify-center items-center shrink-0"
            >
              <View className="h-8 w-8 rounded-full bg-n0 dark:bg-darkN40 flex justify-center items-center">
                <Image source={icon2} className="w-4 h-4" />
              </View>

              <ThemedText
                className="pt-3 text-center text-n500 dark:text-white text-sm"
                text="Top Up"
                weight="medium"
              />
            </Pressable>
          </View>
        </View>
        <View className="bg-white rounded-t-3xl pt-14 -mt-14 flex-1 pb-32 dark:bg-darkN20">
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
              <View>
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
                  className="text-primary dark:text-accent text-sm"
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
      {profile && profile.kyc_status !== 'verified' && <KYCGate status={profile.kyc_status} />}
    </View>
  );
};

export default Home;
