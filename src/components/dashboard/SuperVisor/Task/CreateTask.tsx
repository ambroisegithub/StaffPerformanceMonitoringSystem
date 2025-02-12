// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useDispatch, useSelector } from "react-redux"
import { createTask, fetchDailyTasks, submitDailyTasks } from "../../../../Redux/Slices/TaskSlices"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../../ui/select"
import { Textarea } from "../../../ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { toast } from "react-toastify"
import {
  FaClipboardList,
  FaBuilding,
  FaProjectDiagram,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
  FaTasks,
} from "react-icons/fa"
import SupervisorDailyTasks from "./SupervisorDailyTasks"
import Loader from "../../../ui/Loader"

enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DELAYED = "delayed",
}

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

const CreateTask: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, dailyTasks } = useSelector((state: RootState) => state.task)
  const user = useSelector((state: RootState) => state.login.user)
  const [formProgress, setFormProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("create")
  const [isFetchingDailyTasks, setIsFetchingDailyTasks] = useState(false)
  const today = new Date().toISOString().split("T")[0]

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    company_served: user?.company?.name || "",
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
    if (user?.id) {
      fetchDailyTasksData()
    }
  }, [dispatch, user?.id])

  const fetchDailyTasksData = async () => {
    setIsFetchingDailyTasks(true)
    try {
      await dispatch(fetchDailyTasks(user.id)).unwrap()
    } finally {
      setIsFetchingDailyTasks(false)
    }
  }

  useEffect(() => {
    const requiredFields = user?.company
      ? [
          "title",
          "description",
          "company_served",
          "contribution",
          "due_date",
          "related_project",
          "achieved_deliverables",
          "status",
        ]
      : ["title", "description", "contribution", "due_date", "related_project", "achieved_deliverables", "status"]

    const filledFields = requiredFields.filter((field) => taskData[field as keyof typeof taskData] !== "").length
    setFormProgress((filledFields / requiredFields.length) * 100)
  }, [taskData, user?.company])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTaskData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setTaskData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formProgress < 100) {
      toast.warning("Please fill in all required fields")
      return
    }
    try {
      await dispatch(createTask(taskData)).unwrap()
      setTaskData({
        title: "",
        description: "",
        company_served: user?.company?.name || "",
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
      fetchDailyTasksData() 
    } catch (error) {}
  }

  const handleSubmitDailyTasks = async (dailyTaskId: number) => {
    if (!user?.id) return
    try {
      await dispatch(
        submitDailyTasks({
          userId: user.id,
          dailyTaskId,
        }),
      ).unwrap()
      fetchDailyTasksData() 
    } catch (error) {
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "daily" && dailyTasks.length === 0) {
      fetchDailyTasksData() 
    }
  }

  return (
    <div className="container mx-auto lg:px-[150px] md:px-[40px] px-[20px] py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 border-b py-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-lg font-medium flex items-center">
                <FaClipboardList className="mr-2 text-blue" /> Task Management
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-0">
              <TabsList className="grid w-full sm:w-[400px] grid-cols-2 my-5">
                <TabsTrigger value="create" className="flex items-center">
                  <FaClipboardList className="mr-2 h-4 w-4" /> Create Task
                </TabsTrigger>
                <TabsTrigger value="daily" className="flex items-center">
                  <FaTasks className="mr-2 h-4 w-4" /> Submit Daily Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="mt-0">
                {/* Form Progress */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Form Completion: {formProgress.toFixed(0)}%</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Task Title */}
                    <div>
                      <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">
                        Title <span className="text-red">*</span>
                      </label>
                      <div className="relative">
                        <FaClipboardList className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        <Input
                          id="title"
                          name="title"
                          value={taskData.title}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="pl-7 py-1 h-10 text-sm"
                          placeholder="Enter task title"
                        />
                      </div>
                    </div>

                    {/* Company Served - Only show if user has a company */}
                    {user?.company && (
                      <div>
                        <label htmlFor="company_served" className="block text-xs font-medium text-gray-700 mb-1">
                          Company Served
                        </label>
                        <div className="relative">
                          <FaBuilding className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                          <Input
                            id="company_served"
                            name="company_served"
                            value={taskData.company_served}
                            onChange={handleChange}
                            readOnly
                            className="pl-7 py-1 h-10 text-sm bg-gray-100"
                          />
                        </div>
                      </div>
                    )}

                    {/* If user doesn't have a company, we need to adjust the grid */}
                    {!user?.company && (
                      <div>
                        <label htmlFor="related_project" className="block text-xs font-medium text-gray-700 mb-1">
                          Related Project <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <FaProjectDiagram className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                          <Input
                            id="related_project"
                            name="related_project"
                            value={taskData.related_project}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="pl-7 py-1 h-10 text-sm"
                            placeholder="Enter related project"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                        Description <span className="text-red">*</span>
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        value={taskData.description}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="min-h-[60px] text-sm py-1"
                        placeholder="Describe the task in detail"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">{taskData.description.length}/500 characters</p>
                    </div>

                    {/* Two items in one row - Only show if user has a company */}
                    {user?.company && (
                      <div>
                        <label htmlFor="related_project" className="block text-xs font-medium text-gray-700 mb-1">
                          Related Project <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <FaProjectDiagram className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                          <Input
                            id="related_project"
                            name="related_project"
                            value={taskData.related_project}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="pl-7 py-1 h-10 text-sm"
                            placeholder="Enter related project"
                          />
                        </div>
                      </div>
                    )}

                    {/* Due Date - Only allow current date */}
                    <div>
                      <label htmlFor="due_date" className="block text-xs font-medium text-gray-700 mb-1">
                        Due Date <span className="text-red">*</span>
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        <Input
                          type="date"
                          id="due_date"
                          name="due_date"
                          value={taskData.due_date}
                          onChange={handleChange}
                          required
                          disabled={loading}
                          className="pl-7 py-1 h-10 text-sm"
                          min={today}
                          max={today}
                        />
                      </div>
                    </div>

                    {/* Task Status */}
                    <div>
                      <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                        Task Status <span className="text-red">*</span>
                      </label>
                      <Select
                        value={taskData.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-full bg-white h-10 text-sm">
                          <div className="flex items-center">
                            {getStatusIcon(taskData.status)}
                            <span className="ml-2">
                              {taskData.status === TaskStatus.IN_PROGRESS
                                ? "In Progress"
                                : taskData.status === TaskStatus.COMPLETED
                                  ? "Completed"
                                  : taskData.status === TaskStatus.DELAYED
                                    ? "Delayed"
                                    : "Pending"}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskStatus.PENDING}>
                            <div className="flex items-center">
                              <FaClock className="text-yellow mr-2 text-xs" />
                              <span>Pending</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>
                            <div className="flex items-center">
                              <FaClock className="text-blue mr-2 text-xs" />
                              <span>In Progress</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskStatus.COMPLETED}>
                            <div className="flex items-center">
                              <FaCheckCircle className="text-green mr-2 text-xs" />
                              <span>Completed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskStatus.DELAYED}>
                            <div className="flex items-center">
                              <FaExclamationCircle className="text-red mr-2 text-xs" />
                              <span>Delayed</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location_name" className="block text-xs font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        <Input
                          id="location_name"
                          name="location_name"
                          value={taskData.location_name}
                          onChange={handleChange}
                          disabled={loading}
                          className="pl-7 py-1 h-10 text-sm"
                          placeholder="Enter task location"
                        />
                      </div>
                    </div>

                    {/* Contribution */}
                    <div className="md:col-span-2">
                      <label htmlFor="contribution" className="block text-xs font-medium text-gray-700 mb-1">
                        Contribution <span className="text-red">*</span>
                      </label>
                      <Textarea
                        id="contribution"
                        name="contribution"
                        value={taskData.contribution}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="min-h-[70px] text-sm py-1"
                        placeholder="Describe how this task contributes to the project goals"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">{taskData.contribution.length}/300 characters</p>
                    </div>

                    {/* Achieved Deliverables */}
                    <div className="md:col-span-2">
                      <label htmlFor="achieved_deliverables" className="block text-xs font-medium text-gray-700 mb-1">
                        Achieved Deliverables <span className="text-red">*</span>
                      </label>
                      <Textarea
                        id="achieved_deliverables"
                        name="achieved_deliverables"
                        value={taskData.achieved_deliverables}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="min-h-[70px] text-sm py-1"
                        placeholder="List the deliverables achieved (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">
                        {taskData.achieved_deliverables.length}/300 characters
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end mt-3">
                    <Button
                      type="submit"
                      disabled={loading || formProgress < 100}
                      className={`${
                        formProgress < 100 ? "bg-gray-400" : "bg-green hover:bg-green-600"
                      } text-white py-1 px-4 text-sm h-10 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin mr-1 text-xs" />
                          Creating...
                        </>
                      ) : (
                        "Create Task"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="daily" className="mt-0">
                {isFetchingDailyTasks ? (
                  <Loader />
                ) : dailyTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FaTasks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Daily Tasks Found</h3>
                    <p className="text-gray-500 mb-4">You don't have any daily tasks to view or submit.</p>
                    <Button onClick={() => setActiveTab("create")} className="bg-blue text-white hover:bg-blue-600">
                      Create a New Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {dailyTasks.map((dailyTask) => (
                      <SupervisorDailyTasks
                        key={dailyTask.id}
                        dailyTask={dailyTask}
                        onSubmit={() => handleSubmitDailyTasks(dailyTask.id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreateTask
