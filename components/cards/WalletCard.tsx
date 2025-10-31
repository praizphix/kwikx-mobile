import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { CURRENCY_SYMBOLS, Wallet } from '@/types/database';

// Placeholder for flag assets. When you add flag images, we can map them here.
const currencyAssets: Record<Wallet['currency'], { flag: any | null }> = {
  NGN: { flag: null }, // e.g., require('@/assets/images/ngn-flag.png')
  CFA: { flag: null },
  USDT: { flag: null },
};

const formatWalletId = (id: string) => {
  const parts = id.split('-');
  return `•••• ${parts[parts.length - 1].slice(-4)}`;
};

const WalletCard = ({ wallet }: { wallet: Wallet }) => {
  const handlePress = () => {
    router.push({ 
      pathname: '/(screens)/WalletDetail', 
      params: { 
        walletId: wallet.id, 
        currency: wallet.currency, 
        balance: wallet.balance, 
        available_balance: wallet.available_balance 
      },
    });
  };

  return (
    <Pressable onPress={handlePress} className="bg-white dark:bg-darkN20 rounded-2xl p-6 w-80 h-48 mr-4 flex-col justify-between shadow-md">
      {/* Top Section: Currency Info */}
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-n40 dark:bg-darkN40 mr-4 flex items-center justify-center">
          {/* When flag assets are available, they will be rendered here. */}
          <ThemedText className="text-primary dark:text-white" weight="bold">{wallet.currency[0]}</ThemedText>
        </View>
        <View>
          <ThemedText className="text-lg text-n900 dark:text-white" weight="semiBold">
            {wallet.currency} Wallet
          </ThemedText>
          <ThemedText className="text-sm text-n500 dark:text-darkN500">
            {formatWalletId(wallet.id)}
          </ThemedText>
        </View>
      </View>

      {/* Bottom Section: Balance */}
      <View>
        <ThemedText className="text-sm text-n500 dark:text-darkN500">Available Balance</ThemedText>
        <ThemedText className="text-3xl text-n900 dark:text-white mt-1" weight="bold">
          {CURRENCY_SYMBOLS[wallet.currency]}{wallet.available_balance.toLocaleString()}
        </ThemedText>
      </View>
    </Pressable>
  );
};

export default WalletCard;
