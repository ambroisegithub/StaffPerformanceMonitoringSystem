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
  FaPaperclip,
  FaExchangeAlt,
  FaTags,
} from "react-icons/fa"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { fetchTaskTypes } from "../../../Redux/Slices/TaskTypeSlices"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import FileUpload from "./FileUpload"

enum TaskStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => Promise<void>
  mode?: "create" | "rework"
  initialData?: any
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case TaskStatus.COMPLETED:
      return <FaCheckCircle className="text-green" />
    case TaskStatus.IN_PROGRESS:
      return <FaClock className="text-blue" />
    default:
      return <FaClock className="text-yellow" />
  }
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, mode = "create", initialData = null }) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { isReworking } = useAppSelector((state) => state.task)
  const { taskTypes, loading: taskTypesLoading } = useAppSelector((state) => state.taskTypes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const today = new Date().toISOString().split("T")[0]
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
    task_type_id: "", // ENHANCEMENT: Add task type field
  })

  // ENHANCEMENT: Fetch task types when modal opens
  useEffect(() => {
    if (isOpen && taskTypes.length === 0) {
      dispatch(fetchTaskTypes())
    }
  }, [isOpen, dispatch, taskTypes.length])

  useEffect(() => {
    if (isOpen) {
      if (mode === "rework" && initialData) {
        setTaskData({
          title: initialData.title || "",
          description: initialData.description || "",
          company_served: initialData.company_served?.name || (showCompanyField ? user?.company?.name || "" : ""),
          contribution: initialData.contribution || "",
          due_date: today,
          latitude: initialData.latitude || 0,
          longitude: initialData.longitude || 0,
          location_name: initialData.location_name || "",
          related_project: initialData.related_project || "",
          achieved_deliverables: initialData.achieved_deliverables || "",
          created_by: initialData.created_by || user?.id || 0,
          status: initialData.status || TaskStatus.IN_PROGRESS,
          task_type_id: initialData.taskType?.id?.toString() || "",
        })

        if (initialData.attached_documents && initialData.attached_documents.length > 0) {
          const existingDocs = initialData.attached_documents.map(doc => {
            return new File([], doc.name || "document", {
              type: doc.type || "application/octet-stream"
            })
          })
          setSelectedFiles(existingDocs)
        } else {
          setSelectedFiles([])
        }
      } else {
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
          task_type_id: "", // ENHANCEMENT: Reset task type
        })
        setSelectedFiles([])
      }
    }
  }, [isOpen, mode, initialData, showCompanyField, user, today])

  useEffect(() => {
    const requiredFields = [
      "title",
      "description",
      "contribution",
      "due_date",
      "related_project",
      "achieved_deliverables",
    ]

    if (showCompanyField) {
      requiredFields.push("company_served")
    }

    const filledRequiredFields = requiredFields.filter(
      (field) => taskData[field] !== "" && taskData[field] !== undefined && taskData[field] !== null,
    ).length

    setFormProgress((filledRequiredFields / requiredFields.length) * 100)
  }, [taskData, showCompanyField])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTaskData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskData((prev) => ({ ...prev, due_date: today }))
  }

  const handleStatusChange = (value: string) => {
    setTaskData((prev) => ({ ...prev, status: value }))
  }

  // ENHANCEMENT: Handle task type selection
  const handleTaskTypeChange = (value: string) => {
    setTaskData((prev) => ({ ...prev, task_type_id: value }))
  }

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || (mode === "rework" && isReworking)) return

    setIsSubmitting(true)
    try {
      const submissionData = {
        ...taskData,
        // ENHANCEMENT: Include task type ID if selected
        task_type_id: taskData.task_type_id ? Number.parseInt(taskData.task_type_id) : undefined,
        attached_documents: selectedFiles.length > 0 ? selectedFiles : undefined,
      }

      await onSubmit(submissionData)

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
        task_type_id: "", // ENHANCEMENT: Reset task type
      })
      setSelectedFiles([])
      onClose()
    } catch (error) {
      console.error("Task submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModalTitle = () => {
    if (mode === "rework") {
      return initialData?.isShifted ? "Continue Shifted Task" : "Rework Task"
    }
    return "Add New Task"
  }

  const getSubmitButtonText = () => {
    if (mode === "rework") {
      if (initialData?.isShifted) {
        return isReworking ? "Continuing..." : "Continue Task"
      }
      return isReworking ? "Reworking..." : "Resubmit Task"
    }
    return isSubmitting ? "Adding Task..." : "Add Task"
  }

  const isLoading = mode === "rework" ? isReworking : isSubmitting

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) {
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
              <h2 className="text-3xl font-bold text-gray-800">{getModalTitle()}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
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

            {mode === "rework" && initialData?.isShifted && (
              <div className="mb-4 p-3 bg-orange-50 rounded-md border border-orange-100">
                <div className="flex items-center text-orange-700">
                  <FaExchangeAlt className="mr-2" />
                  <span>
                    This is a shifted task from {initialData.originalDueDate?.split("T")[0] || "a previous day"}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={
                  showCompanyField ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 md:grid-cols-2 gap-6"
                }
              >
                <div className={showCompanyField ? "" : "md:col-span-2"}>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <div className="relative w-full">
                    <FaClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={taskData.title}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                <div className={`${!showCompanyField ? "md:col-span-2" : ""}`}>
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
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter related project"
                    />
                  </div>
                </div>

                {/* ENHANCEMENT: Task Type Selection */}
                <div className={showCompanyField ? "" : "md:col-span-2"}>
                  <label htmlFor="task_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type (Optional)
                  </label>
                  <Select
                    value={taskData.task_type_id}
                    onValueChange={handleTaskTypeChange}
                    disabled={isLoading || taskTypesLoading}
                  >
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <div className="flex items-center">
                        <FaTags className="mr-2 text-gray-400" />
                        <SelectValue placeholder="Select task type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="none">
                        <div className="flex items-center px-2">
                          <span>No task type</span>
                        </div>
                      </SelectItem>
                      {taskTypes.map((taskType) => (
                        <SelectItem key={taskType.id} value={taskType.id.toString()}>
                          <div className="flex items-center px-2">
                            <FaTags className="mr-2 text-blue-500" />
                            <span>{taskType.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {taskTypesLoading && <p className="text-xs text-gray-500 mt-1">Loading task types...</p>}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                  <Select value={taskData.status} onValueChange={handleStatusChange} disabled={isLoading}>
                    <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                      <div className="flex items-center">
                        {getStatusIcon(taskData.status)}
                        <SelectValue className="ml-2" placeholder="Select status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value={TaskStatus.IN_PROGRESS}>
                        <div className="flex items-center px-2">
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>
                        <div className="flex items-center px-2">
                          <span>Completed</span>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter task location"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaPaperclip className="inline mr-2" />
                    Attach Documents (Optional)
                  </label>
                  <FileUpload
                    files={selectedFiles}
                    onFilesChange={handleFilesChange}
                    disabled={isLoading}
                    maxFiles={5}
                    maxFileSize={10}
                    existingFiles={mode === "rework" && initialData?.attached_documents ?
                      initialData.attached_documents.map(doc => ({
                        name: doc.name,
                        url: doc.url,
                        size: doc.size,
                        type: doc.type
                      })) : []
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || formProgress < 100}
                  className="bg-green text-white py-2 px-6 rounded-md hover:bg-blue transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {getSubmitButtonText()}
                    </>
                  ) : (
                    getSubmitButtonText()
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
