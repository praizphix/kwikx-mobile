import React, { useState, useEffect } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { calculateTotalBalance } from '../../data/mockData';
import { Wallet } from '../../types';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    fetchUserWallets();
  }, []);

  const fetchUserWallets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use Edge Function to get fresh wallet data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-wallets`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Error fetching wallets for header:', data.error);
        return;
      }

      const wallets = data.data || [];
      console.log('Header: Fresh data retrieved:', wallets.length, 'wallets');

      setUserWallets(wallets);
      setTotalBalance(calculateTotalBalance(wallets));
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#00454a] to-[#005c63] shadow-md">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side with menu icon */}
        <div className="flex items-center">
          <button
            className="md:hidden text-white focus:outline-none mr-2"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Center for mobile - total balance */}
        <div className="md:hidden flex flex-col items-center">
          <p className="text-xs text-gray-200">Total Balance</p>
          <p className="text-white font-semibold">USDT {totalBalance.toFixed(2)}</p>
        </div>

        {/* Right side with notifications and profile */}
        <div className="flex items-center space-x-4">
          <button className="text-white focus:outline-none relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#eeb83b]"></span>
          </button>
          <div className="flex items-center text-white">
            <div className="h-8 w-8 rounded-full bg-[#eeb83b] flex items-center justify-center">
              <User size={18} className="text-[#00454a]" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop - Exchange rates and total balance */}
      <div className="hidden md:flex justify-between items-center px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center">
            <span className="text-gray-500">NGN/USDT:</span>
            <span className="ml-1 font-medium">1500</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">CFA/USDT:</span>
            <span className="ml-1 font-medium">600</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500">NGN/CFA:</span>
            <span className="ml-1 font-medium">3.65</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">Total Balance:</span>
          <span className="font-semibold text-[#00454a]">USDT {totalBalance.toFixed(2)}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;