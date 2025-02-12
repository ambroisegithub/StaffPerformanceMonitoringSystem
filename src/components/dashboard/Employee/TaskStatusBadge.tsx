import React from "react"
import { Badge } from "../../ui/Badge"
import { FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa"

interface TaskStatusBadgeProps {
  status: string
  className?: string
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, className = "" }) => {
  const getStatusIcon = () => {
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

  const getStatusColor = () => {
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

  return (
    <Badge variant="outline" className={`${getStatusColor()} ${className}`}>
      <span className="flex items-center">
        {getStatusIcon()}
        <span className="ml-1 capitalize">{status.replace("_", " ")}</span>
      </span>
    </Badge>
  )
}

export default TaskStatusBadge

