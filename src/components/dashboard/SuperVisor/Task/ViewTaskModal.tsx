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
import { Badge } from "../../../ui/Badge"
import { Button } from "../../../ui/button"
import { Dialog } from "../../../ui/dialog"

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

const getReviewStatusIcon = (reviewed: boolean) => {
  return reviewed 
    ? <FaEye className="text-green text-lg" /> 
    : <FaEyeSlash className="text-red text-lg" />
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10">
            <div className="flex justify-between items-center p-5 bg-green rounded-t-xl">
              <h2 className="text-2xl font-bold text-white tracking-tight">{task.title}</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-10 w-10 p-0 hover:bg-white hover:bg-opacity-20 text-white">
                <FaTimes className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            {/* Status bar */}
            <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className={`${getStatusColor(task.status)} px-3 py-1`}>
                  <span className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="ml-1.5 capitalize font-medium">{task.status.replace('_', ' ')}</span>
                  </span>
                </Badge>
                
                <div className="flex items-center px-3 py-1 bg-gray-100 rounded-md">
                  <FaCalendarAlt className="text-blue mr-2" />
                  <span className="font-medium">{format(new Date(task.due_date), "MMMM d, yyyy")}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                {getReviewStatusIcon(task.reviewed)}
                <span className="ml-2 font-medium">{task.reviewed ? "Reviewed" : "Not Reviewed"}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Task Description */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                <span className="w-1 h-5 bg-green rounded mr-2"></span>
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{task.description}</p>
            </div>

            {/* Task Details in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {/* Company */}
                <div className="mb-6">
                  <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-blue rounded mr-2"></span>
                    Company Details
                  </h3>
                  <div className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <FaBuilding className="text-blue mr-4 mt-1 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-lg">{task.company_served?.name || "N/A"}</p>
                      {task.company_served?.tin && (
                        <p className="text-sm text-gray-500 mt-1">TIN: {task.company_served?.tin}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project */}
                <div className="mb-6">
                  <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                    <span className="w-1 h-5 bg-blue rounded mr-2"></span>
                    Project
                  </h3>
                  <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <FaProjectDiagram className="text-blue mr-4 text-xl flex-shrink-0" />
                    <p className="font-medium">{task.related_project}</p>
                  </div>
                </div>

                {/* Department (if available) */}
                {task.department && (
                  <div>
                    <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                      <span className="w-1 h-5 bg-blue rounded mr-2"></span>
                      Department
                    </h3>
                    <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <FaClipboardList className="text-blue mr-4 text-xl flex-shrink-0" />
                      <p className="font-medium">{task.department.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contribution */}
              <div>
                <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                  <span className="w-1 h-5 bg-green rounded mr-2"></span>
                  Contribution
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm h-full">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{task.contribution}</p>
                </div>
              </div>
            </div>

            {/* Achieved Deliverables */}
            <div>
              <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                <span className="w-1 h-5 bg-green rounded mr-2"></span>
                Achieved Deliverables
              </h3>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                <ul className="space-y-2">
                  {task.achieved_deliverables.split(",").map((deliverable, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="text-green mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{deliverable.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Remarks (if any) */}
            {task.remarks && (
              <div>
                <h3 className="text-sm uppercase font-bold text-gray-500 mb-3 flex items-center">
                  <span className="w-1 h-5 bg-blue rounded mr-2"></span>
                  Reviewer Remarks
                </h3>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-start">
                    <FaCommentAlt className="text-blue mr-4 mt-1 text-lg flex-shrink-0" />
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{task.remarks}</p>
                  </div>
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