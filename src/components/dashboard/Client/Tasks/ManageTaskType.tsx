
// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTag,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaFilter,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchTaskTypes,
  createTaskType,
  updateTaskType,
  deleteTaskType,
  clearTaskTypeErrors,
} from "../../../../Redux/Slices/TaskTypeSlices"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Badge } from "../../../ui/Badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip"
import { Alert, AlertDescription } from "../../../ui/alert"
import TaskTypeModal from "./TaskTypeModal"
import Loader from "../../../ui/Loader"

interface TaskType {
  id: number
  name: string
  organization: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
}

const ManageTaskType: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { taskTypes, loading, error, isCreating, isUpdating, isDeleting, createError, updateError, deleteError } =
    useAppSelector((state) => state.taskTypes)

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const itemsPerPage = 10

  // Fetch task types on component mount
  useEffect(() => {
    if (user?.organization?.id) {
      console.log("🔄 [MANAGE TASK TYPES] Fetching task types for organization:", user.organization.id)
      dispatch(fetchTaskTypes())
    }
  }, [dispatch, user?.organization?.id])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearTaskTypeErrors())
    }
  }, [dispatch])

  // Filter and paginate task types
  const filteredTaskTypes = useMemo(() => {
    return taskTypes.filter((taskType) => taskType.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [taskTypes, searchTerm])

  const totalPages = Math.ceil(filteredTaskTypes.length / itemsPerPage)
  const paginatedTaskTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTaskTypes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTaskTypes, currentPage])

  // Handle create task type
  const handleCreateTaskType = async (data: { name: string }) => {
    try {
      await dispatch(createTaskType(data)).unwrap()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Create task type error:", error)
      throw error
    }
  }

  // Handle update task type
  const handleUpdateTaskType = async (data: { name: string }) => {
    if (!selectedTaskType) return

    try {
      await dispatch(
        updateTaskType({
          taskTypeId: selectedTaskType.id,
          taskTypeData: data,
        }),
      ).unwrap()
      setIsModalOpen(false)
      setSelectedTaskType(null)
    } catch (error) {
      console.error("Update task type error:", error)
      throw error
    }
  }

  // Handle delete task type
  const handleDeleteTaskType = async (taskTypeId: number) => {
    try {
      await dispatch(deleteTaskType(taskTypeId)).unwrap()
      setDeleteConfirmId(null)
    } catch (error) {
      console.error("Delete task type error:", error)
    }
  }

  // Modal handlers
  const openCreateModal = () => {
    setModalMode("create")
    setSelectedTaskType(null)
    setIsModalOpen(true)
  }

  const openEditModal = (taskType: TaskType) => {
    setModalMode("edit")
    setSelectedTaskType(taskType)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTaskType(null)
    dispatch(clearTaskTypeErrors())
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Show loading if user data is not available yet
  if (!user?.id || !user?.organization?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader />
          <span className="ml-4 text-gray-600">Loading user information...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaTag className="mr-3 text-blue-500" />
              Manage Task Types
            </h1>
            <p className="text-gray-600 mt-2">Create and manage task types for your organization</p>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center"
            disabled={isCreating}
          >
            <FaPlus className="mr-2" />
            Add New Task Type
          </Button>
        </div>

        {/* Error Alerts */}
        {(error || createError || updateError || deleteError) && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <FaExclamationTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || createError || updateError || deleteError}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Task Types
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by task type name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page on search
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-500">
                  <FaFilter className="inline mr-1" />
                  {filteredTaskTypes.length} of {taskTypes.length} task types
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Types Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaTag className="mr-2 text-blue-500" />
              Task Types ({filteredTaskTypes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
                <span className="ml-4 text-gray-600">Loading task types...</span>
              </div>
            ) : filteredTaskTypes.length === 0 ? (
              <div className="text-center py-12">
                <FaTag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "No task types found" : "No task types yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search criteria" : "Get started by creating your first task type"}
                </p>
                {!searchTerm && (
                  <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <FaPlus className="mr-2" />
                    Create Task Type
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Task Type Name</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTaskTypes.map((taskType, index) => (
                        <TableRow key={taskType.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <FaTag className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{taskType.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {taskType.organization.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <FaCalendarAlt className="mr-2 h-3 w-3" />
                              {formatDate(taskType.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <FaCalendarAlt className="mr-2 h-3 w-3" />
                              {formatDate(taskType.updated_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => openEditModal(taskType)}
                                      size="sm"
                                      className="bg-blue-500 text-white hover:bg-blue-600 p-2"
                                      disabled={isUpdating}
                                    >
                                      <FaEdit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit task type</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => setDeleteConfirmId(taskType.id)}
                                      size="sm"
                                      className="bg-red-500 text-white hover:bg-red-600 p-2"
                                      disabled={isDeleting}
                                    >
                                      {isDeleting && deleteConfirmId === taskType.id ? (
                                        <FaSpinner className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <FaTrash className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete task type</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredTaskTypes.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                      Showing {Math.min(filteredTaskTypes.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                      {Math.min(filteredTaskTypes.length, currentPage * itemsPerPage)} of {filteredTaskTypes.length}{" "}
                      task types
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
                              className={currentPage === pageNum ? "bg-blue-500 text-white" : ""}
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
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Type Modal */}
      <TaskTypeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={modalMode === "create" ? handleCreateTaskType : handleUpdateTaskType}
        mode={modalMode}
        initialData={selectedTaskType}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Task Type</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this task type? This will permanently remove it from your organization.
            </p>
            <div className="flex justify-end space-x-3">
              <Button onClick={() => setDeleteConfirmId(null)} variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteTaskType(deleteConfirmId)}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2 h-4 w-4" />
                    Delete Task Type
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default ManageTaskType
