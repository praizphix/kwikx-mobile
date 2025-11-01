import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <img 
          src="/kwikx_logo_color.png" 
          alt="KwikX" 
          className="h-12 mb-6"
        />
        <div className="w-12 h-12 border-4 border-[#00454a]/20 border-t-[#00454a] rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;