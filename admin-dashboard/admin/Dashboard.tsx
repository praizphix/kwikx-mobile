import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, RefreshCw, Users, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: RefreshCw,
      title: 'Exchange Rates',
      description: 'Manage currency exchange rates',
      path: '/admin/exchange-rates'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users and permissions',
      path: '/admin/users'
    },
    {
      icon: Activity,
      title: 'Transaction Monitor',
      description: 'Monitor and manage transactions',
      path: '/admin/transactions'
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure system parameters',
      path: '/admin/settings'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your platform settings and monitor activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(item.path)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-[#00454a] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-[#00454a]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;