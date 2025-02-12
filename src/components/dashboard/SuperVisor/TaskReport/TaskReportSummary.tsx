"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import { CheckCircle, Clock, AlertCircle, Calendar, FileText, User } from "lucide-react"
import { Progress } from "../../../ui/progress"
import React from "react"

interface TaskReportSummaryProps {
  supervisor: {
    id: number
    name: string
    level: string
  }
  dateRange: {
    startDate: string
    endDate: string
    year: number
    month: number
    monthName: string
  } | null
  overallTotals: {
    teams: number
    members: number
    tasksCreated: number
    dailyTasksSubmitted: number
    totalTasksInDailyTasks: number
    taskStatusCounts: {
      pending: number
      in_progress: number
      completed: number
      delayed: number
    }
    reviewStatusCounts: {
      pending: number
      approved: number
      rejected: number
    }
  }
}

const TaskReportSummary = ({ supervisor, dateRange, overallTotals }: TaskReportSummaryProps) => {
  // Calculate percentages for progress bars
  const totalTasks = overallTotals.totalTasksInDailyTasks

  const completionPercentage =
    totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.completed / totalTasks) * 100) : 0

  const reviewedPercentage =
    totalTasks > 0
      ? Math.round(
          ((overallTotals.reviewStatusCounts.approved + overallTotals.reviewStatusCounts.rejected) / totalTasks) * 100,
        )
      : 0

  const approvalPercentage =
    overallTotals.reviewStatusCounts.approved + overallTotals.reviewStatusCounts.rejected > 0
      ? Math.round(
          (overallTotals.reviewStatusCounts.approved /
            (overallTotals.reviewStatusCounts.approved + overallTotals.reviewStatusCounts.rejected)) *
            100,
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Supervisor and Date Range Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 mr-2" />
              Supervisor Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{supervisor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Level:</span>
                <Badge>{supervisor.level}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teams:</span>
                <span className="font-medium">{overallTotals.teams}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Team Members:</span>
                <span className="font-medium">{overallTotals.members}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dateRange ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Period:</span>
                    <span className="font-medium">
                      {dateRange.startDate} to {dateRange.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Month:</span>
                    <span className="font-medium">{dateRange.monthName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Year:</span>
                    <span className="font-medium">{dateRange.year}</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-center">No date range specified</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <FileText className="h-8 w-8 text-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <h3 className="text-2xl font-bold">{overallTotals.totalTasksInDailyTasks}</h3>
                <p className="text-sm text-blue">{overallTotals.dailyTasksSubmitted} submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <CheckCircle className="h-8 w-8 text-green" />
              </div>
              <div className="w-full">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <h3 className="text-2xl font-bold">{completionPercentage}%</h3>
                <Progress value={completionPercentage} className="h-2 mt-2" />
                <p className="text-sm text-green mt-1">{overallTotals.taskStatusCounts.completed} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <Clock className="h-8 w-8 text-yellow" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <h3 className="text-2xl font-bold">{overallTotals.taskStatusCounts.in_progress}</h3>
                <p className="text-sm text-yellow">{overallTotals.taskStatusCounts.pending} pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <AlertCircle className="h-8 w-8 text-red" />
              </div>
              <div className="w-full">
                <p className="text-sm text-gray-500">Review Status</p>
                <h3 className="text-2xl font-bold">{reviewedPercentage}% reviewed</h3>
                <Progress value={reviewedPercentage} className="h-2 mt-2" />
                <p className="text-sm text-blue mt-1">
                  {overallTotals.reviewStatusCounts.approved} approved / {overallTotals.reviewStatusCounts.rejected}{" "}
                  rejected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm font-medium">
                  {totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.in_progress / totalTasks) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.in_progress / totalTasks) * 100) : 0}
                className="h-2 bg-gray-200"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Delayed</span>
                <span className="text-sm font-medium">
                  {totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.delayed / totalTasks) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.delayed / totalTasks) * 100) : 0}
                className="h-2 bg-gray-200"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Pending</span>
                <span className="text-sm font-medium">
                  {totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.pending / totalTasks) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalTasks > 0 ? Math.round((overallTotals.taskStatusCounts.pending / totalTasks) * 100) : 0}
                className="h-2 bg-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskReportSummary

