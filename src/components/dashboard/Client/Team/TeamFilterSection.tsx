"use client"

import React from "react"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Filter,
  ChevronDown,
  X,
  Calendar,
  Users,
  CheckSquare,
  BarChart,
  Building,
  Briefcase,
  FileText,
  Search,
} from "lucide-react"
import type { TaskReviewFilters } from "../../../../Redux/Slices/TaskReviewSlice"
import { Badge } from "../../../ui/Badge"
import { Input } from "../../../ui/input"

interface TeamFilterSectionProps {
  filters: TaskReviewFilters
  onFilterChange: (filters: TaskReviewFilters) => void
  teamTasks?: any[] // Added to access team data for the dropdown
}

const TeamFilterSection: React.FC<TeamFilterSectionProps> = ({ filters, onFilterChange, teamTasks = [] }) => {
  const [localFilters, setLocalFilters] = useState<TaskReviewFilters>(filters)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Extract unique values for filter dropdowns
  const uniqueValues = useMemo(() => {
    const companies = new Set<string>()
    const departments = new Set<string>()
    const projects = new Set<string>()
    const userLevels = new Set<string>()
    const teams = new Set<string>()
    const supervisors = new Set<string>()

    if (teamTasks && teamTasks.length > 0) {
      teamTasks.forEach((teamData) => {
        // Add team name
        if (teamData.team) {
          teams.add(teamData.team)
        }

        // Add supervisor
        if (teamData.supervisor?.name) {
          supervisors.add(teamData.supervisor.name)
        }

        // Process tasks
        if (teamData.tasks && teamData.tasks.length > 0) {
          teamData.tasks.forEach((task: any) => {
            if (task.company) companies.add(task.company)
            if (task.department) departments.add(task.department)
            if (task.related_project) projects.add(task.related_project)

            // Add user level from created_by if available
            if (task.created_by?.level) {
              userLevels.add(task.created_by.level)
            }
          })
        }
      })
    }

    return {
      companies: Array.from(companies),
      departments: Array.from(departments),
      projects: Array.from(projects),
      userLevels: Array.from(userLevels),
      teams: Array.from(teams),
      supervisors: Array.from(supervisors),
    }
  }, [teamTasks])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    // Count active filters
    let count = 0
    if (localFilters.status) count++
    if (localFilters.userName) count++
    if (localFilters.startDate) count++
    if (localFilters.endDate) count++
    if (localFilters.userLevel) count++
    if (localFilters.company) count++
    if (localFilters.department) count++
    if (localFilters.project) count++

    setActiveFiltersCount(count)
  }, [localFilters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    if (window.innerWidth < 768) {
    }
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userName: undefined,
      userLevel: undefined,
      company: undefined,
      department: undefined,
      project: undefined,
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const clearSingleFilter = (filterName: keyof TaskReviewFilters) => {
    setLocalFilters((prev) => ({ ...prev, [filterName]: undefined }))
    onFilterChange({ ...localFilters, [filterName]: undefined })
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      {/* Filter Header - Always visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-green text-white border-green">{activeFiltersCount} active</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
            <button
              className="flex items-center text-green hover:text-green-700 font-medium text-sm"
            >
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {localFilters.status && (
              <Badge className="bg-blue text-white border-blue-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <CheckSquare className="h-3 w-3 mr-1" />
                Status: {localFilters.status}
                <button
                  onClick={() => clearSingleFilter("status")}
                  className="ml-1 p-0.5 hover:bg-blue rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {localFilters.userName && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Users className="h-3 w-3 mr-1" />
                Team Member: {localFilters.userName}
                <button
                  onClick={() => clearSingleFilter("userName")}
                  className="ml-1 p-0.5 hover:bg-purple-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

 

  

 


            {(localFilters.startDate || localFilters.endDate) && (
              <Badge className="bg-red text-white border-red-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Calendar className="h-3 w-3 mr-1" />
                Date Range: {localFilters.startDate || "Any"} to {localFilters.endDate || "Any"}
                <button
                  onClick={() => {
                    clearSingleFilter("startDate")
                    clearSingleFilter("endDate")
                  }}
                  className="ml-1 p-0.5 hover:bg-red rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Expandable Filter Content */}
      <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Status Filter */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={localFilters.status || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Team Filter */}
                <div>
                  <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                    Team
                  </label>
                  <select
                    id="team"
                    name="team"
                    value={localFilters.team || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Teams</option>
                    {uniqueValues.teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supervisor Filter */}

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                {/* Department Filter */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={localFilters.department || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">All Departments</option>
                    {uniqueValues.departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Search Filter */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Input
                      id="search"
                      name="search"
                      placeholder="Search tasks..."
                      value={localFilters.search || ""}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Date Range Filters */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={localFilters.startDate || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={localFilters.endDate || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Reset All
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-green border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default TeamFilterSection

