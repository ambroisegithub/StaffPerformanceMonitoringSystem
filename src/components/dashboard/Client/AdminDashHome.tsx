// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import {
  Users,
  Building,  Briefcase, Layers, UserCheck
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '../../../Redux/hooks';
import { logout } from '../../../Redux/Slices/LoginSlices';
import { useNavigate } from 'react-router-dom';
import { 
  fetchSummaryreportOfOrganization, 
  getTaskStatusOverview, 
  getEmployeePerformance 
} from '../../../Redux/Slices/SystemLeaderSlice';

import axios from 'axios';
import Loader from '../../ui/Loader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashHomePage = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [summaryReport, setSummaryReport] = useState(null);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.login);
  const apiUrl = `${import.meta.env.VITE_BASE_URL}`;

  const handleAutoLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!user || !token) {
          handleAutoLogout();
          return;
        }

        if (user.organization && !user.organization.isActive) {
          handleAutoLogout();
          return;
        }

        await axios.get(`${import.meta.env.VITE_BASE_URL}/user/validate-token`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

      } catch (error) {
        handleAutoLogout();
      }
    };

    checkAuthStatus();

    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        await Promise.all([
          dispatch(fetchSummaryreportOfOrganization()).unwrap().then(setSummaryReport),
          dispatch(getTaskStatusOverview()).unwrap().then((result) => {
            if (result?.taskStatusOverview) setTaskStatusData(result.taskStatusOverview);
          }),
          dispatch(getEmployeePerformance()).unwrap().then((result) => {
            if (result) {
              if (result.employeePerformance) setEmployeeData(result.employeePerformance);
              if (result.summary) setEmployeeSummary(result.summary);
            }
          }),
        ]);
      } catch (error) {
        // Handle errors if necessary
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();

    const intervalId = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, token, dispatch, navigate, apiUrl]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Loader />; // Show loader while data is being fetched
  }
  
  return (
    <div className="w-full p-4 md:p-6">
      {/* Welcome Banner with Organization Name */}
      {summaryReport && summaryReport.organization && (
        <div className="mb-6 bg-gradient-to-r from-white to-white rounded-lg p-4 md:p-6 text-black shadow-lg">
          <div className="flex items-center">
            <Building className="h-8 w-8 md:h-10 md:w-10 mr-4" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome to {summaryReport.organization.name}</h1>
              <p className="text-sm md:text-base opacity-80">
                Organization Status: <span className="font-semibold">{summaryReport.organization.status}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Filter */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Client Dashboard Overview</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="p-2 border rounded-lg w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary report Cards */}
      {summaryReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-6">
          {/* Card 1: Total Users */}
          <Card className="py-3 bg-white dark:bg-gray-800">
            <CardContent className="flex items-center p-4 md:p-6">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue dark:text-blue-400 mr-4 shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Users</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                  {summaryReport.totals.users}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Teams */}
          <Card className="py-3 bg-white dark:bg-gray-800">
            <CardContent className="flex items-center p-4 md:p-6">
              <Layers className="h-6 w-6 md:h-8 md:w-8 text-green-500 dark:text-green-400 mr-4 shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Teams</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                  {summaryReport.totals.teams}
                </h3>
                <p className="text-xs text-blue-500 dark:text-blue-400">
                  {summaryReport.teamStats?.active || 0} Active
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Companies */}
          <Card className="py-3 bg-white dark:bg-gray-800">
            <CardContent className="flex items-center p-4 md:p-6">
              <Building className="h-6 w-6 md:h-8 md:w-8 text-purple-500 dark:text-purple-400 mr-4 shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Companies</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                  {summaryReport.totals.companies}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Departments */}
          <Card className="py-3 bg-white dark:bg-gray-800">
            <CardContent className="flex items-center p-4 md:p-6">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 dark:text-yellow-400 mr-4 shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Departments</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                  {summaryReport.totals.departments}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Groups */}
          <Card className="py-3 bg-white dark:bg-gray-800">
            <CardContent className="flex items-center p-4 md:p-6">
              <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-red-500 dark:text-red-400 mr-4 shrink-0" />
              <div>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Groups</p>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
                  {summaryReport.totals.groups}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-white">Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData.length > 0 ? taskStatusData : [
                  { month: 'Jan', completed: 0, pending: 0, inProgress: 0, delayed: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="completed" fill="#0088FE" />
                  <Bar dataKey="pending" fill="#00C49F" />
                  <Bar dataKey="inProgress" fill="#FFBB28" />
                  <Bar dataKey="delayed" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg text-gray-800 dark:text-white">Employee Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={employeeData.length > 0 ? employeeData : [
                  { name: 'No Data', tasks: 0, completion: 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="completion" stroke="#0088FE" />
                  <Line type="monotone" dataKey="tasks" stroke="#00C49F" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {employeeSummary && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                <p>Total Employees: {employeeSummary.totalEmployees} | Average Completion: {employeeSummary.averageCompletion}% | Total Tasks: {employeeSummary.totalTasks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AdminDashHomePage;