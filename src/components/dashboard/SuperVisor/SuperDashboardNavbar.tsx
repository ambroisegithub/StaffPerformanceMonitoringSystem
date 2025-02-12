import { useState, useEffect } from "react"
import { Bell, Mail, Search, Sun, Moon, HelpCircle, Globe, ChevronDown, Menu } from "lucide-react"
import { Badge } from "../../ui/Badge"
import ProfileImage from "../../../assets/profile.jpg"
import { useTheme } from './ThemeContext';
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { logout } from "../../../Redux/Slices/LoginSlices";
import { useNavigate } from "react-router-dom";
import React from "react";
interface Notification {
  id: string
  title: string
  description: string
  type: "info" | "warning" | "error"
  read: boolean
}

interface SuperVisorDashboardNavbarProps {
  toggleSidebar: () => void;
}

const SuperVisorDashboardNavbar = ({ toggleSidebar }: SuperVisorDashboardNavbarProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.login.user);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Task Assignment",
      description: "Project X needs review",
      type: "info",
      read: false,
    },
    {
      id: "2",
      title: "Deadline Alert",
      description: "Task Y is overdue",
      type: "warning",
      read: false,
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const root = window.document.documentElement
    if (isDarkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="px-4 py-3 flex items-center justify-between shadow-sm bg-white dark:bg-gray-800">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-600 lg:hidden  dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        >
          <Menu className="h-6 w-6 " />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800 dark:text-white">SuperVisor Portal</h1>
      </div>
      
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red text-white">{unreadCount}</Badge>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Notifications</h3>
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg ${
                            notification.read ? "bg-gray-50 dark:bg-gray-700" : "bg-green-100 dark:bg-green-800"
                          }`}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{notification.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{notification.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" 
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <Sun className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
            </button>

            {/* Help */}
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <HelpCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Language */}
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Globe className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button className="flex items-center space-x-2" onClick={() => setShowProfile(!showProfile)}>
                <img src={ProfileImage || "/placeholder.svg"} alt="Profile" className="h-8 w-8 rounded-full" />
                <span className="hidden md:block font-medium text-gray-900 dark:text-gray-100">{user?.username}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </a>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      className="block w-full text-left px-4 py-2 text-sm text-red hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
    </nav>
  );
};

export default SuperVisorDashboardNavbar;