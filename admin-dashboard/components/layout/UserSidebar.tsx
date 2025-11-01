import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wallet,
  BarChart2,
  RefreshCw,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const UserSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Wallets', icon: Wallet, path: '/wallets' },
    { name: 'Transactions', icon: BarChart2, path: '/transactions' },
    { name: 'Exchange', icon: RefreshCw, path: '/exchange' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Help', icon: HelpCircle, path: 'https://help.kwikx.com', external: true },
  ];

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Link to="/dashboard">
          <img src="/kwikx_logo_color.png" alt="KwikX" className="h-8" />
        </Link>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          item.external ? (
            <a
              key={item.name}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
            >
              <item.icon
                className="mr-3 h-5 w-5 text-gray-500 group-hover:text-[#00454a]"
                aria-hidden="true"
              />
              {item.name}
            </a>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${
                  location.pathname === item.path
                    ? 'bg-[#00454a] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5
                  ${location.pathname === item.path ? 'text-[#eeb83b]' : 'text-gray-500 group-hover:text-[#00454a]'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleSignOut}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 w-full"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-500" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;