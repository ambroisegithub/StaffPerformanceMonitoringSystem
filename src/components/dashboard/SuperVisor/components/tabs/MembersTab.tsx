"use client"

import React from "react"
import { useState } from "react"

import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building,
  Briefcase,
  ChevronRight,
} from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../../../../ui/Card"
import { Badge } from "../../../../ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "../../../../ui/button"

interface MembersTabProps {
  teamPerformance: any[]
  selectedTeam: string
  selectedTeamData: any
  selectedMember: string
  memberPerformance: any
  handleTeamChange: (teamId: string) => void
  handleMemberChange: (memberId: string) => void
}

const MembersTab = ({
  teamPerformance,
  selectedTeam,
  selectedTeamData,
  selectedMember,
  memberPerformance,
  handleTeamChange,
  handleMemberChange,
}: MembersTabProps) => {
  return (
    <>
      {/* Member Selection */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Team</label>
              <Select value={selectedTeam} onValueChange={handleTeamChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teamPerformance.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeamData && (
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Member</label>
                <Select value={selectedMember} onValueChange={handleMemberChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {selectedTeamData.memberPerformance.map((member:any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Member Performance Details */}
      {memberPerformance ? (
        <MemberPerformanceDetails memberPerformance={memberPerformance} />
      ) : selectedTeamData ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select a Team Member</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Choose a team member from the dropdown to view their performance details.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No Teams Selected</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Please select a team to view member performance.</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

interface MemberPerformanceDetailsProps {
  memberPerformance: any
}

const MemberPerformanceDetails = ({ memberPerformance }: MemberPerformanceDetailsProps) => {
  const [showAllTasks, setShowAllTasks] = useState(false)

  return (
    <>
      {/* Member Info */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium">{memberPerformance.member.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
              <p className="font-medium">{memberPerformance.member.department}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
              <p className="font-medium">{memberPerformance.member.company}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
              <p className="font-medium">{memberPerformance.member.position}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Team</p>
              <p className="font-medium">{memberPerformance.member.team}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
              <p className="font-medium">{memberPerformance.member.supervisor}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceCard
          icon={<FileText className="h-8 w-8 text-blue-500" />}
          title="Total Tasks"
          value={memberPerformance.summary.totalTasks}
        />

        <PerformanceCard
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="Completion Rate"
          value={`${Math.round(memberPerformance.summary.completionRate)}%`}
          subtitle={`${memberPerformance.summary.taskStatusCounts.completed} completed`}
          subtitleColor="text-green-500"
        />

        <PerformanceCard
          icon={<Clock className="h-8 w-8 text-yellow-500" />}
          title="Pending Tasks"
          value={
            memberPerformance.summary.taskStatusCounts.pending + memberPerformance.summary.taskStatusCounts.in_progress
          }
        />

        <PerformanceCard
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Approval Rate"
          value={`${Math.round(memberPerformance.summary.approvalRate)}%`}
          subtitle={`${memberPerformance.summary.reviewStatusCounts.approved} approved`}
          subtitleColor="text-blue-500"
        />
      </div>

      {/* Monthly Performance Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={memberPerformance.monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="total" name="Total Tasks" stroke="#8884d8" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="completionRate"
                  name="Completion Rate (%)"
                  stroke="#82ca9d"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="approvalRate"
                  name="Approval Rate (%)"
                  stroke="#ffc658"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks - Compact Grid Card */}
      <Card className="shadow-sm">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Recent Tasks
            </div>
            <Badge className="text-xs py-0.5 px-1.5 h-5">
              {memberPerformance.dailyTasks.reduce((acc: number, task: any) => acc + task.taskCount, 0)} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          {memberPerformance.dailyTasks.length === 0 ? (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">No recent tasks available</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {memberPerformance.dailyTasks.slice(0, showAllTasks ? undefined : 2).map((dailyTask: any) => (
                <DailyTaskItem key={dailyTask.id} dailyTask={dailyTask} />
              ))}
            </div>
          )}
        </CardContent>

        {memberPerformance.dailyTasks.length > 2 && !showAllTasks && (
          <CardFooter className="p-2 pt-0 flex justify-center border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 w-full px-2 text-blue"
              onClick={() => setShowAllTasks(true)}
            >
              View all {memberPerformance.dailyTasks.length} tasks
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  )
}

interface PerformanceCardProps {
  icon: React.ReactNode
  title: string
  value: number | string
  subtitle?: string
  subtitleColor?: string
}

const PerformanceCard = ({ icon, title, value, subtitle, subtitleColor = "text-gray-500" }: PerformanceCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="mr-4">{icon}</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {subtitle && <p className={`text-sm ${subtitleColor} dark:${subtitleColor}`}>{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DailyTaskItemProps {
  dailyTask: {
    id: number | string
    date: string
    taskCount: number
    tasks: {
      id: number | string
      title: string
      description: string
      status: string
      company?: string
      department?: string
      related_project?: string
    }[]
  }
}

const DailyTaskItem = ({ dailyTask }: DailyTaskItemProps) => {
  const [expanded, setExpanded] = useState(false)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green text-white dark:bg-green dark:text-white"
      case "delayed":
        return "bg-red text-white dark:bg-red dark:text-white"
      default:
        return "bg-blue text-white dark:bg-blue dark:text-white"
    }
  }

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-800 px-2 py-1 border-b flex justify-between items-center">
        <h3 className="text-xs font-medium">{new Date(dailyTask.date).toLocaleDateString()}</h3>
        <Badge className="text-xs py-0 px-1.5 h-4">{dailyTask.taskCount}</Badge>
      </div>
      <div className="divide-y">
        {dailyTask.tasks.slice(0, expanded ? undefined : 1).map((task) => (
          <div key={task.id} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex justify-between items-start mb-0.5">
              <h4 className="text-xs font-medium line-clamp-1">{task.title}</h4>
              <Badge className={`text-xs py-0 px-1.5 h-4 ml-1 ${getStatusColor(task.status)}`}>{task.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 line-clamp-1">{task.description}</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {task.company && (
                <div className="flex items-center">
                  <Building className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                  <span className="text-xs">{task.company}</span>
                </div>
              )}
              {task.department && (
                <div className="flex items-center ml-1">
                  <Briefcase className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                  <span className="text-xs">{task.department}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {dailyTask.tasks.length > 1 && (
        <div className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border-t text-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-5 px-1 w-full text-blue hover:bg-white dark:hover:bg-gray-700"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : `+${dailyTask.tasks.length - 1} more`}
            {!expanded && <ChevronRight className="ml-0.5 h-2.5 w-2.5" />}
          </Button>
        </div>
      )}
    </div>
  )
}

export default MembersTab

