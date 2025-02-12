
// @ts-nocheck
"use client"

import React from "react"
import { format } from "date-fns"
import {
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaClipboardList,
  FaCommentAlt,
  FaTimes,
} from "react-icons/fa"
import { Badge } from "../../ui/Badge"
import { Button } from "../../ui/button"
import { Dialog } from "../../ui/dialog"

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
  department?: {
    id: number
    name: string
  }
  contribution: string
  reviewed: boolean
  review_status: string
  related_project: string
  achieved_deliverables: string
  remarks?: string | null
}

interface ViewTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
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

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 border-b">
            <div className="flex justify-between items-center p-4 bg-green">
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0 hover:bg-white text-white hover:text-green">
                <FaTimes />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Task Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description}</p>
            </div>

            {/* Task Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Company</h3>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <FaBuilding className="text-blue mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{task.company_served?.name || "N/A"}</p>
                      
                      {task.company_served?.tin && (
                        <p className="text-sm text-gray-500">TIN: {task.company_served?.tin}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Project</h3>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <FaProjectDiagram className="text-blue mr-3 flex-shrink-0" />
                    <p className="font-medium">{task.related_project}</p>
                  </div>
                </div>

                {task.department && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Department</h3>
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                      <FaClipboardList className="text-blue mr-3 flex-shrink-0" />
                      <p className="font-medium">{task.department.name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Due Date</h3>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <FaCalendarAlt className="text-blue mr-3 flex-shrink-0" />
                    <p className="font-medium">{format(new Date(task.due_date), "MMMM d, yyyy")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Status</h3>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Badge variant="outline" className={`${getStatusColor(task.status)}`}>
                      <span className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status}</span>
                      </span>
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Review Status</h3>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      {task.reviewed ? <FaEye className="text-green mr-2" /> : <FaEyeSlash className="text-red mr-2" />}
                      <span className="font-medium">{task.reviewed ? "Reviewed" : "Not Reviewed"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Contribution</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">{task.contribution}</p>
              </div>
            </div>

            {/* Achieved Deliverables */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Achieved Deliverables</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-1">
                  {task.achieved_deliverables.split(",").map((deliverable, index) => (
                    <li key={index} className="text-gray-700">
                      {deliverable.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Remarks (if any) */}
            {task.remarks && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Reviewer Remarks</h3>
                <div className="bg-gray-50 p-4 rounded-lg flex items-start">
                  <FaCommentAlt className="text-blue mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 whitespace-pre-line">{task.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default ViewTaskModal

