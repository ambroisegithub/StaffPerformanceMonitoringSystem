// @ts-nocheck

import React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaChevronUp,
  FaCheck,
  FaSpinner,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaTasks,
  FaAngleRight,
  FaAngleLeft,
} from "react-icons/fa"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import ViewTaskModal from "./ViewTaskModal"

interface Task {
  id: number
  title: string
  description: string
  status: string
  due_date: string
  company_served?: {
    id: number
    name?: string
    tin?: string
  }
  contribution: string
  reviewed: boolean
  review_status: string
  related_project: string
  achieved_deliverables: string
}

interface DailyTask {
  id: number
  submission_date: string
  tasks: Task[]
  submitted: boolean
}

interface SupervisorDailyTasksProps {
  dailyTask: DailyTask
  onSubmit: () => void
}

// Truncated content component with expandable functionality
const TruncatedContent: React.FC<{ content: string; maxLength?: number }> = ({ content, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = content.length > maxLength
  const displayContent = isExpanded ? content : content.slice(0, maxLength) + (shouldTruncate ? "..." : "")

  return (
    <div className="relative">
      <p className="text-gray-600">{displayContent}</p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue hover:text-blue-800 text-xs font-semibold flex items-center mt-1 focus:outline-none"
        >
          {isExpanded ? (
            <>
              Show Less <FaChevronUp className="ml-1 w-3 h-3" />
            </>
          ) : (
            <>
              View More <FaChevronDown className="ml-1 w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

// Helper functions for status icons and colors
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <FaCheckCircle className="text-white" />
    case "in_progress":
      return <FaClock className="text-white" />
    case "delayed":
      return <FaExclamationCircle className="text-white" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green text-white border-green"
    case "in_progress":
      return "bg-blue text-white border-blue"
    case "delayed":
      return "bg-red text-white border-red"
    default:
      return "bg-gray text-white border-gray"
  }
}

const SupervisorDailyTasks: React.FC<SupervisorDailyTasksProps> = ({ dailyTask, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const tasksPerPage = 5

  // Date calculations
  const today = new Date().toISOString().split("T")[0]

  // Safely parse the submission date
  const submissionDate = new Date(dailyTask.submission_date)
  const submissionDateStr = isNaN(submissionDate.getTime())
    ? today // Fallback to today if invalid date
    : submissionDate.toISOString().split("T")[0]

  const isToday = submissionDateStr === today
  const isPast = isNaN(submissionDate.getTime()) ? false : submissionDate < new Date(today)
  const isFuture = isNaN(submissionDate.getTime()) ? false : submissionDate > new Date(today)

  // Filter and paginate tasks
  const filteredTasks = useMemo(() => {
    return dailyTask.tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.company_served?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        task.related_project.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter ? task.status === statusFilter : true

      return matchesSearch && matchesStatus
    })
  }, [dailyTask.tasks, searchTerm, statusFilter])

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage)
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage
    return filteredTasks.slice(startIndex, startIndex + tasksPerPage)
  }, [filteredTasks, currentPage])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonText = () => {
    if (dailyTask.submitted) return "Submitted"
    if (isPast) return "Cannot Submit Past Tasks"
    if (isFuture) return "Cannot Submit Future Tasks"
    return "Submit Daily Tasks"
  }

  const getButtonColor = () => {
    if (dailyTask.submitted) return "bg-green text-white cursor-not-allowed"
    if (isPast) return "bg-red text-white cursor-not-allowed"
    if (isFuture) return "bg-yellow text-white cursor-not-allowed"
    return "bg-green text-white hover:bg-green-600"
  }

  // Task detail handlers
  const openTaskDetail = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  // Status counts for summary
  const statusCounts = useMemo(() => {
    return dailyTask.tasks.reduce(
      (counts, task) => {
        counts[task.status] = (counts[task.status] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )
  }, [dailyTask.tasks])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg mb-8"
    >
      {/* Card Header with Summary */}
      <Card>
        <CardHeader className="pb-2 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center text-xl sm:text-2xl font-bold text-gray-800">
                <FaCalendarAlt className="mr-2 text-blue" />
                {isNaN(submissionDate.getTime())
                  ? "Invalid Date"
                  : submissionDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-blue/10 text-blue border-blue">
                  <FaTasks className="mr-1" /> {dailyTask.tasks.length} Tasks
                </Badge>
                {statusCounts.completed && (
                  <Badge variant="outline" className="bg-green/10 text-green border-green">
                    <FaCheckCircle className="mr-1" /> {statusCounts.completed} Completed
                  </Badge>
                )}
                {statusCounts.in_progress && (
                  <Badge variant="outline" className="bg-blue/10 text-blue border-blue">
                    <FaClock className="mr-1" /> {statusCounts.in_progress} In Progress
                  </Badge>
                )}
                {statusCounts.delayed && (
                  <Badge variant="outline" className="bg-red/10 text-red border-red">
                    <FaExclamationCircle className="mr-1" /> {statusCounts.delayed} Delayed
                  </Badge>
                )}
                {dailyTask.submitted && (
                  <Badge variant="outline" className="bg-green/10 text-green border-green">
                    <FaCheck className="mr-1" /> Submitted
                  </Badge>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="text-blue border-blue hover:bg-blue/10"
            >
              {isExpanded ? "Collapse" : "Expand"} Details
              {isExpanded ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setCurrentPage(1) // Reset to first page on search
                      }}
                      className="pl-10"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <div className="flex items-center">
                      <FaFilter className="mr-2 text-gray-400" />
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => {
                          setStatusFilter(value)
                          setCurrentPage(1) // Reset to first page on filter
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-lg rounded-md z-10">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tasks Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Task Details</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Review</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTasks.length > 0 ? (
                        paginatedTasks.map((task, index) => (
                          <TableRow key={task.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                              {(currentPage - 1) * tasksPerPage + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-semibold">{task.title}</p>
                                <TruncatedContent content={task.description} maxLength={50} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <FaBuilding className="mr-2 text-gray-500" />
                                      <span className="truncate max-w-[120px]">
                                        {task.company_served?.name || "N/A"}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{task.company_served?.name || "N/A"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      <FaProjectDiagram className="mr-2 text-gray-500" />
                                      <span className="truncate max-w-[120px]">{task.related_project}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{task.related_project}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`${getStatusColor(task.status)}`}>
                                <span className="flex items-center">
                                  {getStatusIcon(task.status)}
                                  <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {task.reviewed ? (
                                  <FaEye className="text-green mr-1" />
                                ) : (
                                  <FaEyeSlash className="text-red mr-1" />
                                )}
                                <span className="text-sm font-medium">
                                  {task.reviewed ? "Reviewed" : "Not Reviewed"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => openTaskDetail(task)}
                                size="sm"
                                className="bg-blue text-white hover:bg-blue-600"
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <td colSpan={7} className="text-center py-4 text-gray-500">
                            No tasks found matching your criteria
                          </td>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {filteredTasks.length > tasksPerPage && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min(filteredTasks.length, (currentPage - 1) * tasksPerPage + 1)} to{" "}
                      {Math.min(filteredTasks.length, currentPage * tasksPerPage)} of {filteredTasks.length} tasks
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        size="sm"
                        variant="outline"
                        className="px-2"
                      >
                        <FaAngleLeft />
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Show pages around current page
                        let pageNum = i + 1
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 3 + i
                          }
                          if (currentPage > totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          }
                        }

                        if (pageNum <= totalPages) {
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className={currentPage === pageNum ? "bg-blue text-white" : ""}
                            >
                              {pageNum}
                            </Button>
                          )
                        }
                        return null
                      })}
                      <Button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        size="sm"
                        variant="outline"
                        className="px-2"
                      >
                        <FaAngleRight />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={!isToday || dailyTask.submitted || isPast || isFuture || isSubmitting}
                    className={`${getButtonColor()} transition-colors duration-300`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : dailyTask.submitted ? (
                      <>
                        <FaCheck className="mr-2" />
                        Submitted
                      </>
                    ) : (
                      getButtonText()
                    )}
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Task Detail Modal */}
      <ViewTaskModal task={selectedTask} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
    </motion.div>
  )
}

export default SupervisorDailyTasks
