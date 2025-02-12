import { TrendingUp, Calendar } from "lucide-react"
import { Card, CardHeader, CardContent, CardTitle } from "../../../../ui/Card"
import { Badge } from "../../../../ui/Badge"
import { TEChart } from "tw-elements-react"
import React from "react"

interface OverviewTabProps {
  monthlyTrends: any[]
  recentActivity: any[]
}

interface ActivityItemProps {
  activity: {
    id: string | number
    created_by: string
    title: string
    status: string
    created_at: string
  }
}

const ActivityItem = ({ activity }: ActivityItemProps) => {
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
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors space-y-2">
      <div className="flex items-center space-x-3">
        <div className="flex-grow">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.created_by}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.title}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.created_at).toLocaleString()}</div>
      </div>
    </div>
  )
}

const OverviewTab = ({ monthlyTrends, recentActivity }: OverviewTabProps) => {
  // Transform monthlyTrends data for TEChart
  const chartData = {
    labels: monthlyTrends.map((item) => item.month),
    datasets: [
      {
        label: "Completed",
        data: monthlyTrends.map((item) => item.completed),
        backgroundColor: "#10b981",
      },
      {
        label: "In Progress",
        data: monthlyTrends.map((item) => item.in_progress),
        backgroundColor: "#3b82f6",
      },
      {
        label: "Pending",
        data: monthlyTrends.map((item) => item.pending),
        backgroundColor: "#f59e0b",
      },
      {
        label: "Delayed",
        data: monthlyTrends.map((item) => item.delayed),
        backgroundColor: "#ef4444",
      },
    ],
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Monthly Trends Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Monthly Task Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <TEChart
              type="bar"
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OverviewTab

