import React from 'react';

const PageLoading: React.FC = () => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <img 
          src="/kwikx_logo_color.png" 
          alt="KwikX" 
          className="h-10 mb-4"
        />
        <div className="w-10 h-10 border-3 border-[#00454a]/20 border-t-[#00454a] rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default PageLoading;