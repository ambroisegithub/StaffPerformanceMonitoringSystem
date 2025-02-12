// @ts-nocheck

import React, { useState } from "react";
import { LayoutDashboard, Building, PlusCircle, Eye, Trash2, ChevronDown, ChevronRight, X } from "lucide-react";

interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: "/system-leader",
  },
  {
    id: "create-organization",
    title: "Create Organization",
    icon: <PlusCircle className="h-5 w-5" />,
    path: "/system-leader/create-organization",
  },
  {
    id: "change-account-manager",
    title: "Change Account M.",
    icon: <PlusCircle className="h-5 w-5" />,
    path: "/system-leader/change-system-leader",
  },

];

const SystemLeaderDashboardSideBar = ({ isOpen, closeSidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderSidebarItem = (item: SidebarItem) => (
    <a
      key={item.id}
      href={item.path}
      className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    >
      <div className="flex items-center space-x-3">
        <div>{item.icon}</div>
        {!isCollapsed && <span>{item.title}</span>}
      </div>
    </a>
  );

  return (
    <aside
      className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? "lg:w-16" : "lg:w-64"
      } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}
    >
      {/* Header controls */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2 p-4">{sidebarItems.map(renderSidebarItem)}</div>
      </div>
    </aside>
  );
};

export default SystemLeaderDashboardSideBar;