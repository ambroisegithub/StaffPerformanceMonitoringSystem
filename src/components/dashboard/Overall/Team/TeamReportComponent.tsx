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
  LineChart,
  Line,
} from "recharts"
import {
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  BarChart2,
  PieChartIcon,
  TrendingUp,
} from "lucide-react"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"

interface TeamReportComponentProps {
  teams: Team[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

const TeamReportComponent: React.FC<TeamReportComponentProps> = ({ teams }) => {
  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (!teams.length) return null

    // Total teams count
    const totalTeams = teams.length
    const activeTeams = teams.filter((team) => team.isActive).length
    const inactiveTeams = totalTeams - activeTeams

    // Team size distribution
    const teamSizes = teams.map((team) => team.members.length)
    const totalMembers = teamSizes.reduce((sum, size) => sum + size, 0)
    const averageMembersPerTeam = totalMembers / totalTeams || 0
    const largestTeamSize = Math.max(...teamSizes, 0)
    const smallestTeamSize = Math.min(...teamSizes, 0)

    // Teams with critical understaffing (less than 2 members)
    const understaffedTeams = teams.filter((team) => team.members.length < 2).length

    // Team creation timeline
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentlyCreatedTeams = teams.filter((team) => new Date(team.created_at) > thirtyDaysAgo).length

    // Team size distribution data
    const teamSizeDistribution = [
      { name: "0-2 members", count: teams.filter((team) => team.members.length <= 2).length },
      {
        name: "3-5 members",
        count: teams.filter((team) => team.members.length > 2 && team.members.length <= 5).length,
      },
      {
        name: "6-10 members",
        count: teams.filter((team) => team.members.length > 5 && team.members.length <= 10).length,
      },
      { name: "10+ members", count: teams.filter((team) => team.members.length > 10).length },
    ]

    // Supervisor workload
    const supervisorCounts = new Map<number, number>()
    teams.forEach((team) => {
      supervisorCounts.set(team.supervisorId, (supervisorCounts.get(team.supervisorId) || 0) + 1)
    })

    const supervisorsWithMultipleTeams = Array.from(supervisorCounts.values()).filter((count) => count > 1).length

    // User role distribution
    const allMembers: any[] = []
    teams.forEach((team) => {
      team.members.forEach((member) => {
        if (!allMembers.some((m) => m.id === member.id)) {
          allMembers.push(member)
        }
      })
    })

    const roleDistribution = allMembers.reduce(
      (acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const roleDistributionData = Object.entries(roleDistribution).map(([role, count]) => ({
      name: role,
      value: count,
    }))

    // Team verification status
    const teamsWithAllVerifiedMembers = teams.filter(
      (team) => team.members.length > 0 && team.members.every((member) => member.isVerified),
    ).length

    const percentageTeamsAllVerified = (teamsWithAllVerifiedMembers / totalTeams) * 100 || 0

    // First-time login pending
    const usersNeedingFirstLogin = allMembers.filter((member) => member.isFirstLogin).length
    const percentageFirstLoginPending = (usersNeedingFirstLogin / allMembers.length) * 100 || 0

    // Team creation by month (last 6 months)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return date.toLocaleString("default", { month: "short", year: "numeric" })
    }).reverse()

    const teamsByMonth = last6Months.map((monthYear) => {
      const [month, year] = monthYear.split(" ")
      const count = teams.filter((team) => {
        const creationDate = new Date(team.created_at)
        return (
          creationDate.toLocaleString("default", { month: "short" }) === month &&
          creationDate.getFullYear().toString() === year
        )
      }).length

      return { name: monthYear, count }
    })

    return {
      totalTeams,
      activeTeams,
      inactiveTeams,
      averageMembersPerTeam,
      largestTeamSize,
      smallestTeamSize,
      understaffedTeams,
      recentlyCreatedTeams,
      teamSizeDistribution,
      supervisorsWithMultipleTeams,
      roleDistributionData,
      percentageTeamsAllVerified,
      percentageFirstLoginPending,
      teamsByMonth,
    }
  }, [teams])

  if (!teamStats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow mb-4" />
            <h3 className="text-lg font-medium">No team data available</h3>
            <p className="text-gray-500 mt-2">Please create teams to view reports</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Statistics */}
      <div>
        <h2 className="text-xl font-bold mb-4">Team Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 bg-blue p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Teams</p>
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold">{teamStats.totalTeams}</h3>
                    <Badge className="ml-2 bg-green text-white">{teamStats.activeTeams} Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 bg-green p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg. Members per Team</p>
                  <h3 className="text-2xl font-bold">{teamStats.averageMembersPerTeam.toFixed(1)}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 bg-yellow p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Recently Created Teams</p>
                  <h3 className="text-2xl font-bold">{teamStats.recentlyCreatedTeams}</h3>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="mr-4 bg-red p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Understaffed Teams</p>
                  <h3 className="text-2xl font-bold">{teamStats.understaffedTeams}</h3>
                  <p className="text-xs text-gray-500">Less than 2 members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Size Distribution & Creation Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2" />
              Team Size Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamStats.teamSizeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Number of Teams" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Team Creation Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={teamStats.teamsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" name="Teams Created" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              User Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamStats.roleDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {teamStats.roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Team Status Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Active vs Inactive Teams</span>
                  <span className="text-sm font-medium">
                    {teamStats.activeTeams}/{teamStats.totalTeams}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green h-2.5 rounded-full"
                    style={{ width: `${(teamStats.activeTeams / teamStats.totalTeams) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Teams with All Members Verified</span>
                  <span className="text-sm font-medium">{teamStats.percentageTeamsAllVerified.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue h-2.5 rounded-full"
                    style={{ width: `${teamStats.percentageTeamsAllVerified}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Users Pending First Login</span>
                  <span className="text-sm font-medium">{teamStats.percentageFirstLoginPending.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow h-2.5 rounded-full"
                    style={{ width: `${teamStats.percentageFirstLoginPending}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Supervisors with Multiple Teams</p>
                      <p className="text-xl font-bold">{teamStats.supervisorsWithMultipleTeams}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Team Size Range</p>
                      <p className="text-xl font-bold">
                        {teamStats.smallestTeamSize} - {teamStats.largestTeamSize}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamReportComponent

