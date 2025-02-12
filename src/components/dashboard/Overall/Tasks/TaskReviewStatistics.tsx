import React from "react"
import { Card, CardContent } from "../../../ui/Card"
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

interface TaskStatistics {
  tasksByStatus: { status: string; count: string }[]
  tasksByReviewStatus: { review_status: string; count: string }[]
  tasksByUser: {
    id: string
    firstName: string
    lastName: string
    supervisoryLevel: string
    taskCount: string
  }[]
  teamMemberCount: number
}

interface TaskReviewStatisticsProps {
  statistics: TaskStatistics
}

const TaskReviewStatistics: React.FC<TaskReviewStatisticsProps> = ({ statistics }) => {
  // Format data for status chart
  const statusData = statistics.tasksByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    count: Number.parseInt(item.count),
  }))

  // Format data for review status chart
  const reviewStatusData = statistics.tasksByReviewStatus.map((item) => ({
    name: item.review_status.charAt(0).toUpperCase() + item.review_status.slice(1),
    count: Number.parseInt(item.count),
  }))

  // Format data for user tasks chart
  const userTasksData = statistics.tasksByUser
    .map((item) => ({
      name: `${item.firstName} ${item.lastName}`,
      count: Number.parseInt(item.taskCount),
      level: item.supervisoryLevel,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Show top 5 users

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Tasks by Review Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={reviewStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {reviewStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-4">Top 5 Users by Task Count</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userTasksData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Task Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default TaskReviewStatistics

