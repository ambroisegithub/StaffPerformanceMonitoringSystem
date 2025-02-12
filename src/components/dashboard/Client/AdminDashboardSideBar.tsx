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
  UsersRound,
  CheckSquare,
  Award,
  TrendingUp
} from 'lucide-react';


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
    path: '/admin/dashboard'
  },
  {
    id: 'group',
    title: 'Holding Company',
    icon: <Grid className="h-5 w-5" />,
    subItems: [
      { id: 'group-new', title: 'Create Group', path: '/admin/create-group' },
      { id: 'companies-all', title: 'View Companies', path: '/admin/companies' },
      { id: 'departments-all', title: 'View Departments', path: '/admin/departments' }

    ]
  },
  {
    id: 'Position',
    title: 'Position Management',
    icon: <Award className="h-5 w-5" />,
    subItems: [
      { id: 'create-position', title: 'Create Position', path: '/admin/create-position' },
      { id: 'manage-position', title: 'Manage Position', path: '/admin/manage-position' },
    ]
  },

  {
    id: 'Level',
    title: 'Level Management',
    icon: <TrendingUp className="h-5 w-5" />,
    subItems: [
      { id: 'Manage Level', title: 'Manage Level', path: '/admin/management-page' },
    ]
  },
  {
    id: 'users',
    title: 'Manage Users',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: 'create-user', title: 'Create user', path: '/admin/register' },
      { id: 'users-all', title: 'View Users', path: '/admin/manage-users' },
    ]
  },

  {
    id: 'Team',
    title: 'Team Management',
    icon: <UsersRound className="h-5 w-5" />,
    subItems: [
      { id: 'create-team', title: 'Create Team', path: '/admin/team' },
      { id: 'Manage Team', title: 'View Teams', path: '/admin/teams' },

    ]
  },

  {
    id: 'Task',
    title: 'Task Management',
    icon: <CheckSquare className="h-5 w-5" />,
    subItems: [
      { id: 'Manage Teams Tasks', title: 'Manage Tasks', path: '/admin/teams-tasks-admin' },
      { id: 'Create Task', title: 'Create Task', path: '/admin/tasks/create' },
    ]
  },




];

const AdminDashSidebar = ({ isOpen, closeSidebar }) => {
  const [expanded, setExpanded] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpand = (itemId) => {
    setExpanded(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item:any) => {
    const isExpanded = expanded.includes(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={item.id} className="space-y-1">
        <button
          onClick={() => hasSubItems ? toggleExpand(item.id) : null}
          className={`w-full flex items-center justify-between p-2 rounded-lg
            ${hasSubItems ? 'cursor-pointer' : ''}
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${isExpanded ? 'bg-gray-100 dark:bg-gray-700' : ''}
            text-gray-700 dark:text-gray-100`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-gray-600 dark:text-gray-300">
              {item.icon}
            </div>
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {hasSubItems && !isCollapsed && (
            <div className="text-gray-600 dark:text-gray-300">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          )}
        </button>

        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="pl-8 space-y-1">
            {item.subItems?.map(subItem => (
              <a
                key={subItem.id}
                href={subItem.path}
                className="block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                  text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {subItem.title}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'} 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col`}
    >
      {/* Header controls (fixed) */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg 
            hover:bg-gray-100 dark:hover:bg-gray-700
            text-gray-600 dark:text-gray-300"
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
      
      {/* Scrollable sidebar content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2 p-4">
          {sidebarItems.map(renderSidebarItem)}
        </div>
      </div>
    </aside>
  );
};

export default AdminDashSidebar;