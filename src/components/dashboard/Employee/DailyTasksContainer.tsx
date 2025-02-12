// @ts-nocheck
"use client"
import React from "react"
import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { fetchDailyTasks } from "../../../Redux/Slices/TaskSlices"
import DailyTaskGroup from "./DailyTaskGroup"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card"
import { Input } from "../../ui/input"
import { Select, SelectItem } from "../../ui/select"
import { Button } from "../../ui/button"
import { FaCalendarAlt, FaSearch, FaFilter, FaSpinner } from "react-icons/fa"

const DailyTasksContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading } = useAppSelector((state) => state.dailytasks)

  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const tasksPerPage = 5

  useEffect(() => {
    if (user) {
      dispatch(fetchDailyTasks(user.id))
    }
  }, [dispatch, user])

  // Filter tasks based on search and filters
  const filteredTasks = dailyTasks.filter((dailyTask) => {
    // Date filter
    const matchesDate =
      dateFilter === "" || new Date(dailyTask.submission_date).toISOString().split("T")[0] === dateFilter

    // Status filter
    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "submitted" && dailyTask.submitted) ||
      (statusFilter === "not_submitted" && !dailyTask.submitted)

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

    return matchesDate && matchesStatus && matchesSearch
  })

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage
  const indexOfFirstTask = indexOfLastTask - tasksPerPage
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateFilter, statusFilter])

  if (loading && dailyTasks.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-blue" />
          <span className="ml-2">Loading daily tasks...</span>
        </CardContent>
      </Card>
    )
  }

  if (dailyTasks.length === 0 && !loading) {
    return (
      <Card className="shadow-md">
        <CardContent className="flex flex-col justify-center items-center h-64">
          <FaCalendarAlt className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No daily tasks found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Daily Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by status">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
              </Select>
            </div>
          </div>

          {filteredTasks.length === 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-center text-gray-500">
              No tasks match your search criteria
            </div>
          )}
        </CardContent>
      </Card>
      <div>
      {currentTasks.map((dailyTask) => (
        <DailyTaskGroup key={dailyTask.id} dailyTask={dailyTask} />
      ))}
      </div>
      {/* Daily Task Groups */}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} variant="outline" size="sm">
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                onClick={() => paginate(number)}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                className={currentPage === number ? "bg-blue text-white" : ""}
              >
                {number}
              </Button>
            ))}

            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailyTasksContainer

