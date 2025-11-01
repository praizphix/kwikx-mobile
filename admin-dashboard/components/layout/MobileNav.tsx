import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, BarChart2, RefreshCw, HelpCircle } from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Wallets', icon: Wallet, path: '/wallets' },
    { name: 'Transactions', icon: BarChart2, path: '/transactions' },
    { name: 'Exchange', icon: RefreshCw, path: '/exchange' },
    { name: 'Help', icon: HelpCircle, path: 'https://help.kwikx.com', external: true },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30">
      <div className="flex justify-around">
        {navItems.map((item) => (
          item.external ? (
            <a
              key={item.name}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center py-2 w-full"
            >
              <div className="p-1.5 rounded-full text-gray-500">
                <item.icon size={20} />
              </div>
              <span className="text-xs mt-1 text-gray-500">{item.name}</span>
            </a>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center py-2 w-full"
            >
              <div 
                className={`p-1.5 rounded-full ${
                  location.pathname === item.path ? 'bg-[#00454a]' : 'text-gray-500'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={location.pathname === item.path ? 'text-[#eeb83b]' : 'text-gray-500'} 
                />
              </div>
              <span 
                className={`text-xs mt-1 ${
                  location.pathname === item.path ? 'text-[#00454a] font-medium' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

export default MobileNav;