"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchAllDailyTasks,
  selectAllDailyTasks,
  selectAllDailyTasksLoading,
  selectError,
  type TaskReviewFilters,
} from "../../../Redux/Slices/TaskReviewSlice"
import type { AppDispatch, RootState } from "../../../Redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { Search, FileText, Users, TrendingUp, Loader2, ArrowRight, UserCheck, ChevronDown, Filter } from "lucide-react"
import { format } from "date-fns"

const UserReportSelection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const allDailyTasks = useSelector(selectAllDailyTasks)
  const loading = useSelector(selectAllDailyTasksLoading)
  const error = useSelector(selectError)
  const user = useSelector((state: RootState) => state.login.user)

  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [teamFilter, setTeamFilter] = useState<string>("all")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    if (user?.organization?.id) {
      const filters: TaskReviewFilters = {}
      if (searchTerm) {
        filters.search = searchTerm
      }
      if (departmentFilter !== "all") {
        filters.department = departmentFilter
      }
      if (teamFilter !== "all") {
        filters.team = teamFilter
      }

      dispatch(
        fetchAllDailyTasks({
          organizationId: user.organization.id,
          page: 1,
          limit: 50, // Show more users for selection
          filters,
        }),
      )
    }
  }, [dispatch, user?.organization?.id, searchTerm, departmentFilter, teamFilter])

  const handleGenerateReport = async (userId: number) => {
    setSelectedUserId(userId)
    setIsGenerating(true)

    // Add a small delay to show the loading state
    setTimeout(() => {
      navigate(`/admin/user/${userId}/report`)
    }, 500)
  }

  const getLatestSubmissionDate = (submissions: Record<string, any>) => {
    const dates = Object.keys(submissions)
    if (dates.length === 0) return "No submissions"
    const latestDate = dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    return format(new Date(latestDate), "MMM dd, yyyy")
  }

  const getTotalTaskCount = (submissions: Record<string, any>) => {
    return Object.values(submissions).reduce((total: number, submission: any) => {
      return total + (submission.tasks?.length || 0)
    }, 0)
  }

  const getUniqueValues = (key: string) => {
    const values = new Set<string>()
    allDailyTasks.forEach((item) => {
      if (key === "department") {
        Object.values(item.submissions).forEach((submission: any) => {
          submission.tasks?.forEach((task: any) => {
            if (task.department) values.add(task.department)
          })
        })
      } else if (key === "teams") {
        item.user.teams?.forEach((team: string) => {
          if (team) values.add(team)
        })
      }
    })
    return Array.from(values)
  }

  const filteredUsers = allDailyTasks.filter((userTask) => {
    const fullName = `${userTask.user.firstName} ${userTask.user.lastName}`.toLowerCase()
    const username = userTask.user.username.toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return fullName.includes(searchLower) || username.includes(searchLower)
  })

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = (() => {
      switch (sortConfig.key) {
        case 'name':
          return `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
        case 'username':
          return a.user.username.toLowerCase()
        case 'level':
          return a.user.level || ''
        case 'lastActivity':
          const aDates = Object.keys(a.submissions)
          return aDates.length > 0 ? new Date(aDates.sort((x, y) => new Date(y).getTime() - new Date(x).getTime())[0]) : new Date(0)
        case 'totalTasks':
          return getTotalTaskCount(a.submissions)
        default:
          return ''
      }
    })()

    const bValue = (() => {
      switch (sortConfig.key) {
        case 'name':
          return `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
        case 'username':
          return b.user.username.toLowerCase()
        case 'level':
          return b.user.level || ''
        case 'lastActivity':
          const bDates = Object.keys(b.submissions)
          return bDates.length > 0 ? new Date(bDates.sort((x, y) => new Date(y).getTime() - new Date(x).getTime())[0]) : new Date(0)
        case 'totalTasks':
          return getTotalTaskCount(b.submissions)
        default:
          return ''
      }
    })()

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 border-slate-200 shadow-xl backdrop-blur-lg bg-white/80">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <p className="text-lg font-semibold text-slate-700 mb-2">Loading Users</p>
              <p className="text-sm text-slate-600">Please wait while we fetch user data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 border-red-200 shadow-xl backdrop-blur-lg bg-white/80">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-red-700 mb-2">Error Loading Data</p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-md">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            User Report
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Select a user to generate their comprehensive task performance report with analytics and insights.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <span className="text-slate-800">Search & Filter Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/70 backdrop-blur-sm shadow-sm"
                />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/70 backdrop-blur-sm shadow-sm">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {getUniqueValues("department").map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Team Filter */}
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 bg-white/70 backdrop-blur-sm shadow-sm">
                  <SelectValue placeholder="Filter by Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {getUniqueValues("teams").map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-slate-200 shadow-xl bg-white/80 backdrop-blur-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-slate-800">User Directory</span>
              <Badge variant="outline" className="ml-auto border-blue-200 text-blue-700 bg-blue-50">
                {sortedUsers.length} users found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sortedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg mb-2">No users found</p>
                <p className="text-slate-400 text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                      <th 
                        onClick={() => handleSort('name')}
                        className="text-left p-4 font-semibold text-slate-700 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>User</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            sortConfig?.key === 'name' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                          } ${sortConfig?.key === 'name' ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                      </th>
 
                      <th 
                        onClick={() => handleSort('level')}
                        className="text-left p-4 font-semibold text-slate-700 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Level</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            sortConfig?.key === 'level' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                          } ${sortConfig?.key === 'level' ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700">Teams</th>
                      <th 
                        onClick={() => handleSort('lastActivity')}
                        className="text-left p-4 font-semibold text-slate-700 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Last Activity</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            sortConfig?.key === 'lastActivity' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                          } ${sortConfig?.key === 'lastActivity' ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('totalTasks')}
                        className="text-left p-4 font-semibold text-slate-700 cursor-pointer hover:bg-blue-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Total Tasks</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${
                            sortConfig?.key === 'totalTasks' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                          } ${sortConfig?.key === 'totalTasks' ? 'text-blue-600' : 'text-slate-400'}`} />
                        </div>
                      </th>
                      <th className="text-right p-4 font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((userTask, index) => (
                      <tr 
                        key={userTask.user.id}
                        className={`border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/30'
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {userTask.user.firstName?.charAt(0)}
                              {userTask.user.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {userTask.user.firstName} {userTask.user.lastName}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                            {userTask.user.level || "None"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {userTask.user.teams && userTask.user.teams.length > 0 ? (
                              userTask.user.teams.slice(0, 3).map((team, index) => (
                                <Badge
                                  key={index}
                                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs shadow-sm"
                                >
                                  {team}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-400 text-sm italic">No teams</span>
                            )}
                            {userTask.user.teams && userTask.user.teams.length > 3 && (
                              <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                                +{userTask.user.teams.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-700 font-medium text-sm">
                            {getLatestSubmissionDate(userTask.submissions)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {getTotalTaskCount(userTask.submissions)}
                              </span>
                            </div>
                            <span className="text-slate-700 font-semibold text-sm">
                              {getTotalTaskCount(userTask.submissions)} tasks
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => handleGenerateReport(userTask.user.id)}
                            disabled={isGenerating && selectedUserId === userTask.user.id}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105"
                          >
                            {isGenerating && selectedUserId === userTask.user.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Generate Report
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Footer */}
        <div className="flex items-center justify-center space-x-8 bg-white/80 backdrop-blur-lg rounded-xl px-6 py-4 border border-slate-200 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Users</p>
              <p className="font-bold text-slate-900 text-xl">{allDailyTasks.length}</p>
            </div>
          </div>
          <div className="w-px h-12 bg-slate-300"></div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Active Users</p>
              <p className="font-bold text-slate-900 text-xl">
                {allDailyTasks.filter((user) => Object.keys(user.submissions).length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserReportSelection