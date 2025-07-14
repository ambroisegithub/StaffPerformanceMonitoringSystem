// @ts-nocheck
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MapPin,
  BarChart2,
  FileText,
  Building2,
  Bell,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Layers,
  Grid,
  X,
  TrendingUp,
  Award,
  CheckSquare,
  User,
  Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
interface SidebarItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: Omit<SidebarItem, 'icon' | 'subItems'>[];
}

const sidebarItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/super-visor',
  },
  {
    id: 'Team Management',
    title: 'Team Management',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: 'Team Analytics', title: 'Team Analytics', path: '/super-visor/team/team-analytics' },
      { id: 'My-team', title: 'My Team', path: '/super-visor/team/my-team' },
    ]
  },
  {
    id: 'tasks',
    title: 'Task Management',
    icon: <ClipboardList className="h-5 w-5" />,
    subItems: [
      { id: 'review-task', title: 'Review Task', path: '/supervisor/review' },
      { id: 'further-review-tasks', title: 'Further Review Tasks', path: '/supervisor/further-review-tasks' },
      { id: 'create-task', title: 'Create Task', path: '/supervisor/tasks/create' },
        {
          id: "shifted-task",
          title: "Shifted Task",
          path: "/supervisor/shifted-task",
      
        },
          {
          id: "submitted-tasks",
          title: "Submitted Task",
          path: "/supervisor/submitted-task",
        }
    ]
  },
    {
    id: 'Leave Request',
    title: 'Leave Management',
    icon: <Calendar className="h-5 w-5" />,
    subItems: [
      { id: 'Create Leave', title: 'Create Leave', path: '/supervisor/create-leave' },
      { id: "Requested leave", title:"Leaves Need Review", path: "/supervisor/leaves" },
      { id: 'My Leaves', title: 'My Leaves', path: '/super-visor/leaves' },
      { id: 'Approved Leaves', title: 'Approved Leaves', path: '/supervisor/approved-leaves' },
    ]
    
  },
  // /supervisor/create-leave
  {
    id: 'Profile',
    title: 'My Profile',
    icon: <User className="h-5 w-5" />,
    path: '/super-visor/profile' 
    
  },
];

const SuperVisorDashSidebar = ({ isOpen, closeSidebar }) => {
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  const renderSidebarItem = (item) => {
    const isExpanded = expandedItemId === item.id;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const handleItemClick = () => {
      if (hasSubItems) {
        toggleExpand(item.id);
      } else if (item.path) {
        // Use navigate instead of window.location.href
        navigate(item.path);
        closeSidebar(); // Close sidebar on mobile after navigation
      }
    };

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={handleItemClick}
          className={`w-full flex items-center justify-between py-2.5 px-3 rounded-lg
            cursor-pointer group
            transition-all duration-200 ease-in-out
            hover:bg-slate-100 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm
            ${isExpanded 
              ? 'bg-slate-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold border-l-4 border-blue-500' 
              : 'text-gray-700 dark:text-gray-200 font-medium'
            }`}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`transition-colors duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-blue-500' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
            }`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className="text-[0.95rem] transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis">
                {item.title}
              </span>
            )}
          </div>
          {hasSubItems && !isCollapsed && (
            <div className={`transition-all duration-200 flex-shrink-0 ${
              isExpanded 
                ? 'text-blue-500 rotate-0' 
                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500'
            }`}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="pl-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {item.subItems?.map(subItem => (
              <Link
                key={subItem.id}
                to={subItem.path || '#'}
                className="block py-2 px-3 rounded-lg 
                  transition-all duration-200 ease-in-out
                  hover:bg-slate-50 dark:hover:bg-gray-600
                  text-gray-600 dark:text-gray-300 
                  hover:text-gray-900 dark:hover:text-white
                  hover:shadow-sm hover:translate-x-1
                  text-sm font-medium
                  border-l-2 border-transparent hover:border-blue-300"
                onClick={closeSidebar} // Close sidebar on mobile after navigation
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <aside 
      className={`h-full bg-slate-50 dark:bg-gray-900 
        border-r border-slate-200 dark:border-gray-700 
        shadow-lg dark:shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col backdrop-blur-sm`}
    >
      {/* Header controls (fixed) */}
      <div className="p-4 flex items-center justify-between flex-shrink-0 border-b border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-lg">Supervisor</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg 
            transition-all duration-200 ease-in-out
            hover:bg-slate-200 dark:hover:bg-gray-700
            text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        
        {/* Close button for mobile */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded-lg 
            transition-all duration-200 ease-in-out
            text-gray-600 dark:text-gray-300 
            hover:bg-slate-200 dark:hover:bg-gray-700
            hover:text-gray-900 dark:hover:text-white
            hover:shadow-sm"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Scrollable sidebar content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="space-y-1.5 p-4">
          {sidebarItems.map(renderSidebarItem)}
        </div>
      </div>

      {/* Footer section */}
      <div className="p-4 border-t border-slate-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Supervisor Dashboard v2.0
          </div>
        ) : (
          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        /* Animation keyframes */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </aside>
  );
};

export default SuperVisorDashSidebar;