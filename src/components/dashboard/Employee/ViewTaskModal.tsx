
"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaTimes,
  FaClipboardList,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaPaperclip,
  FaDownload,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
} from "react-icons/fa"
import { Badge } from "../../ui/Badge"
import { Button } from "../../ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"

interface AttachedDocument {
  secure_url: string
  public_id: string
  resource_type: string
  format: string
  bytes: number
  original_filename: string
  upload_timestamp: string
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
  location_name?: string
  attached_documents?: AttachedDocument[]
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
      return <FaCheckCircle className="text-green" />
    case "in_progress":
      return <FaClock className="text-blue" />
    case "delayed":
      return <FaExclamationCircle className="text-red" />
    default:
      return <FaClock className="text-gray" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green/10 text-green border-green"
    case "in_progress":
      return "bg-blue/10 text-blue border-blue"
    case "delayed":
      return "bg-red/10 text-red border-red"
    default:
      return "bg-gray/10 text-gray border-gray"
  }
}

const getReviewStatusProps = (status: string) => {
  switch (status) {
    case "approved":
      return {
        color: "bg-green/10 text-green border-green",
        label: "Approved",
        icon: <FaCheckCircle className="text-green mr-1" />,
      }
    case "rejected":
      return {
        color: "bg-red/10 text-red border-red",
        label: "Rejected",
        icon: <FaExclamationCircle className="text-red mr-1" />,
      }
    case "pending":
    default:
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-400",
        label: "Pending",
        icon: <FaClock className="text-yellow-700 mr-1" />,
      }
  }
}

// Document Display Component for Modal
const DocumentDisplayModal: React.FC<{ documents: AttachedDocument[] }> = ({ documents }) => {
  const getFileIcon = (document: AttachedDocument) => {
    if (document.resource_type === "image") return <FaImage className="text-blue-500 h-6 w-6" />
    if (document.resource_type === "video") return <FaVideo className="text-purple-500 h-6 w-6" />
    if (document.format === "mp3" || document.format === "wav") return <FaMusic className="text-green-500 h-6 w-6" />
    return <FaFile className="text-gray-500 h-6 w-6" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatUploadDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (document: AttachedDocument) => {
    window.open(document.secure_url, "_blank")
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaPaperclip className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p>No documents attached to this task</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FaPaperclip className="text-gray-500 mr-2" />
        <h4 className="text-lg font-semibold text-gray-900">Attached Documents ({documents.length})</h4>
      </div>
      <div className="grid gap-4">
        {documents.map((doc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border"
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {getFileIcon(doc)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.original_filename}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(doc.bytes)}</span>
                  <span>•</span>
                  <span>{formatUploadDate(doc.upload_timestamp)}</span>
                  <span>•</span>
                  <span className="capitalize">{doc.resource_type}</span>
                </div>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleDownload(doc)}
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600 ml-4"
                  >
                    <FaDownload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download {doc.original_filename}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({ task, isOpen, onClose }) => {
  if (!task) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <FaClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{task.title}</h2>
                    <p className="text-blue-100 text-sm">Task Details</p>
                  </div>
                </div>
                <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Status and Review Badges */}
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className={`${getStatusColor(task.status)} px-3 py-1`}>
                    <span className="flex items-center">
                      {getStatusIcon(task.status)}
                      <span className="ml-2 capitalize font-medium">{task.status.replace("_", " ")}</span>
                    </span>
                  </Badge>
                  {(() => {
                    const { color, label, icon } = getReviewStatusProps(task.review_status)
                    return (
                      <Badge variant="outline" className={`${color} px-3 py-1`}>
                        <span className="flex items-center">
                          {icon}
                          <span className="font-medium">{label}</span>
                        </span>
                      </Badge>
                    )
                  })()}
                </div>

                {/* Basic Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaBuilding className="inline mr-2" />
                        Company Served
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{task.company_served?.name || "N/A"}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaProjectDiagram className="inline mr-2" />
                        Related Project
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{task.related_project}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FaCalendarAlt className="inline mr-2" />
                        Due Date
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{formatDate(task.due_date)}</p>
                    </div>

                    {task.location_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FaMapMarkerAlt className="inline mr-2" />
                          Location
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{task.location_name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                  </div>
                </div>

                {/* Contribution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contribution</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{task.contribution}</p>
                  </div>
                </div>

                {/* Achieved Deliverables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Achieved Deliverables</label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{task.achieved_deliverables}</p>
                  </div>
                </div>

                {/* Attached Documents */}
                <div>
                  <DocumentDisplayModal documents={task.attached_documents || []} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
              <Button onClick={onClose} className="bg-blue text-white hover:bg-blue-600">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ViewTaskModal
