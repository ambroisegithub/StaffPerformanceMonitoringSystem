// @ts-nocheck
"use client"

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Badge } from "../../../ui/Badge"
import { Button } from "../../../ui/button"
import { Clock, CheckCircle2, XCircle, User, Calendar, Building, Eye } from "lucide-react"
import { TaskStatus, ReviewStatus } from "../../../../Redux/Slices/taskReviewSlice1"

interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  review_status: ReviewStatus
  due_date: string
  created_by: {
    id: number
    firstName: string
    lastName: string
    supervisoryLevel: string
  }
  company_served: {
    id: number
    name: string
  }
  department: {
    id: number
    name: string
  } | null
}

interface Pagination {
  current_page: number
  total_pages: number
  total_items: number
}

interface TaskReviewTableProps {
  tasks: Task[]
  pagination: Pagination
  currentPage: number
  setCurrentPage: (page: number) => void
  onSelectTask: (taskId: number) => void
  selectedTaskId: number | null
}

const TaskReviewTable: React.FC<TaskReviewTableProps> = ({
  tasks,
  pagination,
  currentPage,
  setCurrentPage,
  onSelectTask,
  selectedTaskId,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      [TaskStatus.PENDING]: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      [TaskStatus.IN_PROGRESS]: { icon: Clock, className: "bg-blue-100 text-blue-800" },
      [TaskStatus.COMPLETED]: { icon: CheckCircle2, className: "bg-green-100 text-green-800" },
      [TaskStatus.DELAYED]: { icon: XCircle, className: "bg-red-100 text-red-800" },
    }

    const StatusIcon = statusConfig[status]?.icon
    return (
      <Badge className={`flex items-center gap-1 ${statusConfig[status]?.className}`}>
        {StatusIcon && <StatusIcon size={14} />}
        {status}
      </Badge>
    )
  }

  const getReviewStatusBadge = (status: ReviewStatus) => {
    const statusConfig = {
      [ReviewStatus.PENDING]: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      [ReviewStatus.APPROVED]: { icon: CheckCircle2, className: "bg-green-100 text-green-800" },
      [ReviewStatus.REJECTED]: { icon: XCircle, className: "bg-red-100 text-red-800" },
    }

    const StatusIcon = statusConfig[status]?.icon
    return (
      <Badge className={`flex items-center gap-1 ${statusConfig[status]?.className}`}>
        {StatusIcon && <StatusIcon size={14} />}
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Review Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className={selectedTaskId === task.id ? "bg-muted/50" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {task.created_by.firstName} {task.created_by.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{task.created_by.supervisoryLevel}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-muted-foreground" />
                    <span>{task.company_served.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{getReviewStatusBadge(task.review_status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTask(task.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total_items)} of{" "}
            {pagination.total_items} tasks
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.total_pages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
              disabled={currentPage === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskReviewTable

