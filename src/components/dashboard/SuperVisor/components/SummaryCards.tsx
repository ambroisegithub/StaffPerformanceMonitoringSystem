import React from "react"
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent } from "../../../ui/Card"

interface SummaryCardsProps {
  summary: {
    totalTeams: number
    totalMembers: number
    totalTasks: number
    taskStatusCounts: {
      completed: number
      pending: number
      in_progress: number
      delayed: number
    }
  }
}

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        icon={<Users className="h-8 w-8 text-blue" />}
        title="Total Teams"
        value={summary.totalTeams}
        subtitle={`${summary.totalMembers} members`}
      />

      <SummaryCard
        icon={<CheckCircle className="h-8 w-8 text-green" />}
        title="Completed Tasks"
        value={summary.taskStatusCounts.completed}
        subtitle={`${
          summary.taskStatusCounts.completed > 0
            ? Math.round((summary.taskStatusCounts.completed / summary.totalTasks) * 100)
            : 0
        }% of total`}
        subtitleColor="text-green"
      />

      <SummaryCard
        icon={<Clock className="h-8 w-8 text-yellow" />}
        title="Pending Tasks"
        value={summary.taskStatusCounts.pending + summary.taskStatusCounts.in_progress}
        subtitle="Needs attention"
        subtitleColor="text-yellow"
      />

      <SummaryCard
        icon={<AlertCircle className="h-8 w-8 text-red" />}
        title="Delayed Tasks"
        value={summary.taskStatusCounts.delayed}
        subtitle="Requires action"
        subtitleColor="text-red"
      />
    </div>
  )
}

interface SummaryCardProps {
  icon: React.ReactNode
  title: string
  value: number
  subtitle: string
  subtitleColor?: string
}

const SummaryCard = ({ icon, title, value, subtitle, subtitleColor = "text-gray-500" }: SummaryCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="mr-4">{icon}</div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className={`text-sm ${subtitleColor} dark:${subtitleColor}`}>{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SummaryCards

