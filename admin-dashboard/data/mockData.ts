export const exchangeRates = [
  { id: '1', from: 'USDT', to: 'XOF', rate: 650, change: '+2.5%', lastUpdated: '2 mins ago' },
  { id: '2', from: 'USDC', to: 'XOF', rate: 649, change: '+2.3%', lastUpdated: '5 mins ago' },
  { id: '3', from: 'BTC', to: 'XOF', rate: 32500000, change: '+5.2%', lastUpdated: '1 min ago' },
  { id: '4', from: 'ETH', to: 'XOF', rate: 1950000, change: '+3.8%', lastUpdated: '3 mins ago' },
];

export const notifications = [
  {
    id: '1',
    title: 'New KYC Submission',
    message: 'User John Doe submitted KYC documents',
    time: '5 mins ago',
    read: false,
    type: 'kyc',
  },
  {
    id: '2',
    title: 'Large Transaction Alert',
    message: 'Transaction of 50,000 XOF detected',
    time: '15 mins ago',
    read: false,
    type: 'transaction',
  },
  {
    id: '3',
    title: 'System Update',
    message: 'System maintenance scheduled for tonight',
    time: '1 hour ago',
    read: true,
    type: 'system',
  },
];

export const dashboardStats = {
  totalUsers: 1234,
  activeUsers: 892,
  totalTransactions: 5678,
  totalVolume: 125000000,
  pendingKYC: 45,
  pendingWithdrawals: 12,
};
