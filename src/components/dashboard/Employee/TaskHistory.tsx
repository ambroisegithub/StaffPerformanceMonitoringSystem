// @ts-nocheck

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaFilter,
  FaSort,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaBuilding,
  FaMapMarkerAlt,
} from "react-icons/fa"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../ui/collapsible"
import React from "react"

const TaskHistory = () => {
  const [filter, setFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [sortOrder, setSortOrder] = useState("desc")
  const [expandedTask, setExpandedTask] = useState(null)

  const tasks = [
    {
      id: 1,
      date: "2025-02-15",
      description: "Implemented new feature",
      status: "Completed",
      company: "Company A",
      location: "Office Location A",
      department: "Information Technology",
      contribution: "Enhanced user experience and improved system efficiency.",
      project: "Project Alpha",
      related_project: "Project Alpha",
      achieved_deliverables: "Improved system efficiency by 20%",
    },
    {
      id: 2,
      date: "2025-02-15",
      description: "Client meeting",
      status: "In Progress",
      company: "Company B",
      location: "Office Location B",
      department: "Sales",
      contribution: "Discussed project requirements and timeline.",
      project: "Project Beta",
      related_project: "Project Beta",
      achieved_deliverables: "Defined project requirements and timeline",
    },
    {
      id: 3,
      date: "2025-02-14",
      description: "Prepared financial report",
      status: "Delayed",
      company: "Company C",
      location: "Remote",
      department: "Finance",
      contribution: "Analyzed Q1 financial data for board meeting.",
      project: "Project Gamma",
      related_project: "Project Gamma",
      achieved_deliverables: "Completed financial analysis for Q1",
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <FaCheckCircle className="text-green" />
      case "In Progress":
        return <FaClock className="text-blue" />
      case "Delayed":
        return <FaExclamationCircle className="text-red" />
      default:
        return null
    }
  }

  const getStatusColor = (status:any) => {
    switch (status) {
      case "Completed":
        return "bg-green text-white"
      case "In Progress":
        return "bg-blue text-white"
      case "Delayed":
        return "bg-red text-white"
      default:
        return "bg-gray text-white"
    }
  }

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "all") return true
      return task.status.toLowerCase() === filter
    })
    .filter((task) => {
      if (!dateRange.start || !dateRange.end) return true
      const taskDate = new Date(task.date)
      return taskDate >= new Date(dateRange.start) && taskDate <= new Date(dateRange.end)
    })
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  return (
    <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Task History</h2>
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-4 p-6 bg-white rounded-lg shadow-md"
      >
        <div className="flex items-center gap-2 bg-white">
          <FaFilter className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-green bg-white text-gray-700"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500" />
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-green"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-green"
          />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors duration-200 text-gray-700"
        >
          <FaSort className="text-gray-500" />
          Sort {sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>
      </motion.div>

      {/* Tasks List */}
      <AnimatePresence>
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <motion.div
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={`font-medium px-3 py-1 rounded-full text-sm ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-800 font-semibold">{task.description}</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <p>{task.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400" />
                        <p>{task.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <p>{task.location}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      {expandedTask === task.id ? (
                        <FaChevronUp className="text-gray-500" />
                      ) : (
                        <FaChevronDown className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 p-6 rounded-b-lg border-t border-gray-200"
                >
                  <div className="flex flex-col justify-between gap-6 md:flex-row lg:flex-row">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Department</h4>
                      <p className="text-gray-600">{task.department}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Project</h4>
                      <p className="text-gray-600">{task.project}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Related Project</h4>
                      <p className="text-gray-600">{task.related_project}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Achieved Deliverables</h4>
                      <p className="text-gray-600">{task.achieved_deliverables}</p>
                    </div>
                    <div className="md:col-span-3">
                      <h4 className="font-semibold text-gray-700 mb-2">Contribution</h4>
                      <p className="text-gray-600">{task.contribution}</p>
                    </div>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TaskHistory

