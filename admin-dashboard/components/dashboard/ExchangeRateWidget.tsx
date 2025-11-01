import React from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { exchangeRates } from '../../data/mockData';

const ExchangeRateWidget: React.FC = () => {
  // Display only the main exchange rates on mobile
  const mainRates = [
    { label: 'NGN/USDT', value: '1500', change: '+0.5%' },
    { label: 'CFA/USDT', value: '600', change: '-0.2%' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <TrendingUp size={18} className="text-[#00454a] mr-2" />
          <h3 className="font-medium text-gray-900">Exchange Rates</h3>
        </div>
        <a href="/exchange" className="text-sm text-[#00454a] hover:text-[#003238] flex items-center">
          View All <ArrowRight size={14} className="ml-1" />
        </a>
      </div>
      
      {/* Mobile view - compact */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        {mainRates.map((rate) => (
          <div key={rate.label} className="bg-gray-50 rounded p-2">
            <div className="text-xs text-gray-500">{rate.label}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">{rate.value}</span>
              <span className={`text-xs ${rate.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {rate.change}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop view - more detailed */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-4">
          {exchangeRates.map((rate, index) => (
            <div key={index} className="bg-gray-50 rounded p-3">
              <div className="text-sm text-gray-500">
                {rate.from.toUpperCase()}/{rate.to.toUpperCase()}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-medium">{rate.rate}</span>
                <span className={`text-xs ${index % 2 === 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {index % 2 === 0 ? '+0.5%' : '-0.2%'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateWidget;