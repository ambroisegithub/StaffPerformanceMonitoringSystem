// @ts-nocheck

"use client"
import React from "react"
import { motion } from "framer-motion"
import { FaCheckCircle, FaClock, FaExclamationCircle, FaCalendarCheck, FaChartLine } from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"

interface Task {
  status: string
  reviewed: boolean
}

interface DailyTask {
  tasks: Task[]
  submitted: boolean
}

interface TaskStatisticsProps {
  dailyTasks: DailyTask[]
}

const TaskStatistics: React.FC<TaskStatisticsProps> = ({ dailyTasks }) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    let totalTasks = 0
    let completed = 0
    let inProgress = 0
    let delayed = 0
    let reviewed = 0
    let submitted = 0

    dailyTasks.forEach((dailyTask) => {
      totalTasks += dailyTask.tasks.length

      dailyTask.tasks.forEach((task) => {
        if (task.status === "completed") completed++
        if (task.status === "in_progress") inProgress++
        if (task.status === "delayed") delayed++
        if (task.reviewed) reviewed++
      })

      if (dailyTask.submitted) submitted++
    })

    return {
      totalTasks,
      completed,
      inProgress,
      delayed,
      reviewed,
      submitted,
      completionRate: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0,
      reviewRate: totalTasks > 0 ? Math.round((reviewed / totalTasks) * 100) : 0,
    }
  }, [dailyTasks])

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
  }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`${color} p-4 flex items-center justify-center`}>
            <div className="text-white text-2xl">{icon}</div>
          </div>
          <div className="p-4 flex-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2" /> Task Statistics
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={<FaCalendarCheck />} color="bg-blue" />
        <StatCard
          title="Completed"
          value={`${stats.completed} (${stats.completionRate}%)`}
          icon={<FaCheckCircle />}
          color="bg-green"
        />
        <StatCard title="In Progress" value={stats.inProgress} icon={<FaClock />} color="bg-blue" />
        <StatCard title="Delayed" value={stats.delayed} icon={<FaExclamationCircle />} color="bg-red" />
      </div>
    </motion.div>
  )
}

export default TaskStatistics

