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
  TrendingUp,
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
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">No Task Data Available</h3>
        <p className="mt-2 text-gray-500">There are no tasks available for reporting.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="executive-summary" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="team-overview">Team Overview</TabsTrigger>
          <TabsTrigger value="task-analysis">Task Analysis</TabsTrigger>
          <TabsTrigger value="project-analysis">Project Analysis</TabsTrigger>
          <TabsTrigger value="performance-metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        {/* Executive Summary Section */}
        <TabsContent value="executive-summary" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Teams</p>
                    <h3 className="text-2xl font-bold">{reportData.totalTeams}</h3>
                    <p className="text-sm text-blue-500">{reportData.totalTasks} total tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completion Rate</p>
                    <h3 className="text-2xl font-bold">{reportData.completionRate.toFixed(1)}%</h3>
                    <p className="text-sm text-green-500">
                      {reportData.taskStatusCounts.completed || 0} completed tasks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasks In Progress</p>
                    <h3 className="text-2xl font-bold">{reportData.taskStatusCounts.in_progress || 0}</h3>
                    <p className="text-sm text-yellow-500">
                      {(((reportData.taskStatusCounts.in_progress || 0) / reportData.totalTasks) * 100).toFixed(1)}% of
                      total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="mr-4">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasks Requiring Review</p>
                    <h3 className="text-2xl font-bold">{reportData.tasksRequiringReview}</h3>
                    <p className="text-sm text-red-500">
                      {((reportData.tasksRequiringReview / reportData.totalTasks) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.taskStatusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Teams with Most Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.teamTaskCounts.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Tasks" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-700 mb-2">Team Performance</h4>
                  <p className="text-blue-600">
                    {reportData.teamCompletionRates[0]?.name || "No team"} has the highest completion rate at{" "}
                    {reportData.teamCompletionRates[0]?.rate.toFixed(1) || 0}%.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h4 className="font-medium text-green-700 mb-2">Project Status</h4>
                  <p className="text-green-600">
                    {reportData.projects[0]?.name || "No project"} is the most active project with{" "}
                    {reportData.projects[0]?.taskCount || 0} tasks across {reportData.projects[0]?.teams.length || 0}{" "}
                    teams.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                  <h4 className="font-medium text-yellow-700 mb-2">Review Status</h4>
                  <p className="text-yellow-600">
                    {reportData.reviewRate.toFixed(1)}% of all tasks have been reviewed, with{" "}
                    {reportData.tasksWithComments} tasks receiving comments.
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-700 mb-2">Attention Required</h4>
                  <p className="text-red-600">
                    {reportData.taskStatusCounts.delayed || 0} tasks are currently delayed and require immediate
                    attention.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Overview Section */}
        <TabsContent value="team-overview" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Team Overview</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  Task Status by Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.teamStatusComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Team Completion Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.teamCompletionRates}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: "Completion Rate (%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Bar dataKey="rate" name="Completion Rate (%)" fill="#10b981">
                        {reportData.teamCompletionRates.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.rate > 75 ? "#10b981" : entry.rate > 50 ? "#f59e0b" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Team Details</h3>

            {reportData.teamPerformanceMetrics.map((team, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{team.name}</span>
                    <Badge
                      className={`${team.completionRate > 75 ? "bg-green-500" : team.completionRate > 50 ? "bg-yellow-500" : "bg-red-500"} text-white`}
                    >
                      {team.completionRate.toFixed(1)}% Complete
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Supervisor</p>
                      <p className="font-medium">{team.supervisor}</p>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Task Status</p>
                        <div className="flex items-center mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="flex h-2.5 rounded-full">
                              <div
                                className="bg-green-500 h-2.5 rounded-l-full"
                                style={{ width: `${(team.completedTasks / team.totalTasks) * 100}%` }}
                              ></div>
                              <div
                                className="bg-yellow-500 h-2.5"
                                style={{
                                  width: `${((team.totalTasks - team.completedTasks - (reportData.taskStatusCounts.delayed || 0)) / team.totalTasks) * 100}%`,
                                }}
                              ></div>
                              <div
                                className="bg-red-500 h-2.5 rounded-r-full"
                                style={{
                                  width: `${((reportData.taskStatusCounts.delayed || 0) / team.totalTasks) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>{team.completedTasks} Completed</span>
                          <span>{team.totalTasks - team.completedTasks} Remaining</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
                          <p className="text-xl font-bold">{team.totalTasks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Review Rate</p>
                          <p className="text-xl font-bold">{team.reviewRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Approval Rate</p>
                          <p className="text-xl font-bold">{team.approvalRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Reviewed Tasks</p>
                          <p className="text-xl font-bold">{team.reviewedTasks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Task Analysis Section */}
        <TabsContent value="task-analysis" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Task Analysis</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Tasks by Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.companyDepartmentData.map((company) => ({
                          name: company.company,
                          value: company.totalTasks,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.companyDepartmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Tasks by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.companyDepartmentData
                        .flatMap((company) =>
                          company.departments.map((dept) => ({
                            name: dept.name,
                            count: dept.count,
                            company: company.company,
                          })),
                        )
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Review Status Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <div className="relative w-32 h-32">
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
                        className="text-blue-500 stroke-current"
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
                      <span className="text-2xl font-bold">{reportData.reviewRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-gray-700 font-medium">Tasks Reviewed</p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-blue-500">{reportData.tasksWithComments}</div>
                  <p className="mt-4 text-center text-gray-700 font-medium">Tasks With Comments</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {((reportData.tasksWithComments / reportData.reviewedTasks) * 100).toFixed(1)}% of reviewed tasks
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-yellow-500">{reportData.tasksRequiringReview}</div>
                  <p className="mt-4 text-center text-gray-700 font-medium">Tasks Pending Review</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {((reportData.tasksRequiringReview / reportData.totalTasks) * 100).toFixed(1)}% of all tasks
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">Company-Department Task Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Company
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Departments
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total Tasks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.companyDepartmentData.map((company, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{company.company}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {company.departments.map((dept, deptIndex) => (
                                <Badge key={deptIndex} className="bg-blue-100 text-blue-800">
                                  {dept.name} ({dept.count})
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{company.totalTasks}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Analysis Section */}
        <TabsContent value="project-analysis" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Project Analysis</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Tasks by Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.projects.slice(0, 5).map((project) => ({
                        name: project.name.length > 20 ? project.name.substring(0, 20) + "..." : project.name,
                        count: project.taskCount,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Tasks" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Project Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.projects.slice(0, 5).map((project) => ({
                          name: project.name.length > 15 ? project.name.substring(0, 15) + "..." : project.name,
                          value: project.taskCount,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
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

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Project Details</h3>

            {reportData.projects.map((project, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{project.name}</span>
                    <Badge className="bg-blue-500 text-white">{project.taskCount} Tasks</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Teams Involved</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.teams.map((team, teamIndex) => (
                          <Badge key={teamIndex} variant="outline" className="bg-gray-100">
                            {team}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Companies</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.companies.map((company, companyIndex) => (
                            <Badge key={companyIndex} className="bg-blue-100 text-blue-800">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Departments</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.departments.map((dept, deptIndex) => (
                            <Badge key={deptIndex} className="bg-purple-100 text-purple-800">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Task Status</p>
                      <div className="space-y-2 mt-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Completed</span>
                            <span>{project.statusCounts.completed || 0} tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-500 h-2.5 rounded-full"
                              style={{ width: `${((project.statusCounts.completed || 0) / project.taskCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>In Progress</span>
                            <span>{project.statusCounts.in_progress || 0} tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-yellow-500 h-2.5 rounded-full"
                              style={{
                                width: `${((project.statusCounts.in_progress || 0) / project.taskCount) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Delayed</span>
                            <span>{project.statusCounts.delayed || 0} tasks</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-red-500 h-2.5 rounded-full"
                              style={{ width: `${((project.statusCounts.delayed || 0) / project.taskCount) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Metrics Section */}
        <TabsContent value="performance-metrics" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Team Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.teamPerformanceMetrics.map((team) => ({
                        name: team.name.length > 15 ? team.name.substring(0, 15) + "..." : team.name,
                        completionRate: team.completionRate,
                        reviewRate: team.reviewRate,
                        approvalRate: team.approvalRate,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: "Rate (%)", angle: -90, position: "insideLeft" }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completionRate" name="Completion Rate" fill="#10b981" />
                      <Bar dataKey="reviewRate" name="Review Rate" fill="#3b82f6" />
                      <Bar dataKey="approvalRate" name="Approval Rate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-700 mb-2">Resource Allocation</h4>
                    <p className="text-blue-600">
                      {reportData.teamTaskCounts[0]?.name || "No team"} has the highest workload with{" "}
                      {reportData.teamTaskCounts[0]?.count || 0} tasks. Consider redistributing tasks or providing
                      additional resources.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <h4 className="font-medium text-yellow-700 mb-2">Review Process</h4>
                    <p className="text-yellow-600">
                      {reportData.tasksRequiringReview} tasks are pending review. Prioritize reviewing tasks to prevent
                      bottlenecks in the workflow.
                    </p>
                  </div>

                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="font-medium text-red-700 mb-2">Delayed Tasks</h4>
                    <p className="text-red-600">
                      {reportData.taskStatusCounts.delayed || 0} tasks are currently delayed. Investigate the causes and
                      implement mitigation strategies.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-700 mb-2">Best Practices</h4>
                    <p className="text-green-600">
                      Study the practices of {reportData.teamCompletionRates[0]?.name || "top teams"} to identify
                      successful strategies that can be applied across other teams.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Team Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Team
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Supervisor
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Total Tasks
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Completion Rate
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Review Rate
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Approval Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.teamPerformanceMetrics.map((team, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{team.supervisor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{team.totalTasks}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${team.completionRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{team.completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${team.reviewRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{team.reviewRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                              <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{ width: `${team.approvalRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{team.approvalRate.toFixed(1)}%</span>
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
      </Tabs>
    </div>
  )
}

export default TaskReportComponent
