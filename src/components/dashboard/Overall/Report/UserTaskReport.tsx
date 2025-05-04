// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import {
  fetchUserTasksReport,
  selectUserTaskReport,
  selectUserTaskReportLoading,
  selectUserTaskReportError,
  clearUserTaskReport,
  type TaskReviewFilters,
} from "../../../../Redux/Slices/TaskReviewSlice"
import type { AppDispatch } from "../../../../Redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/Badge"
import { Progress } from "../../../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select"
import { Calendar } from "../../../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover"
import {
  ArrowLeft,
  User,
  CalendarIcon,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  PieChart,
  Target,
  Award,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ChevronDown,
  Activity,
  Users,
  Building,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "../../../../lib/utils"
import DailyReportsView from "./DailyReportsView"
import CalendarView from "./CalendarView"
import TrendsView from "./TrendsView"

// Quick filter buttons data
const QUICK_FILTERS = [
  { label: "Today", value: "today", days: 0 },
  { label: "This Week", value: "week", days: 7 },
  { label: "This Month", value: "month", days: 30 },
  { label: "Last 3 Months", value: "quarter", days: 90 },
]

const UserTaskReport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const userTaskReport = useSelector(selectUserTaskReport)
  const loading = useSelector(selectUserTaskReportLoading)
  const error = useSelector(selectUserTaskReportError)

  // State management
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("month")
  const [submissionStatus, setSubmissionStatus] = useState("all")
  const [taskStatus, setTaskStatus] = useState("all")
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>()
  const [autoGenerateComplete, setAutoGenerateComplete] = useState(false)

  // Auto-generate report on page load
  useEffect(() => {
    if (userId && !autoGenerateComplete) {
      handleGenerateReport()
      setAutoGenerateComplete(true)
    }
  }, [userId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearUserTaskReport())
    }
  }, [dispatch])

  const handleGenerateReport = () => {
    if (!userId) return

    const filters: TaskReviewFilters = {
      dateRange,
      submissionStatus,
      taskStatus,
      startDate: customStartDate?.toISOString(),
      endDate: customEndDate?.toISOString(),
    }

    dispatch(
      fetchUserTasksReport({
        userId: Number.parseInt(userId),
        filters,
      }),
    )
  }

  const handleQuickFilter = (filterValue: string) => {
    const today = new Date()
    switch (filterValue) {
      case "today":
        setCustomStartDate(today)
        setCustomEndDate(today)
        setDateRange("custom")
        break
      case "week":
        setCustomStartDate(subDays(today, 7))
        setCustomEndDate(today)
        setDateRange("custom")
        break
      case "month":
        setCustomStartDate(startOfMonth(today))
        setCustomEndDate(endOfMonth(today))
        setDateRange("month")
        break
      case "quarter":
        setCustomStartDate(subDays(today, 90))
        setCustomEndDate(today)
        setDateRange("custom")
        break
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-emerald-500",
      in_progress: "bg-blue-500",
      rejected: "bg-red-500",
    }
    return colors[status as keyof typeof colors] || "bg-slate-500"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Enhanced loading component with steps
  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="w-96 border-slate-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-4">Generating Report</p>

            {/* Loading Steps */}
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-600">Loading user data</span>
              </div>
              <div className="flex items-center space-x-3">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-slate-600">Analyzing task performance</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Generating insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">Preparing visualizations</span>
              </div>
            </div>

            <div className="mt-4 bg-slate-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">This may take a few moments...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Error state component
  const ErrorState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <Card className="w-96 border-red-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-lg font-semibold text-red-700 mb-2">Report Generation Failed</p>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
              {error || "Failed to generate report. Please try again."}
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => navigate("/overall/user/report")} variant="outline" className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleGenerateReport} className="flex-1 bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState />
  }

  if (!userTaskReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 border-slate-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">No Report Data</p>
              <p className="text-sm text-slate-600 mb-4">Unable to load report data for this user.</p>
              <Button onClick={() => navigate("/overall/user/report")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/overall/user/report")}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to User Selection</span>
            </Button>
            <div className="text-sm text-slate-500">
              Users → {userTaskReport.user.firstName} {userTaskReport.user.lastName} → Task Report
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* User Profile Header */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {userTaskReport.user.firstName} {userTaskReport.user.lastName}
                    </h1>
                    <p className="text-slate-600 mb-1">@{userTaskReport.user.username}</p>
                    <p className="text-sm text-slate-500">{userTaskReport.user.email}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{userTaskReport.user.department}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{userTaskReport.user.position}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {userTaskReport.user.level}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {userTaskReport.user.teams.map((team) => (
                        <Badge key={team.id} variant="outline" className="text-xs">
                          {team.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

<Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-white via-blue-50 to-white">
  <CardHeader className="pb-2 border-b border-slate-100">
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-3 text-xl font-semibold text-blue-700">
        <span className="p-2 bg-blue-100 rounded-lg">
          <Filter className="h-6 w-6 text-blue-600" />
        </span>
        <span>Report Filters</span>
      </CardTitle>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowFilters(!showFilters)}
        className="text-blue-600 hover:bg-blue-50 rounded-full transition-all"
        aria-label="Toggle Filters"
      >
        <ChevronDown className={cn("h-6 w-6 transition-transform", showFilters && "rotate-180")} />
      </Button>
    </div>
  </CardHeader>

  {showFilters && (
    <CardContent className="pt-4">
      {/* Quick Filter Buttons */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-slate-700 mb-2 block tracking-wide">Quick Filters</label>
        <div className="flex flex-wrap gap-3">
          {QUICK_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(filter.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium border-2 transition-all",
                dateRange === filter.value
                  ? "bg-blue-100 border-blue-400 text-blue-700 shadow"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50"
              )}
              aria-pressed={dateRange === filter.value}
            >
              {/* Optionally add icons here for each filter */}
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Detailed Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="rounded-lg shadow-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-200">
              <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg bg-white">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Submission Status</label>
          <Select value={submissionStatus} onValueChange={setSubmissionStatus}>
            <SelectTrigger className="rounded-lg shadow-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-200">
              <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg bg-white">
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="submitted">Submitted Only</SelectItem>
              <SelectItem value="not_submitted">Not Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Task Status</label>
          <Select value={taskStatus} onValueChange={setTaskStatus}>
            <SelectTrigger className="rounded-lg shadow-sm bg-white border-slate-200 focus:ring-2 focus:ring-blue-200">
              <TrendingUp className="mr-2 h-4 w-4 text-orange-400" />
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg bg-white">
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleGenerateReport}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg font-semibold h-11"
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Eye className="h-5 w-5 mr-2" />
            )}
            Update Report
          </Button>
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white rounded-lg shadow-sm border-slate-200"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                  {customStartDate ? format(customStartDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-lg shadow-lg bg-white border border-slate-100">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-2 block uppercase tracking-wider">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white rounded-lg shadow-sm border-slate-200"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-blue-400" />
                  {customEndDate ? format(customEndDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-lg shadow-lg bg-white border border-slate-100">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  initialFocus
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </CardContent>
  )}
</Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Daily View</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {userTaskReport.summary.submissionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-blue-700">Submission Rate</p>
                    </div>
                  </div>
                  <Progress value={userTaskReport.summary.submissionRate} className="mt-3 h-2" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-600 rounded-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-900">
                        {userTaskReport.summary.approvalRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-emerald-700">Approval Rate</p>
                    </div>
                  </div>
                  <Progress value={userTaskReport.summary.approvalRate} className="mt-3 h-2" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">{userTaskReport.summary.totalTasks}</p>
                      <p className="text-sm text-purple-700">Total Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">
                        {userTaskReport.summary.completionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-700">Completion Rate</p>
                    </div>
                  </div>
                  <Progress value={userTaskReport.summary.completionRate} className="mt-3 h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Status Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Task Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(userTaskReport.summary.taskStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`} />
                          <span className="capitalize font-medium">{status.replace("_", " ")}</span>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    <span>Review Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(userTaskReport.summary.reviewStatusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`} />
                          <span className="capitalize font-medium">{status}</span>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Daily View Tab */}
          <TabsContent value="daily" className="space-y-6">
            <DailyReportsView
              dailyReports={userTaskReport.dailyReports}
              submissionStatus={submissionStatus}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <CalendarView
              calendarData={userTaskReport.calendarData}
              onDateSelect={setSelectedCalendarDate}
              selectedDate={selectedCalendarDate}
            />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <TrendsView monthlyTrends={userTaskReport.monthlyTrends} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UserTaskReport
