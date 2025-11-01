import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from './AdminSidebar';
import UserSidebar from './UserSidebar';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const Sidebar = isAdminRoute ? AdminSidebar : UserSidebar;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={toggleSidebar}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          <div className="fixed inset-y-0 left-0 flex flex-col z-40 w-64 max-w-xs bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <div className="container mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Navigation - Only show for user routes */}
        {!isAdminRoute && (
          <div className="md:hidden">
            <MobileNav />
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;