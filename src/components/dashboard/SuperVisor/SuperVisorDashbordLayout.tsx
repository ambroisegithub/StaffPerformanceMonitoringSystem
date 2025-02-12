import { Outlet } from "react-router-dom";
import SuperVisorDashboardSideBar from "./SuperVisorDashboardSideBar";
import SuperDashboardNavbar from "./SuperDashboardNavbar";
import { ThemeProvider } from './ThemeContext';
import React, { useState } from "react";

function SuperVisorDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <div className="bg-gray-100 dark:bg-gray-900 flex flex-col h-screen overflow-hidden">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <SuperDashboardNavbar toggleSidebar={toggleSidebar} />
        </div>
        
        <div className="flex flex-1 pt-16 h-full">
          {/* Sidebar - fixed on desktop, slide in/out on mobile */}
          <div className={`fixed inset-y-0 left-0 z-40 pt-16 h-full lg:translate-x-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            {/* Overlay for mobile */}
            <div 
              className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
              onClick={toggleSidebar}
              aria-hidden="true"
            ></div>
            
            <SuperVisorDashboardSideBar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
          </div>
          
          {/* Main content area - scrollable */}
          <div className="flex-1 overflow-y-auto w-full h-full transition-all duration-300 ease-in-out lg:ml-64 text-gray-900 dark:text-gray-100 pt-2 pb-4 px-4">
            <Outlet />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default SuperVisorDashboardLayout;