"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "../../../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import React from "react"

interface DashboardHeaderProps {
  timeRange: string
  setTimeRange: (range: string) => void
  handleRefresh: () => void
}

const DashboardHeader = ({ timeRange, setTimeRange, handleRefresh }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Supervisor Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Monitor team performance and task metrics</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 z-10">
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
        </div>


        <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}

export default DashboardHeader

