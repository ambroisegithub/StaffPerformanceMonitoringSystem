// @ts-nocheck

"use client"

import { useMemo } from "react"
import { Card, CardContent } from "../../../ui/Card"

import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import type { TeamTasksData } from "../../../../Redux/Slices/TaskReviewSlice"
import React from "react"

interface TaskReportComponentProps {
  teamTasks: TeamTasksData[]
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8884d8", "#82ca9d"]

const TaskReportComponent = ({ teamTasks }: TaskReportComponentProps) => {
  // Calculate statistics from the team tasks data
  const stats = useMemo(() => {
    if (!teamTasks || teamTasks.length === 0) return null

    let totalTasks = 0
    let reviewedTasks = 0
    let nonReviewedTasks = 0
    const statusCounts = {
      completed: 0,
      in_progress: 0,
      pending: 0,
      delayed: 0,
    }
    const reviewStatusCounts = {
      approved: 0,
      rejected: 0,
      pending: 0,
    }
    const tasksByUser = {}
    const tasksByDate = {}

    // Process all tasks from all users and dates
    teamTasks.forEach((memberData) => {
      // Track tasks by user
      const userName = `${memberData.user.firstName} ${memberData.user.lastName}`
      tasksByUser[userName] = 0

      // Process each submission date
      Object.values(memberData.submissions).forEach((submission) => {
        const date = new Date(submission.date).toLocaleDateString()

        if (!tasksByDate[date]) {
          tasksByDate[date] = 0
        }

        submission.tasks.forEach((task) => {
          totalTasks++
          tasksByUser[userName]++
          tasksByDate[date]++

          // Count by review status
          if (task.reviewed) {
            reviewedTasks++
          } else {
            nonReviewedTasks++
          }

          // Count by task status
          if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status]++
          }

          // Count by review status
          if (reviewStatusCounts[task.review_status] !== undefined) {
            reviewStatusCounts[task.review_status]++
          }
        })
      })
    })

    // Prepare data for charts
    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace("_", " "),
      value: count,
    }))

    const reviewStatusChartData = [
      { name: "Reviewed", value: reviewedTasks },
      { name: "Not Reviewed", value: nonReviewedTasks },
    ]

    const userTasksData = Object.entries(tasksByUser).map(([name, count]) => ({
      name,
      tasks: count,
    }))

    const dateTasksData = Object.entries(tasksByDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({
        date,
        tasks: count,
      }))

    return {
      totalTasks,
      reviewedTasks,
      nonReviewedTasks,
      reviewPercentage: totalTasks ? Math.round((reviewedTasks / totalTasks) * 100) : 0,
      statusCounts,
      reviewStatusCounts,
      statusChartData,
      reviewStatusChartData,
      userTasksData,
      dateTasksData,
      userCount: Object.keys(tasksByUser).length,
      submissionDates: Object.keys(tasksByDate).length,
    }
  }, [teamTasks])

  if (!stats) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No task data available for reporting</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Task Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <FileText className="h-8 w-8 text-blue" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <h3 className="text-2xl font-bold">{stats.totalTasks}</h3>
                <p className="text-sm text-gray-500">{stats.userCount} team members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <CheckCircle className="h-8 w-8 text-green" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reviewed Tasks</p>
                <h3 className="text-2xl font-bold">{stats.reviewedTasks}</h3>
                <p className="text-sm text-green">{stats.reviewPercentage}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <AlertTriangle className="h-8 w-8 text-red" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Not Reviewed Tasks</p>
                <h3 className="text-2xl font-bold">{stats.nonReviewedTasks}</h3>
                <p className="text-sm text-red">Needs review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                <Clock className="h-8 w-8 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress Tasks</p>
                <h3 className="text-2xl font-bold">{stats.statusCounts.in_progress}</h3>
                <p className="text-sm text-[#f59e0b]">Needs attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TaskReportComponent

