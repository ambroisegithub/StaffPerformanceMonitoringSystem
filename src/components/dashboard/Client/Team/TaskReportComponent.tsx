"use client"

import React from "react"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart2,
  PieChartIcon,
  Building,
  Briefcase,
  FileText,
  MessageSquare,
  Award,
  Zap,
  Calendar,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"

// Define color constants for consistent styling
const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8884d8", "#82ca9d"]
const STATUS_COLORS = {
  completed: "#10b981",
  in_progress: "#f59e0b",
  delayed: "#ef4444",
  pending: "#3b82f6",
}

interface Task {
  id: number
  title: string
  description: string
  company: string
  department: string
  status: "pending" | "in_progress" | "completed" | "delayed"
  review_status: "pending" | "approved" | "rejected"
  contribution: string
  achieved_deliverables: string
  related_project: string
  reviewed: boolean
  reviewed_by: number | null
  reviewed_at: string | null
  comments: string[]
}

interface Supervisor {
  id: number
  name: string
  role: string
}

interface TeamData {
  team: string
  supervisor: Supervisor
  tasks: Task[]
}

interface TaskReportComponentProps {
  teamTasks: TeamData[]
}

const TaskReportComponent: React.FC<TaskReportComponentProps> = ({ teamTasks }) => {
  // Process and calculate metrics from the raw data
  const reportData = useMemo(() => {
    // Filter out teams with no tasks
    const teamsWithTasks = teamTasks.filter((team) => team.tasks.length > 0)

    // Calculate total metrics
    const totalTeams = teamsWithTasks.length
    const totalTasks = teamsWithTasks.reduce((sum, team) => sum + team.tasks.length, 0)

    // Calculate task status counts
    const taskStatusCounts = teamsWithTasks.reduce(
      (counts, team) => {
        team.tasks.forEach((task) => {
          counts[task.status] = (counts[task.status] || 0) + 1
        })
        return counts
      },
      {} as Record<string, number>,
    )

    // Calculate completion rate
    const completedTasks = taskStatusCounts.completed || 0
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Calculate tasks requiring review
    const tasksRequiringReview = teamsWithTasks.reduce((sum, team) => {
      return sum + team.tasks.filter((task) => task.review_status === "pending").length
    }, 0)

    // Find teams with most tasks
    const teamTaskCounts = teamsWithTasks
      .map((team) => ({
        name: team.team,
        count: team.tasks.length,
        supervisor: team.supervisor.name,
      }))
      .sort((a, b) => b.count - a.count)

    // Team with highest completion rate
    const teamCompletionRates = teamsWithTasks
      .map((team) => {
        const teamTotalTasks = team.tasks.length
        const teamCompletedTasks = team.tasks.filter((task) => task.status === "completed").length
        const rate = teamTotalTasks > 0 ? (teamCompletedTasks / teamTotalTasks) * 100 : 0

        return {
          name: team.team,
          rate,
          completedTasks: teamCompletedTasks,
          totalTasks: teamTotalTasks,
        }
      })
      .sort((a, b) => b.rate - a.rate)

    // Project analysis
    const projectsMap = new Map<
      string,
      {
        name: string
        taskCount: number
        teams: Set<string>
        statusCounts: Record<string, number>
        companies: Set<string>
        departments: Set<string>
      }
    >()

    teamsWithTasks.forEach((team) => {
      team.tasks.forEach((task) => {
        const project = task.related_project
        if (!projectsMap.has(project)) {
          projectsMap.set(project, {
            name: project,
            taskCount: 0,
            teams: new Set(),
            statusCounts: {},
            companies: new Set(),
            departments: new Set(),
          })
        }

        const projectData = projectsMap.get(project)!
        projectData.taskCount++
        projectData.teams.add(team.team)
        projectData.statusCounts[task.status] = (projectData.statusCounts[task.status] || 0) + 1
        projectData.companies.add(task.company)
        projectData.departments.add(task.department)
      })
    })

    const projects = Array.from(projectsMap.values())
      .map((project) => ({
        ...project,
        teams: Array.from(project.teams),
        companies: Array.from(project.companies),
        departments: Array.from(project.departments),
      }))
      .sort((a, b) => b.taskCount - a.taskCount)

    // Company and department analysis
    const companyDepartmentMatrix = new Map<string, Map<string, number>>()

    teamsWithTasks.forEach((team) => {
      team.tasks.forEach((task) => {
        if (!companyDepartmentMatrix.has(task.company)) {
          companyDepartmentMatrix.set(task.company, new Map())
        }

        const departmentMap = companyDepartmentMatrix.get(task.company)!
        departmentMap.set(task.department, (departmentMap.get(task.department) || 0) + 1)
      })
    })

    const companyDepartmentData = Array.from(companyDepartmentMatrix.entries())
      .map(([company, deptMap]) => ({
        company,
        departments: Array.from(deptMap.entries()).map(([dept, count]) => ({ name: dept, count })),
        totalTasks: Array.from(deptMap.values()).reduce((sum, count) => sum + count, 0),
      }))
      .sort((a, b) => b.totalTasks - a.totalTasks)

    // Review status analysis
    const reviewedTasks = teamsWithTasks.reduce((sum, team) => {
      return sum + team.tasks.filter((task) => task.reviewed).length
    }, 0)

    const reviewRate = totalTasks > 0 ? (reviewedTasks / totalTasks) * 100 : 0

    const tasksWithComments = teamsWithTasks.reduce((sum, team) => {
      return sum + team.tasks.filter((task) => task.comments && task.comments.length > 0).length
    }, 0)

    // Team performance metrics
    const teamPerformanceMetrics = teamsWithTasks
      .map((team) => {
        const totalTeamTasks = team.tasks.length
        const completedTeamTasks = team.tasks.filter((task) => task.status === "completed").length
        const reviewedTeamTasks = team.tasks.filter((task) => task.reviewed).length
        const approvedTeamTasks = team.tasks.filter((task) => task.review_status === "approved").length

        return {
          name: team.team,
          supervisor: team.supervisor.name,
          totalTasks: totalTeamTasks,
          completedTasks: completedTeamTasks,
          completionRate: totalTeamTasks > 0 ? (completedTeamTasks / totalTeamTasks) * 100 : 0,
          reviewedTasks: reviewedTeamTasks,
          reviewRate: totalTeamTasks > 0 ? (reviewedTeamTasks / totalTeamTasks) * 100 : 0,
          approvalRate: reviewedTeamTasks > 0 ? (approvedTeamTasks / reviewedTeamTasks) * 100 : 0,
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)

    // Task status distribution for chart
    const taskStatusDistribution = Object.entries(taskStatusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }))

    // Team status comparison for chart
    const teamStatusComparison = teamsWithTasks.map((team) => {
      const statusCounts = team.tasks.reduce(
        (counts, task) => {
          counts[task.status] = (counts[task.status] || 0) + 1
          return counts
        },
        {} as Record<string, number>,
      )

      return {
        name: team.team.length > 15 ? team.team.substring(0, 15) + "..." : team.team,
        completed: statusCounts.completed || 0,
        in_progress: statusCounts.in_progress || 0,
        delayed: statusCounts.delayed || 0,
        pending: statusCounts.pending || 0,
      }
    })

    return {
      totalTeams,
      totalTasks,
      taskStatusCounts,
      completionRate,
      tasksRequiringReview,
      teamTaskCounts,
      teamCompletionRates,
      projects,
      companyDepartmentData,
      reviewedTasks,
      reviewRate,
      tasksWithComments,
      teamPerformanceMetrics,
      taskStatusDistribution,
      teamStatusComparison,
    }
  }, [teamTasks])

  // If there's no data, show a message
  if (!teamTasks || teamTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No Task Data Available</h3>
        <p className="mt-1 text-gray-500">There are no tasks available for reporting.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Team Analysis</TabsTrigger>
          <TabsTrigger value="projects">Project Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Teams</p>
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-bold">{reportData.totalTeams}</h3>
                      <span className="text-xs text-blue ml-1">({reportData.totalTasks} tasks)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-[#f59e0b] mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-bold">{reportData.taskStatusCounts.in_progress || 0}</h3>
                      <span className="text-xs text-[#f59e0b] ml-1">
                        ({(((reportData.taskStatusCounts.in_progress || 0) / reportData.totalTasks) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Pending Review</p>
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-bold">{reportData.tasksRequiringReview}</h3>
                      <span className="text-xs text-red ml-1">
                        ({((reportData.tasksRequiringReview / reportData.totalTasks) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            {/* Reviewed Tasks Card */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Reviewed Tasks</p>
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-bold">{reportData.reviewedTasks}</h3>
                      <span className="text-xs text-green ml-1">
                        ({((reportData.reviewedTasks / reportData.totalTasks) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Not Reviewed Tasks Card */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red mr-3" />
                  <div>
                    <p className="text-xs text-gray-500">Not Reviewed Tasks</p>
                    <div className="flex items-baseline">
                      <h3 className="text-lg font-bold">{reportData.totalTasks - reportData.reviewedTasks}</h3>
                      <span className="text-xs text-red ml-1">
                        ({(((reportData.totalTasks - reportData.reviewedTasks) / reportData.totalTasks) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.taskStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.taskStatusDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Top Teams by Task Count
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.teamTaskCounts.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" name="Tasks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue rounded-md border border-blue-100 text-xs">
                  <h4 className="font-medium text-white mb-1">Team Performance</h4>
                  <p className="text-white">
                    {reportData.teamCompletionRates[0]?.name || "No team"} has the highest completion rate at{" "}
                    {reportData.teamCompletionRates[0]?.rate.toFixed(1) || 0}%.
                  </p>
                </div>

                <div className="p-3 bg-green rounded-md border border-green text-xs">
                  <h4 className="font-medium text-white mb-1">Project Status</h4>
                  <p className="text-white">
                    {reportData.projects[0]?.name || "No project"} is the most active with{" "}
                    {reportData.projects[0]?.taskCount || 0} tasks across {reportData.projects[0]?.teams.length || 0}{" "}
                    teams.
                  </p>
                </div>

                <div className="p-3 bg-[#f59e0b] rounded-md border border-[#f59e0b] text-xs">
                  <h4 className="font-medium text-white mb-1">Review Status</h4>
                  <p className="text-white">
                    {reportData.reviewRate.toFixed(1)}% of tasks reviewed, with {reportData.tasksWithComments} receiving
                    comments.
                  </p>
                </div>

                <div className="p-3 bg-red rounded-md border border-red-100 text-xs">
                  <h4 className="font-medium text-white mb-1">Attention Required</h4>
                  <p className="text-white">
                    {reportData.taskStatusCounts.delayed || 0} tasks are currently delayed and require attention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Analysis Tab */}
        <TabsContent value="teams" className="space-y-4">
          {/* Team Status Chart */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Task Status by Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.teamStatusComparison.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill={STATUS_COLORS.completed} />
                    <Bar dataKey="in_progress" name="In Progress" stackId="a" fill={STATUS_COLORS.in_progress} />
                    <Bar dataKey="delayed" name="Delayed" stackId="a" fill={STATUS_COLORS.delayed} />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.pending} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completion Rates */}
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Team Completion Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3 mt-2">
                  {reportData.teamCompletionRates.slice(0, 5).map((team, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate w-32">{team.name}</span>
                        <span>{team.rate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            team.rate > 75 ? "bg-green" : team.rate > 50 ? "bg-[#f59e0b]" : "bg-red"
                          }`}
                          style={{ width: `${team.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Rates */}
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Team Review Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 stroke-current"
                          strokeWidth="10"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <circle
                          className="text-blue stroke-current"
                          strokeWidth="10"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${reportData.reviewRate * 2.51} 251.2`}
                          strokeDashoffset="0"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{reportData.reviewRate.toFixed(1)}%</span>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-xs text-gray-700">Tasks Reviewed</p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-md">
                    <div className="text-2xl font-bold text-blue">{reportData.tasksWithComments}</div>
                    <p className="mt-2 text-center text-xs text-gray-700">Tasks With Comments</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((reportData.tasksWithComments / reportData.reviewedTasks) * 100).toFixed(1)}% of reviewed
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Top Teams by Review Rate</p>
                    <div className="space-y-2">
                      {reportData.teamPerformanceMetrics
                        .slice(0, 3)
                        .sort((a, b) => b.reviewRate - a.reviewRate)
                        .map((team, index) => (
                          <div key={index} className="flex justify-between items-center text-xs">
                            <span className="truncate w-32">{team.name}</span>
                            <Badge className="bg-blue text-white text-xs">
                              {team.reviewRate.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Table */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Team
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Tasks
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Completion
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Review
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.teamPerformanceMetrics.slice(0, 5).map((team, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="font-medium text-gray-900 truncate w-24" title={team.name}>
                            {team.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                          {team.completedTasks}/{team.totalTasks}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div
                                className={`h-1.5 rounded-full ${
                                  team.completionRate > 75
                                    ? "bg-green"
                                    : team.completionRate > 50
                                    ? "bg-[#f59e0b]"
                                    : "bg-red"
                                }`}
                                style={{ width: `${team.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{team.completionRate.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                              <div
                                className="bg-blue h-1.5 rounded-full"
                                style={{ width: `${team.reviewRate}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-900">{team.reviewRate.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Analysis Tab */}
        <TabsContent value="projects" className="space-y-4">
          {/* Project Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Top Projects by Task Count
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.projects.slice(0, 5).map((project) => ({
                        name: project.name.length > 15 ? project.name.substring(0, 15) + "..." : project.name,
                        count: project.taskCount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Project Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.projects.slice(0, 5).map((project) => ({
                          name: project.name.length > 12 ? project.name.substring(0, 12) + "..." : project.name,
                          value: project.taskCount,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.projects.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company-Department Matrix */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Company-Department Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Top Companies</h4>
                  <div className="space-y-2">
                    {reportData.companyDepartmentData.slice(0, 4).map((company, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="truncate w-32">{company.company}</span>
                          <span>{company.totalTasks} tasks</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue h-1.5 rounded-full"
                            style={{
                              width: `${(company.totalTasks / reportData.totalTasks) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Top Departments</h4>
                  <div className="space-y-2">
                    {reportData.companyDepartmentData
                      .flatMap((company) =>
                        company.departments.map((dept) => ({
                          name: dept.name,
                          count: dept.count,
                        }))
                      )
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 4)
                      .map((dept, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="truncate w-32">{dept.name}</span>
                            <span>{dept.count} tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{
                                width: `${(dept.count / reportData.totalTasks) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Project Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Project
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Tasks
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Teams
                      </th>
                      <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.projects.slice(0, 5).map((project, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="font-medium text-gray-900 truncate w-24" title={project.name}>
                            {project.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{project.taskCount}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{project.teams.length}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  (project.statusCounts.completed || 0) / project.taskCount > 0.7
                                    ? STATUS_COLORS.completed
                                    : (project.statusCounts.delayed || 0) / project.taskCount > 0.3
                                    ? STATUS_COLORS.delayed
                                    : STATUS_COLORS.in_progress,
                              }}
                            ></div>
                            <span className="text-gray-900">
                              {(project.statusCounts.completed || 0) / project.taskCount > 0.7
                                ? "On Track"
                                : (project.statusCounts.delayed || 0) / project.taskCount > 0.3
                                ? "At Risk"
                                : "In Progress"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-blue rounded-md border border-blue-100 text-xs">
                  <p className="text-white">
                    Redistribute tasks from {reportData.teamTaskCounts[0]?.name || "busy teams"} to balance workload.
                  </p>
                </div>

                <div className="p-3 bg-[#f59e0b] rounded-md border border-yellow-100 text-xs">
                  <p className="text-white">
                    Prioritize reviewing {reportData.tasksRequiringReview} pending tasks to prevent bottlenecks.
                  </p>
                </div>

                <div className="p-3 bg-red rounded-md border border-red-100 text-xs">
                  <p className="text-white">
                    Address {reportData.taskStatusCounts.delayed || 0} delayed tasks with immediate action plans.
                  </p>
                </div>

                <div className="p-3 bg-green rounded-md border border-green text-xs">
                  <p className="text-white">
                    Apply {reportData.teamCompletionRates[0]?.name || "top team"}'s practices across other teams.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TaskReportComponent

