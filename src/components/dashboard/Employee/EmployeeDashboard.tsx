// @ts-nocheck
"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { fetchDailyTasks, createTask, clearShiftResult } from "../../../Redux/Slices/TaskSlices"
import { FaPlus, FaCalendarAlt, FaSearch, FaFilter, FaArrowRight, FaInfo, FaHistory } from "react-icons/fa"
import TaskModal from "./TaskModal"
import DailyTaskGroup from "./DailyTaskGroup"
import TaskStatistics from "./TaskStatistics"
import Loader from "../../ui/Loader"
import { Card, CardContent } from "../../ui/Card"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { Calendar } from "../../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { format } from "date-fns"
import ChatButton from "../../Chat/ChatButton"
import { Alert, AlertDescription } from "../../ui/alert"

const EmployeeDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  // ENHANCEMENT: Add state for showing auto-shift info
  const [showAutoShiftInfo, setShowAutoShiftInfo] = useState(false)
  // ENHANCEMENT: Track if initial load is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading, error, lastShiftResult } = useAppSelector((state) => state.task)

  const tasksPerPage = 5

  // ENHANCEMENT: Auto-shift and fetch tasks when dashboard loads
  useEffect(() => {
    if (user?.id && user?.organization?.id && !initialLoadComplete) {
      console.log("🔄 [DASHBOARD] Initial load - triggering fetch with auto-shift")
      console.log("👤 [DASHBOARD] User ID:", user.id)
      console.log("🏢 [DASHBOARD] Organization ID:", user.organization.id)

      // Fetch daily tasks (auto-shift happens in backend)
      dispatch(fetchDailyTasks(user.id))
        .unwrap()
        .then(() => {
          console.log("✅ [DASHBOARD] Initial fetch with auto-shift completed")
          setInitialLoadComplete(true)
        })
        .catch((error) => {
          console.error("❌ [DASHBOARD] Initial fetch failed:", error)
          setInitialLoadComplete(true)
        })
    }
  }, [dispatch, user?.id, user?.organization?.id, initialLoadComplete])

  // ENHANCEMENT: Check for shifted tasks and show info
  useEffect(() => {
    if (user && dailyTasks.length > 0 && initialLoadComplete) {
      checkForShiftedTasks()
    }
  }, [user, dailyTasks, initialLoadComplete])

  // ENHANCEMENT: Show shift result notification
  useEffect(() => {
    if (lastShiftResult) {
      console.log("📊 [DASHBOARD] Shift result received:", lastShiftResult)
      setShowAutoShiftInfo(true)
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setShowAutoShiftInfo(false)
        dispatch(clearShiftResult())
      }, 10000)
    }
  }, [lastShiftResult, dispatch])

  // ENHANCEMENT: Function to check for shifted tasks and show info
  const checkForShiftedTasks = () => {
    let hasShiftedTasks = false

    for (const dailyTask of dailyTasks) {
      const shiftedTasks = dailyTask.tasks.filter((task) => task.isShifted)
      if (shiftedTasks.length > 0) {
        hasShiftedTasks = true
        break
      }
    }

    if (hasShiftedTasks) {
      setShowAutoShiftInfo(true)
      // Auto-hide the info after 10 seconds
      setTimeout(() => {
        setShowAutoShiftInfo(false)
      }, 10000)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    if (user) {
      await dispatch(createTask({ ...taskData, created_by: user.id }))
      // Refresh daily tasks after creating a task
      dispatch(fetchDailyTasks(user.id))
    }
  }

  const clearDateFilters = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

  // Filter and paginate daily tasks
  const filteredDailyTasks = React.useMemo(() => {
    return dailyTasks.filter((dailyTask) => {
      const taskDate = new Date(dailyTask.submission_date)

      // Date range filter
      const isAfterStartDate = startDate ? taskDate >= startDate : true
      const isBeforeEndDate = endDate ? taskDate <= endDate : true
      const matchesDateRange = isAfterStartDate && isBeforeEndDate

      // Search term (across tasks within daily task)
      const matchesSearch =
        searchTerm === "" ||
        dailyTask.tasks.some(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof task.company_served === "object" &&
              task.company_served?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            task.related_project.toLowerCase().includes(searchTerm.toLowerCase()),
        )

      return matchesDateRange && matchesSearch
    })
  }, [dailyTasks, startDate, endDate, searchTerm])

  const totalPages = Math.ceil(filteredDailyTasks.length / tasksPerPage)
  const paginatedDailyTasks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * tasksPerPage
    return filteredDailyTasks.slice(startIndex, startIndex + tasksPerPage)
  }, [filteredDailyTasks, currentPage])

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
      {/* Chat Button */}
      <ChatButton userId={user.id} organizationId={user.organization.id} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-green text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Daily Task
            </Button>
          </div>
        </div>

        {/* ENHANCEMENT: Show auto-shift info */}
        {showAutoShiftInfo && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <FaInfo className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {lastShiftResult ? (
                <div>
                  <strong>Shift Completed:</strong> Successfully shifted {lastShiftResult.tasksShifted} task
                  {lastShiftResult.tasksShifted !== 1 ? "s" : ""} to today ({lastShiftResult.shiftDate}).
                  {lastShiftResult.tasks.length > 0 && (
                    <div className="mt-2">
                      <strong>Shifted tasks:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {lastShiftResult.tasks.map((task, index) => (
                          <li key={index} className="text-sm">
                            {task.title} (Work days: {task.previousWorkDays} → {task.workDaysCount})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <strong>Auto-Shift Applied:</strong> Some of your in-progress tasks from previous days (including
                  yesterday) have been automatically moved to today to help you stay organized and continue your work.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Section */}
        {!loading && !error && dailyTasks.length > 0 && <TaskStatistics dailyTasks={dailyTasks} />}

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search Input */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tasks
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by title, description, company..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset to first page on search
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date Range</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="hover:bg-white w-full justify-start text-left font-normal bg-transparent"
                        >
                          <FaCalendarAlt className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Start Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date)
                            setIsStartDateOpen(false)
                            setCurrentPage(1)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center justify-center">
                    <FaArrowRight className="text-gray-400" />
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="hover:bg-white w-full justify-start text-left font-normal bg-transparent"
                        >
                          <FaCalendarAlt className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "End Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date)
                            setIsEndDateOpen(false)
                            setCurrentPage(1)
                          }}
                          initialFocus
                          disabled={(date) => (startDate ? date < startDate : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button
                    variant="outline"
                    onClick={clearDateFilters}
                    className="hover:bg-green hover:text-white whitespace-nowrap bg-transparent"
                  >
                    Clear Dates
                  </Button>
                </div>
              </div>
            </div>

            {/* Filter Status */}
            {(startDate || endDate || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FaFilter className="mr-1" /> Filters:
                </div>
                {searchTerm && <div className="bg-blue/10 text-blue px-2 py-1 rounded-md">Search: "{searchTerm}"</div>}
                {startDate && (
                  <div className="bg-blue/10 text-blue px-2 py-1 rounded-md">From: {format(startDate, "PP")}</div>
                )}
                {endDate && (
                  <div className="bg-blue/10 text-blue px-2 py-1 rounded-md">To: {format(endDate, "PP")}</div>
                )}
              </div>
            )}

            {/* ENHANCEMENT: Show shift status */}
            {lastShiftResult && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaHistory className="text-orange-600" />
                  <span className="text-orange-800 font-medium">
                    Last shift: {lastShiftResult.tasksShifted} task{lastShiftResult.tasksShifted !== 1 ? "s" : ""} moved
                    to {lastShiftResult.shiftDate}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Section */}
        {loading ? (
          <Loader />
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-red-500">{error}</p>
          </Card>
        ) : filteredDailyTasks.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No tasks found matching your criteria</p>
          </Card>
        ) : (
          <>
            {paginatedDailyTasks.map((dailyTask) => (
              <DailyTaskGroup key={dailyTask.id} dailyTask={dailyTask} />
            ))}

            {/* Pagination */}
            {filteredDailyTasks.length > tasksPerPage && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="hover:bg-white"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="hover:bg-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTask} />
    </div>
  )
}

export default EmployeeDashboard
