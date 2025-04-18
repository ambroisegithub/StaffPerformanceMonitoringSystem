// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaTimes,
  FaSpinner,
  FaClipboardList,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa"
import { useAppSelector } from "../../../Redux/hooks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"

// Task status enum matching the backend
enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DELAYED = "delayed",
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => Promise<void>
}

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return <FaCheckCircle className="text-green" />
    case TaskStatus.IN_PROGRESS:
      return <FaClock className="text-blue" />
    case TaskStatus.DELAYED:
      return <FaExclamationCircle className="text-red" />
    case TaskStatus.PENDING:
    default:
      return <FaClock className="text-yellow" />
  }
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const user = useAppSelector((state) => state.login.user)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  
  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split("T")[0]
  
  // Determine if company field should be shown
  const showCompanyField = user?.company !== null
  
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    company_served: showCompanyField ? user?.company?.name || "" : "",
    contribution: "",
    due_date: today,
    latitude: 0,
    longitude: 0,
    location_name: "",
    related_project: "",
    achieved_deliverables: "",
    created_by: user?.id || 0,
    status: TaskStatus.IN_PROGRESS,
  })

  useEffect(() => {
    // Calculate form progress based on required fields only
    const requiredFields = [
      "title", 
      "description", 
      "contribution", 
      "due_date", 
      "related_project", 
      "achieved_deliverables"
    ]
    
    // Add company_served to required fields only if it should be shown
    if (showCompanyField) {
      requiredFields.push("company_served")
    }
    
    const filledRequiredFields = requiredFields.filter(field => 
      taskData[field] !== "" && taskData[field] !== undefined && taskData[field] !== null
    ).length
    
    setFormProgress((filledRequiredFields / requiredFields.length) * 100)
  }, [taskData, showCompanyField])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTaskData((prev) => ({ ...prev, [name]: value }))
  }

  // Special handler for due_date to ensure it's always today
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Force the value to be today's date regardless of what was selected
    setTaskData((prev) => ({ ...prev, due_date: today }))
  }

  // Handle status change from select component
  const handleStatusChange = (value: string) => {
    setTaskData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(taskData)
      setTaskData({
        title: "",
        description: "",
        company_served: showCompanyField ? user?.company?.name || "" : "",
        contribution: "",
        due_date: today,
        latitude: 0,
        longitude: 0,
        location_name: "",
        related_project: "",
        achieved_deliverables: "",
        created_by: user?.id || 0,
        status: TaskStatus.IN_PROGRESS,
      })
      onClose()
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Add New Task</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                <FaTimes size={24} />
              </button>
            </div>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-green h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${formProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">Form Completion: {formProgress.toFixed(0)}%</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <div className="relative">
                    <FaClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={taskData.title}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter task title"
                    />
                  </div>
                </div>
                
                {/* Only render company field if user has a company */}
                {showCompanyField && (
                  <div>
                    <label htmlFor="company_served" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Served
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        id="company_served"
                        name="company_served"
                        value={taskData.company_served}
                        onChange={handleChange}
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                      />
                    </div>
                  </div>
                )}
                
                {/* Adjust column span based on whether company field is shown */}
                <div className={`${!showCompanyField ? 'md:col-span-2' : ''}`}>
                  <label htmlFor="related_project" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Project
                  </label>
                  <div className="relative">
                    <FaProjectDiagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="related_project"
                      name="related_project"
                      value={taskData.related_project}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter related project"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={4}
                    placeholder="Describe the task in detail"
                  />
                  <p className="text-sm text-gray-500 mt-1">{taskData.description.length}/500 characters</p>
                </div>
                
                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      value={taskData.due_date}
                      onChange={handleDateChange}
                      required
                      disabled={isSubmitting}
                      readOnly
                      min={today}
                      max={today}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only today's date is allowed</p>
                </div>

                {/* Status Select Field */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Status
                  </label>
                  <Select value={taskData.status} onValueChange={handleStatusChange} disabled={isSubmitting} className="bg-white">
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <div className="flex items-center">
                        {getStatusIcon(taskData.status)}
                        <SelectValue className="ml-2" placeholder="Select status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value={TaskStatus.PENDING} className="flex items-center">
                        <div className="flex items-center px-2">
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS} className="flex items-center">
                        <div className="flex items-center px-2">
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED} className="flex items-center">
                        <div className="flex items-center px-2">
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TaskStatus.DELAYED} className="flex items-center">
                        <div className="flex items-center px-2">
                          <span>Delayed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-1">
                    Contribution
                  </label>
                  <textarea
                    id="contribution"
                    name="contribution"
                    value={taskData.contribution}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={3}
                    placeholder="Describe how this task contributes to the project or company goals"
                  />
                  <p className="text-sm text-gray-500 mt-1">{taskData.contribution.length}/300 characters</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="achieved_deliverables" className="block text-sm font-medium text-gray-700 mb-1">
                    Achieved Deliverables
                  </label>
                  <textarea
                    id="achieved_deliverables"
                    name="achieved_deliverables"
                    value={taskData.achieved_deliverables}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows={3}
                    placeholder="List the deliverables achieved for this task"
                  />
                  <p className="text-sm text-gray-500 mt-1">{taskData.achieved_deliverables.length}/300 characters</p>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="location_name"
                      name="location_name"
                      value={taskData.location_name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter task location"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || formProgress < 100}
                  className="bg-green text-white py-2 px-6 rounded-md hover:bg-blue transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Adding Task...
                    </>
                  ) : (
                    "Add Task"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TaskModal