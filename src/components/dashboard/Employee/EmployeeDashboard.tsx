// @ts-nocheck

"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { fetchDailyTasks, createTask } from "../../../Redux/Slices/TaskSlices"
import { FaPlus, FaCalendarAlt, FaSearch, FaFilter, FaArrowRight } from "react-icons/fa"
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

const EmployeeDashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading, error } = useAppSelector((state) => state.task)

  const tasksPerPage = 5

  useEffect(() => {
    if (user) {
      dispatch(fetchDailyTasks(user.id))
    }
  }, [dispatch, user])

  const handleCreateTask = async (taskData: any) => {
    if (user) {
      await dispatch(createTask({ ...taskData, created_by: user.id }))
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
            task.company_served.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-green text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Daily Task
          </Button>
        </div>

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
                        <Button variant="outline" className="hover:bg-white w-full justify-start text-left font-normal">
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
                        <Button variant="outline" className="hover:bg-white w-full justify-start text-left font-normal">
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

                  <Button variant="outline" onClick={clearDateFilters} className="hover:bg-green hover:text-white whitespace-nowrap">
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

