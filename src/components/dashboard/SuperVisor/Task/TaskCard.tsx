"use client"

import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, Building, Briefcase, FileText, ChevronDown, Eye, EyeOff } from "lucide-react"
import type { Task } from "../../../../Redux/Slices/TaskReviewSlice"
import { Badge } from "../../../ui/Badge"

interface TaskCardProps {
  task: Task
  onSelect: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusBadge = () => {
    switch (task.review_status) {
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

  return (
    <motion.div
      className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-full"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-800 truncate">{task.title}</h3>
        {getStatusBadge()}
      </div>

      {/* Review button moved to top for visibility */}
      <button
        onClick={onSelect}
        className={`w-full px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center mb-3 ${
          task.reviewed ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-green text-white hover:bg-green"
        }`}
      >
        {task.reviewed ? (
          <>
            <EyeOff className="h-4 w-4 mr-1.5" />
            Already Reviewed
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1.5" />
            Review Task
          </>
        )}
      </button>

      <p className={`text-sm text-gray-600 ${isExpanded ? "" : "line-clamp-2"} mb-3`}>{task.description}</p>

      {/* Expand/Collapse Button */}
      {task.description.length > 120 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue hover:text-blue flex items-center mb-3 self-start"
        >
          {isExpanded ? "Show less" : "Show more"}
          <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      )}

      <div className="text-xs text-gray-500 space-y-1.5 mb-3 mt-auto">
        <div className="flex items-center">
          <Building className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{task.company}</span>
        </div>

        {task.department && (
          <div className="flex items-center">
            <Briefcase className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{task.department}</span>
          </div>
        )}

        {task.related_project && (
          <div className="flex items-center">
            <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{task.related_project}</span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            {task.contribution && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Contribution:</h4>
                <p className="text-xs text-gray-600">{task.contribution}</p>
              </div>
            )}

            {task.achieved_deliverables && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Deliverables:</h4>
                <p className="text-xs text-gray-600">{task.achieved_deliverables}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TaskCard

