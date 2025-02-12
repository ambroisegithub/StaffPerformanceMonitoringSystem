"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Users, Search, CheckCircle, Clock, AlertCircle, ChevronRight, SortAsc, SortDesc } from "lucide-react"
import { Progress } from "../../../ui/progress"
import React from "react"

interface TeamTasksReportProps {
  teams: Array<{
    id: number
    name: string
    description: string
    memberCount: number
    totals: {
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
    members: any[]
  }>
  onTeamSelect: (teamId: string) => void
  selectedTeamId: string | null
}

const TeamTasksReport = ({ teams, onTeamSelect, selectedTeamId }: TeamTasksReportProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Filter teams based on search term
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort teams based on selected field and direction
  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "members":
        comparison = a.memberCount - b.memberCount
        break
      case "tasks":
        comparison = a.totals.totalTasksInDailyTasks - b.totals.totalTasksInDailyTasks
        break
      case "completion":
        const completionA =
          a.totals.totalTasksInDailyTasks > 0
            ? (a.totals.taskStatusCounts.completed / a.totals.totalTasksInDailyTasks) * 100
            : 0
        const completionB =
          b.totals.totalTasksInDailyTasks > 0
            ? (b.totals.taskStatusCounts.completed / b.totals.totalTasksInDailyTasks) * 100
            : 0
        comparison = completionA - completionB
        break
      default:
        comparison = 0
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortField === "name" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("name")}
            className="flex items-center gap-1"
          >
            Name
            {sortField === "name" &&
              (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
          </Button>
          <Button
            variant={sortField === "members" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("members")}
            className="flex items-center gap-1"
          >
            Members
            {sortField === "members" &&
              (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
          </Button>
          <Button
            variant={sortField === "tasks" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("tasks")}
            className="flex items-center gap-1"
          >
            Tasks
            {sortField === "tasks" &&
              (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
          </Button>
          <Button
            variant={sortField === "completion" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("completion")}
            className="flex items-center gap-1"
          >
            Completion
            {sortField === "completion" &&
              (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
          </Button>
        </div>
      </div>

      {/* Teams List */}
      {sortedTeams.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No teams found matching your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTeams.map((team) => {
            // Calculate completion percentage
            const completionPercentage =
              team.totals.totalTasksInDailyTasks > 0
                ? Math.round((team.totals.taskStatusCounts.completed / team.totals.totalTasksInDailyTasks) * 100)
                : 0

            // Calculate review percentage
            const reviewedPercentage =
              team.totals.totalTasksInDailyTasks > 0
                ? Math.round(
                    ((team.totals.reviewStatusCounts.approved + team.totals.reviewStatusCounts.rejected) /
                      team.totals.totalTasksInDailyTasks) *
                      100,
                  )
                : 0

            return (
              <Card
                key={team.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedTeamId === team.id.toString() ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => onTeamSelect(team.id.toString())}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      {team.name}
                    </CardTitle>
                    <Badge>{team.memberCount} members</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{team.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Tasks</p>
                        <p className="text-xl font-bold">{team.totals.totalTasksInDailyTasks}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Submissions</p>
                        <p className="text-xl font-bold">{team.totals.dailyTasksSubmitted}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <CheckCircle className="h-4 w-4 text-green mr-1" /> Completed
                        </span>
                        <span className="text-sm font-medium">{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 text-blue mr-1" /> In Progress
                        </span>
                        <span className="text-sm font-medium">{team.totals.taskStatusCounts.in_progress}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 text-red mr-1" /> Delayed
                        </span>
                        <span className="text-sm font-medium">{team.totals.taskStatusCounts.delayed}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-gray-500">{reviewedPercentage}% reviewed</span>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        View Details <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TeamTasksReport

