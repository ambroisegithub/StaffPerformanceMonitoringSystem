"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import {
  Users,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ChevronRight,
  ChevronDown,
  SortAsc,
  SortDesc,
  Mail,
} from "lucide-react"
import { Progress } from "../../../ui/progress"
import { format } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import React from "react"

interface MemberTasksReportProps {
  team: {
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
    members: Array<{
      id: number
      name: string
      username: string
      email: string
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
      dailyTasks: Array<{
        id: number
        date: string
        submitted: boolean
        taskCount: number
        tasks: Array<{
          id: number
          title: string
          status: string
          review_status: string
          reviewed: boolean
          company: string
          related_project: string
        }>
      }>
    }>
  }
  onMemberSelect: (memberId: string) => void
  selectedMemberId: string | null
  selectedMember: any
}

const MemberTasksReport = ({ team, onMemberSelect, selectedMemberId, selectedMember }: MemberTasksReportProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [expandedDailyTasks, setExpandedDailyTasks] = useState<Record<string, boolean>>({})

  // Filter members based on search term
  const filteredMembers = team.members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort members based on selected field and direction
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "tasks":
        comparison = a.totalTasksInDailyTasks - b.totalTasksInDailyTasks
        break
      case "completion":
        const completionA =
          a.totalTasksInDailyTasks > 0 ? (a.taskStatusCounts.completed / a.totalTasksInDailyTasks) * 100 : 0
        const completionB =
          b.totalTasksInDailyTasks > 0 ? (b.taskStatusCounts.completed / b.totalTasksInDailyTasks) * 100 : 0
        comparison = completionA - completionB
        break
      case "submissions":
        comparison = a.dailyTasksSubmitted - b.dailyTasksSubmitted
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

  const toggleDailyTask = (taskId: number) => {
    setExpandedDailyTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green text-white"
      case "in_progress":
        return "bg-blue text-white"
      case "delayed":
        return "bg-red text-white"
      default:
        return "bg-yellow text-white"
    }
  }

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green text-white"
      case "rejected":
        return "bg-red text-white"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  return (
    <div className="space-y-6">
      {selectedMemberId && selectedMember ? (
        <MemberDetails
          member={selectedMember}
          expandedDailyTasks={expandedDailyTasks}
          toggleDailyTask={toggleDailyTask}
          getStatusColor={getStatusColor}
          getReviewStatusColor={getReviewStatusColor}
        />
      ) : (
        <>
          {/* Team Header */}
          <Card>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-xl font-bold">{team.totals.totalTasksInDailyTasks}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submissions</p>
                  <p className="text-xl font-bold">{team.totals.dailyTasksSubmitted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-xl font-bold">{team.totals.taskStatusCounts.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-xl font-bold">{team.totals.taskStatusCounts.in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
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
              <Button
                variant={sortField === "submissions" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort("submissions")}
                className="flex items-center gap-1"
              >
                Submissions
                {sortField === "submissions" &&
                  (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
              </Button>
            </div>
          </div>

          {/* Members List */}
          {sortedMembers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No members found matching your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedMembers.map((member) => {
                // Calculate completion percentage
                const completionPercentage =
                  member.totalTasksInDailyTasks > 0
                    ? Math.round((member.taskStatusCounts.completed / member.totalTasksInDailyTasks) * 100)
                    : 0

                // Calculate review percentage
                const reviewedPercentage =
                  member.totalTasksInDailyTasks > 0
                    ? Math.round(
                        ((member.reviewStatusCounts.approved + member.reviewStatusCounts.rejected) /
                          member.totalTasksInDailyTasks) *
                          100,
                      )
                    : 0

                return (
                  <Card
                    key={member.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      selectedMemberId === member.id.toString() ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => onMemberSelect(member.id.toString())}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <p className="text-sm text-gray-500">@{member.username}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Total Tasks</p>
                            <p className="text-xl font-bold">{member.totalTasksInDailyTasks}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Submissions</p>
                            <p className="text-xl font-bold">{member.dailyTasksSubmitted}</p>
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium flex items-center">
                              <Clock className="h-4 w-4 text-blue mr-1" /> In Progress
                            </span>
                            <span className="text-sm font-medium">{member.taskStatusCounts.in_progress}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium flex items-center">
                              <AlertCircle className="h-4 w-4 text-red mr-1" /> Delayed
                            </span>
                            <span className="text-sm font-medium">{member.taskStatusCounts.delayed}</span>
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
        </>
      )}
    </div>
  )
}

// Member Details Component
const MemberDetails = ({
  member,
  expandedDailyTasks,
  toggleDailyTask,
  getStatusColor,
  getReviewStatusColor,
}: {
  member: any
  expandedDailyTasks: Record<string, boolean>
  toggleDailyTask: (taskId: number) => void
  getStatusColor: (status: string) => string
  getReviewStatusColor: (status: string) => string
}) => {
  // Calculate completion percentage
  const completionPercentage =
    member.totalTasksInDailyTasks > 0
      ? Math.round((member.taskStatusCounts.completed / member.totalTasksInDailyTasks) * 100)
      : 0

  // Calculate review percentage
  const reviewedPercentage =
    member.totalTasksInDailyTasks > 0
      ? Math.round(
          ((member.reviewStatusCounts.approved + member.reviewStatusCounts.rejected) / member.totalTasksInDailyTasks) *
            100,
        )
      : 0

  return (
    <>
      {/* Member Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarFallback>
                  {member.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">@{member.username}</Badge>
                  <Badge variant="outline" className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {member.email}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-xl font-bold">{member.totalTasksInDailyTasks}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submissions</p>
              <p className="text-xl font-bold">{member.dailyTasksSubmitted}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold">{member.taskStatusCounts.completed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-xl font-bold">{member.taskStatusCounts.in_progress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <span className="text-sm font-medium">
                    {member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.in_progress / member.totalTasksInDailyTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.in_progress / member.totalTasksInDailyTasks) * 100)
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <AlertCircle className="h-4 w-4 text-red mr-1" /> Delayed
                  </span>
                  <span className="text-sm font-medium">
                    {member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.delayed / member.totalTasksInDailyTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.delayed / member.totalTasksInDailyTasks) * 100)
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 text-yellow mr-1" /> Pending
                  </span>
                  <span className="text-sm font-medium">
                    {member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.pending / member.totalTasksInDailyTasks) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    member.totalTasksInDailyTasks > 0
                      ? Math.round((member.taskStatusCounts.pending / member.totalTasksInDailyTasks) * 100)
                      : 0
                  }
                  className="h-2 bg-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Review Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Reviewed</span>
                  <span className="text-sm font-medium">{reviewedPercentage}%</span>
                </div>
                <Progress value={reviewedPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-xl font-bold text-green">{member.reviewStatusCounts.approved}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rejected</p>
                  <p className="text-xl font-bold text-red">{member.reviewStatusCounts.rejected}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-xl font-bold text-yellow">{member.reviewStatusCounts.pending}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Tasks</p>
                  <p className="text-xl font-bold">{member.totalTasksInDailyTasks}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Task Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {member.dailyTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">No daily task submissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {member.dailyTasks.map((dailyTask: any) => (
                <Collapsible
                  key={dailyTask.id}
                  open={expandedDailyTasks[dailyTask.id]}
                  onOpenChange={() => toggleDailyTask(dailyTask.id)}
                  className="border rounded-lg overflow-hidden"
                >
                  <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">{format(new Date(dailyTask.date), "MMMM d, yyyy")}</p>
                        <p className="text-sm text-gray-500">Submitted: {format(new Date(dailyTask.date), "h:mm a")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>{dailyTask.taskCount} tasks</Badge>
                      {expandedDailyTasks[dailyTask.id] ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 border-t">
                      <div className="space-y-3">
                        {dailyTask.tasks.map((task: any) => (
                          <div key={task.id} className="border rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="flex gap-2">
                                <Badge className={getStatusColor(task.status)}>{task.status.replace("_", " ")}</Badge>
                                <Badge className={getReviewStatusColor(task.review_status)}>
                                  {task.reviewed ? task.review_status : "pending"}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Company:</span> {task.company}
                              </div>
                              <div>
                                <span className="text-gray-500">Project:</span> {task.related_project}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default MemberTasksReport

