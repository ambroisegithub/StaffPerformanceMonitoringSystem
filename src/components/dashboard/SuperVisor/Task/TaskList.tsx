// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import { type TeamTasksData, type Task, setSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice"
import { formatDate } from "../../../../utilis/dateUtils"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Briefcase,
  FileText,
  Users,
  Calendar,
  BarChart2,
  Filter,
  Search,
  List,
  Grid,
  MessageSquare,
} from "lucide-react"
import { Badge } from "../../../ui/Badge"
import TaskCard from "./TaskCard"
import { Input } from "../../../ui/input"
import { toggleChat } from "../../../Chat/chatSlice"

interface TaskListProps {
  teamTasks: TeamTasksData[]
  loading: boolean
  onOpenReviewModal: () => void
  filters: { userName?: string }
}

const TaskList: React.FC<TaskListProps> = ({ teamTasks, loading, onOpenReviewModal, filters }) => {
  const dispatch = useAppDispatch()
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [localSearch, setLocalSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const currentUser = useAppSelector((state) => state.login.user)
  const organizationId = currentUser?.organization?.id
  const conversations = useAppSelector((state) => state.chat.conversations)

  const toggleTaskExpanded = (taskId: number) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }))
  }

  const handleSelectTask = (task: Task) => {
    dispatch(setSelectedTask(task))
    onOpenReviewModal()
  }

  const handleOpenTaskChat = (task: Task, userId: number, userName: string) => {
    // Store task context in localStorage with autoOpen flag
    localStorage.setItem(
      "taskChatContext",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description, // Include description as well
        userId: userId,
        userName: userName,
        autoOpen: true,
      }),
    )

    // Find any existing conversation with this user
    const existingConversations = conversations.filter((conv) => conv.otherUser.id === userId)

    // Log for debugging
    console.log("Opening task chat:", {
      taskId: task.id,
      taskTitle: task.title,
      userId,
      existingConversations: existingConversations.length,
    })

    // Open the chat modal
    dispatch(toggleChat())
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-green text-white flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Approved</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-red text-white flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>Rejected</span>
          </Badge>
        )
      default:
        return (
          <Badge className="px-2 py-1 text-xs font-medium rounded-full bg-blue text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        )
    }
  }

  // Calculate task statistics for each team member
  const memberStats = useMemo(() => {
    const stats: Record<number, { total: number; pending: number; approved: number; rejected: number }> = {}

    teamTasks.forEach((member) => {
      const memberId = member.user.id
      stats[memberId] = { total: 0, pending: 0, approved: 0, rejected: 0 }

      Object.values(member.submissions).forEach((submission) => {
        submission.tasks.forEach((task) => {
          stats[memberId].total++

          if (task.review_status === "approved") {
            stats[memberId].approved++
          } else if (task.review_status === "rejected") {
            stats[memberId].rejected++
          } else {
            stats[memberId].pending++
          }
        })
      })
    })

    return stats
  }, [teamTasks])

  // Filter tasks based on local search and username filter
  const filteredTeamTasks = useMemo(() => {
    let filteredByUsername = teamTasks

    if (filters.userName) {
      filteredByUsername = teamTasks.filter((member) => member.user.username === filters.userName)
    }

    if (!localSearch.trim()) {
      return filteredByUsername
    }

    return filteredByUsername
      .map((member) => {
        const filteredSubmissions: Record<string, any> = {}

        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.description.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.company?.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.department?.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.related_project?.toLowerCase().includes(localSearch.toLowerCase()) ||
              `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(localSearch.toLowerCase()),
          )

          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })

        if (Object.keys(filteredSubmissions).length > 0) {
          return {
            ...member,
            submissions: filteredSubmissions,
          }
        }

        return null
      })
      .filter(Boolean) as TeamTasksData[]
  }, [teamTasks, localSearch, filters.userName])

  // Sort team members
  const sortedTeamTasks = useMemo(() => {
    return [...filteredTeamTasks].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
        const nameB = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }

      if (sortBy === "level") {
        return sortOrder === "asc" ? a.user.level.localeCompare(b.user.level) : b.user.level.localeCompare(a.user.level)
      }

      if (sortBy === "tasks") {
        const tasksA = memberStats[a.user.id]?.total || 0
        const tasksB = memberStats[b.user.id]?.total || 0
        return sortOrder === "asc" ? tasksA - tasksB : tasksB - tasksA
      }

      if (sortBy === "pending") {
        const pendingA = memberStats[a.user.id]?.pending || 0
        const pendingB = memberStats[b.user.id]?.pending || 0
        return sortOrder === "asc" ? pendingA - pendingB : pendingB - pendingA
      }

      // Default: sort by date (most recent first)
      const datesA = Object.keys(a.submissions).sort()
      const datesB = Object.keys(b.submissions).sort()
      const latestDateA = datesA.length ? datesA[datesA.length - 1] : ""
      const latestDateB = datesB.length ? datesB[datesB.length - 1] : ""

      return sortOrder === "asc" ? latestDateA.localeCompare(latestDateB) : latestDateB.localeCompare(latestDateA)
    })
  }, [filteredTeamTasks, sortBy, sortOrder, memberStats])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc") // Default to descending when changing sort field
    }
  }

  const truncateWords = (text: string, wordLimit: number) => {
    if (!text) return ""
    const words = text.split(" ")
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-green text-white" : "bg-white text-gray-500"}`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-green text-white" : "bg-white text-gray-500"}`}
              title="Grid View"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="text-sm border rounded-md p-1.5"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="level">Level</option>
              <option value="tasks">Task Count</option>
              <option value="pending">Pending Tasks</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 border rounded-md"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* No tasks found message */}
      {sortedTeamTasks.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Filter className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
          <p className="text-gray-500 mt-2">
            There are no submitted tasks from your team members that match your filters.
          </p>
        </div>
      )}

      {/* Team Members List */}
      {sortedTeamTasks.length > 0 && (
        <div className="space-y-6">
          {sortedTeamTasks.map((teamMember) => {
            // Always expanded: show tasks for every user by default
            const allTasks: Task[] = Object.values(teamMember.submissions)
              .flatMap((submission: any) => submission.tasks)

            const stats = memberStats[teamMember.user.id] || { total: 0, pending: 0, approved: 0, rejected: 0 }

            return (
              <motion.div
                key={teamMember.user.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="bg-gray-50 p-4 flex justify-between items-center transition-colors"
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {/* No expand/collapse icon */}
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{teamMember.user.username}</span>
                        <span className="mx-1.5">•</span>
                        <BarChart2 className="h-3.5 w-3.5 mr-1" />
                        <span>{teamMember.user.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      {allTasks.length} task{allTasks.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                {/* Always show tasks for each user */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Mobile Task Statistics */}
                  <div className="md:hidden flex items-center justify-center gap-2 p-3 bg-gray-50 border-t border-gray-200">
                    <Badge className="bg-blue text-white border-blue">
                      <Clock className="h-3 w-3 mr-1" />
                      {stats.pending} pending
                    </Badge>
                    <Badge className="bg-green text-white border-green">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {stats.approved} approved
                    </Badge>
                    <Badge className="bg-red text-white border-red">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {stats.rejected} rejected
                    </Badge>
                  </div>

                  {/* Flat list of all tasks for this member */}
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Title
                              </th>
                              <th scope="col" className="px-6 py-3 hidden md:table-cell">
                                Description
                              </th>
                              {/* <th scope="col" className="px-6 py-3 hidden lg:table-cell">
                                Company
                              </th> */}
                              <th scope="col" className="px-6 py-3 hidden xl:table-cell">
                                Department
                              </th>
                              <th scope="col" className="px-6 py-3 hidden xl:table-cell">
                                Project
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allTasks.map((task) => (
                              <tr
                                key={task.id}
                                className="bg-white border-b hover:bg-gray-50 transition-colors"
                              >
                                <th
                                  scope="row"
                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                >
                                  <div className="flex items-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setExpandedTasks((prev) => ({
                                          ...prev,
                                          [task.id]: !prev[task.id],
                                        }))
                                      }}
                                      className="mr-2"
                                    >
                                      {expandedTasks[task.id] ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                    {truncateWords(task.title, 3)}
                                  </div>
                                  <AnimatePresence>
                                    {expandedTasks[task.id] && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2 ml-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-md"
                                      >
                                        <p className="mb-2">{task.description}</p>
                                        {task.contribution && (
                                          <div className="mb-2">
                                            <span className="font-medium">Contribution:</span>{" "}
                                            {task.contribution}
                                          </div>
                                        )}
                                        {task.achieved_deliverables && (
                                          <div>
                                            <span className="font-medium">Deliverables:</span>{" "}
                                            {task.achieved_deliverables}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </th>
                                <td className="px-6 py-4 max-w-xs truncate hidden md:table-cell">
                                  {task.description}
                                </td>

                                <td className="px-6 py-4 hidden xl:table-cell">
                                  {task.department ? (
                                    <div className="flex items-center">
                                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      {task.department}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-6 py-4 hidden xl:table-cell">
                                  {task.related_project ? (
                                    <div className="flex items-center">
                                      <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                      {task.related_project}
                                    </div>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="px-6 py-4">{getStatusBadge(task.review_status)}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleSelectTask(task)}
                                      disabled={task.reviewed}
                                      className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center ${
                                        task.reviewed
                                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                          : "bg-green text-white hover:bg-green"
                                      }`}
                                      aria-label={task.reviewed ? "Already reviewed" : "Review task"}
                                    >
                                      {task.reviewed ? (
                                        <>
                                          <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                                          Reviewed
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                                          Review
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleOpenTaskChat(
                                          task,
                                          teamMember.user.id,
                                          teamMember.user.username,
                                        )
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium rounded-md flex items-center bg-blue text-white hover:bg-blue-600"
                                      aria-label="Chat about task"
                                    >
                                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                      Chat
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaskList
