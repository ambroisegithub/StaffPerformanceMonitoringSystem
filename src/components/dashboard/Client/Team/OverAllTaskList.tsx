// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react"
import { Badge } from "../../../ui/Badge"
import { useAppDispatch } from "../../../../Redux/hooks"
import { type TeamTasksData, type Task, setSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice"
import { Input } from "../../../ui/input"
import { toggleChat } from "../../../Chat/chatSlice"
import ViewTaskModal from "../../../Reusable/ViewTaskModal"
interface OverAllTaskListProps {
  teamTasks: TeamTasksData[]
  loading: boolean
  onOpenReviewModal: () => void
  filters: {
    userName?: string
    department?: string
    company?: string
    team?: string
    status?: string
    startDate?: string
    endDate?: string
  }
  onClearFilters: () => void
  onOpenFilters: () => void
}

const OverAllTaskList: React.FC<OverAllTaskListProps> = ({
  teamTasks,
  loading,
  onOpenReviewModal,
  filters,
  onClearFilters,
  onOpenFilters,
}) => {
  const dispatch = useAppDispatch()
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [localSearch, setLocalSearch] = useState("")
  const [sortBy, setSortBy] = useState<string>("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedTaskForView, setSelectedTaskForView] = useState<Task | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const handleSelectTask = (task: Task) => {
    dispatch(setSelectedTask(task))
    onOpenReviewModal()
  }

  const handleOpenTaskChat = (task: Task, userId: number, userName: string) => {
    localStorage.setItem(
      "taskChatContext",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        userId: userId,
        userName: userName,
        autoOpen: true,
      }),
    )
    dispatch(toggleChat())
  }
  const handleViewTaskDetails = (task: Task) => {
    setSelectedTaskForView(task)
    setIsViewModalOpen(true)
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Approved</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </Badge>
        )
      case "pending":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </Badge>
        )
      case "completed":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Completed</span>
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>In Progress</span>
          </Badge>
        )
      case "not_started":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>Not Started</span>
          </Badge>
        )
      case "further_review":
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Further Review</span>
          </Badge>
        )
      default:
        return (
          <Badge className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-2 shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>{status}</span>
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

      Object.values(member.submissions).forEach((submission: any) => {
        submission.tasks.forEach((task: Task) => {
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

  // Enhanced filtering logic with proper department, company, team filtering
  const filteredTeamTasks = useMemo(() => {
    let filteredByFilters = teamTasks

    // Apply filters
    if (filters.userName) {
      filteredByFilters = filteredByFilters.filter((member) => member.user.username === filters.userName)
    }

    if (filters.company) {
      filteredByFilters = filteredByFilters.map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) => task.company?.name === filters.company
          )
          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })
        return Object.keys(filteredSubmissions).length > 0 ? {
          ...member,
          submissions: filteredSubmissions,
        } : null
      }).filter(Boolean) as TeamTasksData[]
    }

    if (filters.department) {
      filteredByFilters = filteredByFilters.map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) => task.department === filters.department
          )
          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })
        return Object.keys(filteredSubmissions).length > 0 ? {
          ...member,
          submissions: filteredSubmissions,
        } : null
      }).filter(Boolean) as TeamTasksData[]
    }

    if (filters.team) {
      filteredByFilters = filteredByFilters.filter((member) =>
        member.user.teams?.includes(filters.team!)
      )
    }

    if (filters.status) {
      filteredByFilters = filteredByFilters.map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) => task.review_status === filters.status || task.status === filters.status
          )
          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })
        return Object.keys(filteredSubmissions).length > 0 ? {
          ...member,
          submissions: filteredSubmissions,
        } : null
      }).filter(Boolean) as TeamTasksData[]
    }

    if (filters.startDate || filters.endDate) {
      filteredByFilters = filteredByFilters.map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter((task) => {
            const taskDate = new Date(task.originalDueDate || date)
            if (filters.startDate && taskDate < new Date(filters.startDate)) return false
            if (filters.endDate && taskDate > new Date(filters.endDate)) return false
            return true
          })
          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })
        return Object.keys(filteredSubmissions).length > 0 ? {
          ...member,
          submissions: filteredSubmissions,
        } : null
      }).filter(Boolean) as TeamTasksData[]
    }

    if (!localSearch.trim()) {
      return filteredByFilters
    }

    return filteredByFilters
      .map((member) => {
        const filteredSubmissions: Record<string, any> = {}
        Object.entries(member.submissions).forEach(([date, submission]) => {
          const filteredTasks = submission.tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.description.toLowerCase().includes(localSearch.toLowerCase()) ||
              task.company?.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
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
        return Object.keys(filteredSubmissions).length > 0 ? {
          ...member,
          submissions: filteredSubmissions,
        } : null
      })
      .filter(Boolean) as TeamTasksData[]
  }, [teamTasks, localSearch, filters])

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

  // Flatten all tasks for pagination
  const allTasksFlat = useMemo(() => {
    const tasks: Array<{ task: Task; user: any }> = []
    sortedTeamTasks.forEach((teamMember) => {
      Object.values(teamMember.submissions).forEach((submission: any) => {
        submission.tasks.forEach((task: Task) => {
          tasks.push({ task, user: teamMember.user })
        })
      })
    })
    return tasks
  }, [sortedTeamTasks])

  // Pagination calculations
  const totalTasks = allTasksFlat.length
  const totalPages = Math.ceil(totalTasks / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTasks = allTasksFlat.slice(startIndex, endIndex)

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const truncateWords = (text: string, wordLimit: number) => {
    if (!text) return ""
    const words = text.split(" ")
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(" ") + "..."
  }

  // Pagination component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, totalTasks)} of {totalTasks} tasks
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium ${page === currentPage
                  ? "bg-green-500 text-white border border-green-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
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
          <div className="flex items-center border rounded-md overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-green-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
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
              className="text-sm border border-gray-300 rounded-md p-1.5 bg-white shadow-sm"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="level">Level</option>
              <option value="tasks">Task Count</option>
              <option value="pending">Pending Tasks</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 border border-gray-300 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Filter Summary */}
          <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
            {totalTasks} task{totalTasks !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.company || filters.department || filters.team || filters.userName || filters.status || filters.startDate || filters.endDate) && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            {filters.company && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Building className="h-3 w-3 mr-1" />
                Company: {filters.company}
              </Badge>
            )}
            {filters.department && (
              <Badge className="bg-green-50 text-green-700 border-green-200">
                <Briefcase className="h-3 w-3 mr-1" />
                Department: {filters.department}
              </Badge>
            )}
            {filters.team && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Users className="h-3 w-3 mr-1" />
                Team: {filters.team}
              </Badge>
            )}
            {filters.userName && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                <Users className="h-3 w-3 mr-1" />
                User: {filters.userName}
              </Badge>
            )}
            {filters.status && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                Status: {filters.status}
              </Badge>
            )}
            {(filters.startDate || filters.endDate) && (
              <Badge className="bg-red-50 text-red-700 border-red-200">
                <Calendar className="h-3 w-3 mr-1" />
                {filters.startDate || 'Any'} to {filters.endDate || 'Any'}
              </Badge>
            )}
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 ml-2"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* No tasks found message */}
      {totalTasks === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Filter className="h-16 w-16 text-gray-300" />
          </div>
          <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
          <p className="text-gray-500 mt-2">
            There are no submitted tasks that match your current filters.
          </p>
          <div className="mt-4 space-x-3">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Modify Filters
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Smart Table */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>#</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>Task Title</span>
                    </div>
                  </th>


                  <th scope="col" className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-gray-500" />
                      <span>Review Status</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-gray-500" />
                      <span>Task Status</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentTasks.map(({ task, user }, index) => (
                  <motion.tr
                    key={`${user.id}-${task.id}`}
                    className="bg-white hover:bg-gray-50 transition-all duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                        {startIndex + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate" title={task.title}>
                          {truncateWords(task.title, 4)}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(task.review_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex items-center rounded-md gap-1">
                          <button
                            onClick={() => handleViewTaskDetails(task)}
                            className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Details</span>
                          </button>
                          <button
                            onClick={() => handleSelectTask(task)}
                            disabled={task.reviewed}
                            className={`flex items-center px-2 py-1.5 text-[11px] font-medium rounded transition duration-150 shadow ${task.reviewed
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            title={task.reviewed ? "Already reviewed" : "Review task"}
                          >
                            {task.reviewed ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline ml-1">
                              {task.reviewed ? "Reviewed" : "Review"}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenTaskChat(task, user.id, user.username)
                            }}
                            className="flex items-center px-2 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-150 shadow"
                            title="Chat about task"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">Chat</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <ViewTaskModal
            task={selectedTaskForView}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
          />
          {/* Pagination Controls */}
          <PaginationControls />
        </div>
      )}
    </div>
  )
}

export default OverAllTaskList