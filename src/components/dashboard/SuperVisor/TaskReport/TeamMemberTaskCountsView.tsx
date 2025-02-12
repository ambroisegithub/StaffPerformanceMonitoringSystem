// @ts-nocheck

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import { Button } from "../../../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Calendar, ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, User } from 'lucide-react'
import { Progress } from "../../../ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../ui/collapsible"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import React from "react"

interface TeamMemberTaskCountsViewProps {
  data: {
    supervisor: {
      id: number
      name: string
      level: string
    }
    dateRange: {
      startDate: string
      endDate: string
      month: number
      year: number
    }
    teams: Array<{
      id: number
      name: string
      description: string
      memberCount: number
      members: Array<{
        id: number
        name: string
        username: string
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
          submittedAt: string
        }>
      }>
    }>
  }
  loading: boolean
  error: string | null
}

const TeamMemberTaskCountsView = ({ data, loading, error }: TeamMemberTaskCountsViewProps) => {
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({})
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({})
  const [expandedDailyTasks, setExpandedDailyTasks] = useState<Record<string, boolean>>({})

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading team member task counts...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No data available. Please adjust your filters or try again later.</p>
        </CardContent>
      </Card>
    )
  }

  const toggleTeam = (teamId: number) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }))
  }

  const toggleMember = (memberId: number) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }))
  }

  const toggleDailyTask = (taskId: number) => {
    setExpandedDailyTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

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
                <span className="font-medium">{data.supervisor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Level:</span>
                <Badge>{data.supervisor.level}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teams:</span>
                <span className="font-medium">{data.teams.length}</span>
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
              <div className="flex justify-between">
                <span className="text-gray-500">Period:</span>
                <span className="font-medium">
                  {data.dateRange.startDate} to {data.dateRange.endDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Month:</span>
                <span className="font-medium">
                  {new Date(2000, data.dateRange.month - 1, 1).toLocaleString("default", { month: "long" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Year:</span>
                <span className="font-medium">{data.dateRange.year}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams and Members */}
      <div className="space-y-4">
        {data.teams.map((team) => (
          <Collapsible
            key={team.id}
            open={expandedTeams[team.id]}
            onOpenChange={() => toggleTeam(team.id)}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-sm text-gray-500">{team.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{team.memberCount} members</Badge>
                {expandedTeams[team.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 pt-0 border-t">
                <div className="space-y-4">
                  {team.members.map((member) => (
                    <Collapsible
                      key={member.id}
                      open={expandedMembers[member.id]}
                      onOpenChange={() => toggleMember(member.id)}
                      className="border rounded-lg overflow-hidden"
                    >
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">@{member.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">{member.tasksCreated} tasks created</p>
                            <p className="text-sm text-gray-500">{member.dailyTasksSubmitted} submissions</p>
                          </div>
                          {expandedMembers[member.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-4 pt-0 border-t">
                          <Tabs defaultValue="stats">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="stats">Task Statistics</TabsTrigger>
                              <TabsTrigger value="submissions">Daily Submissions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="stats" className="mt-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Task Status</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green mr-1" /> Completed
                                      </span>
                                      <span className="text-sm font-medium">{member.taskStatusCounts.completed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm flex items-center">
                                        <Clock className="h-4 w-4 text-blue mr-1" /> In Progress
                                      </span>
                                      <span className="text-sm font-medium">{member.taskStatusCounts.in_progress}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm flex items-center">
                                        <AlertCircle className="h-4 w-4 text-red mr-1" /> Delayed
                                      </span>
                                      <span className="text-sm font-medium">{member.taskStatusCounts.delayed}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm flex items-center">
                                        <Clock className="h-4 w-4 text-yellow mr-1" /> Pending
                                      </span>
                                      <span className="text-sm font-medium">{member.taskStatusCounts.pending}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Review Status</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Approved</span>
                                      <span className="text-sm font-medium">{member.reviewStatusCounts.approved}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Rejected</span>
                                      <span className="text-sm font-medium">{member.reviewStatusCounts.rejected}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm">Pending Review</span>
                                      <span className="text-sm font-medium">{member.reviewStatusCounts.pending}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Completion Rate</h4>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Completed vs Total</span>
                                    <span className="text-sm font-medium">
                                      {member.totalTasksInDailyTasks > 0
                                        ? Math.round(
                                            (member.taskStatusCounts.completed / member.totalTasksInDailyTasks) * 100,
                                          )
                                        : 0}
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      member.totalTasksInDailyTasks > 0
                                        ? Math.round(
                                            (member.taskStatusCounts.completed / member.totalTasksInDailyTasks) * 100,
                                          )
                                        : 0
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="submissions" className="mt-4">
                              {member.dailyTasks.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No daily task submissions found</p>
                              ) : (
                                <div className="space-y-3">
                                  {member.dailyTasks.map((dailyTask) => (
                                    <Collapsible
                                      key={dailyTask.id}
                                      open={expandedDailyTasks[dailyTask.id]}
                                      onOpenChange={() => toggleDailyTask(dailyTask.id)}
                                      className="border rounded-lg overflow-hidden"
                                    >
                                      <CollapsibleTrigger className="flex justify-between items-center w-full p-3 hover:bg-gray-50">
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                          <div>
                                            <p className="font-medium">
                                              {format(new Date(dailyTask.date), "MMMM d, yyyy")}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <Badge>{dailyTask.taskCount} tasks</Badge>
                                          {expandedDailyTasks[dailyTask.id] ? (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                          )}
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="p-3 pt-0 border-t">
                                          <div className="text-sm">
                                            <p>
                                              <span className="text-gray-500">Submitted:</span>{" "}
                                              {format(new Date(dailyTask.submittedAt), "MMM d, yyyy h:mm a")}
                                            </p>
                                            <p>
                                              <span className="text-gray-500">Status:</span>{" "}
                                              {dailyTask.submitted ? "Submitted" : "Not Submitted"}
                                            </p>
                                          </div>
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))}
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

export default TeamMemberTaskCountsView