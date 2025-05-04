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
  FaComments,
  FaUser,
  FaTimes,
} from "react-icons/fa"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import ViewTaskModal from "./ViewTaskModal"

interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

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
  comments?: Comment[]
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

// Comments Modal Component
const CommentsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  taskTitle: string
}> = ({ isOpen, onClose, comments, taskTitle }) => {
  if (!isOpen) return null

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaComments className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-semibold">Task Comments</h2>
              <p className="text-blue-100 text-sm truncate">{taskTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-200 transition-colors p-1"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Comments Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue text-white p-2 rounded-full flex-shrink-0">
                      <FaUser className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {comment.user_name}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaComments className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
              <p className="text-gray-500">No comments have been added to this task.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {comments?.length || 0} comment{comments?.length !== 1 ? "s" : ""}
            </span>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
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

  // Comments functionality
  const [selectedTaskComments, setSelectedTaskComments] = useState<{
    comments: Comment[]
    taskTitle: string
  } | null>(null)
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false)

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
    if (isPast) return "bg-[#FF8C00] text-white cursor-not-allowed"
    if (isFuture) return "bg-yellow text-white cursor-not-allowed"
    return "bg-green text-white hover:bg-green-600"
  }

  // Task detail handlers
  const openTaskDetail = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  // Comments functionality
  const handleOpenComments = (task: Task) => {
    setSelectedTaskComments({
      comments: task.comments || [],
      taskTitle: task.title,
    })
    setIsCommentsModalOpen(true)
  }

  const handleCloseComments = () => {
    setIsCommentsModalOpen(false)
    setSelectedTaskComments(null)
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
                        <TableHead className="w-[120px]">Actions</TableHead>
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
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openTaskDetail(task)}
                                  size="sm"
                                  className="bg-blue text-white hover:bg-blue-600"
                                >
                                  View
                                </Button>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => handleOpenComments(task)}
                                        size="sm"
                                        variant="outline"
                                        className="relative border-gray-300 hover:border-blue hover:text-blue"
                                      >
                                        <FaComments className="h-4 w-4" />
                                        {task.comments && task.comments.length > 0 && (
                                          <span className="absolute -top-2 -right-2 bg-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {task.comments.length}
                                          </span>
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        {task.comments && task.comments.length > 0
                                          ? `${task.comments.length} comment${task.comments.length !== 1 ? 's' : ''}`
                                          : 'No comments'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
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

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseComments}
        comments={selectedTaskComments?.comments || []}
        taskTitle={selectedTaskComments?.taskTitle || ""}
      />
    </motion.div>
  )
}

export default SupervisorDailyTasks