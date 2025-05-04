"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Calendar, Users, CheckSquare, Briefcase, Building, Users2 } from "lucide-react"
import type { TaskReviewFilters } from "../../../../Redux/Slices/TaskReviewSlice"
import { useAppSelector } from "../../../../Redux/hooks"
import { Badge } from "../../../ui/Badge"

interface OverAllFilterSectionProps {
  filters: TaskReviewFilters
  onFilterChange: (filters: TaskReviewFilters) => void
}

const OverAllFilterSection: React.FC<OverAllFilterSectionProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState<TaskReviewFilters>(filters)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const allDailyTasks = useAppSelector((state) => state.taskReview.allDailyTasks)

  // Extract all unique values for filters
  const { uniqueTeams, uniqueDepartments, uniqueCompanies, uniqueUsers } = useMemo(() => {
    const teams = new Set<string>()
    const departments = new Set<string>()
    const companies = new Set<string>()
    const users = new Map<number, {id: number, username: string, teams: string[]}>()

    allDailyTasks.forEach((member) => {
      // Add user with their teams
      users.set(member.user.id, {
        id: member.user.id,
        username: member.user.username,
        teams: member.user.teams || []
      })

      // Add teams
      if (member.user.teams) {
        member.user.teams.forEach(team => teams.add(team))
      }

      // Add departments and companies from tasks
      Object.values(member.submissions).forEach((submission: any) => {
        submission.tasks.forEach((task: any) => {
          if (task.department) departments.add(task.department)
          if (task.company) companies.add(task.company)
        })
      })
    })

    return {
      uniqueTeams: Array.from(teams).sort(),
      uniqueDepartments: Array.from(departments).sort(),
      uniqueCompanies: Array.from(companies).sort(),
      uniqueUsers: Array.from(users.values())
    }
  }, [allDailyTasks])

  // Get filtered values based on current selections
  const filteredValues = useMemo(() => {
    let filteredDepartments = uniqueDepartments
    let filteredUsers = uniqueUsers
    let filteredCompanies = uniqueCompanies

    // Filter departments and users based on selected team
    if (localFilters.team) {
      filteredUsers = uniqueUsers.filter(user => 
        user.teams.includes(localFilters.team!)
      )
      
      const userIDs = new Set(filteredUsers.map(u => u.id))
      filteredDepartments = uniqueDepartments.filter(dept => {
        return allDailyTasks.some(member => {
          if (!userIDs.has(member.user.id)) return false
          return Object.values(member.submissions).some((submission: any) => 
            submission.tasks.some((task: any) => task.department === dept)
          )
        })
      })

      filteredCompanies = uniqueCompanies.filter(company => {
        return allDailyTasks.some(member => {
          if (!userIDs.has(member.user.id)) return false
          return Object.values(member.submissions).some((submission: any) => 
            submission.tasks.some((task: any) => task.company === company)
          )
        })
      })
    }

    // Filter users based on selected department
    if (localFilters.department) {
      filteredUsers = filteredUsers.filter(user => {
        return allDailyTasks.some(member => {
          if (member.user.id !== user.id) return false
          return Object.values(member.submissions).some((submission: any) => 
            submission.tasks.some((task: any) => task.department === localFilters.department)
          )
        })
      })
    }

    return {
      departments: filteredDepartments,
      users: filteredUsers,
      companies: filteredCompanies
    }
  }, [localFilters.team, localFilters.department, uniqueDepartments, uniqueUsers, uniqueCompanies, allDailyTasks])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  useEffect(() => {
    let count = 0
    if (localFilters.status) count++
    if (localFilters.userName) count++
    if (localFilters.startDate) count++
    if (localFilters.endDate) count++
    if (localFilters.department) count++
    if (localFilters.company) count++
    if (localFilters.team) count++
    setActiveFiltersCount(count)
  }, [localFilters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // When team changes, reset dependent filters
    if (name === "team") {
      setLocalFilters(prev => ({
        ...prev,
        team: value || undefined,
        department: undefined,
        userName: undefined
      }))
    } 
    // When department changes, reset user filter
    else if (name === "department") {
      setLocalFilters(prev => ({
        ...prev,
        department: value || undefined,
        userName: undefined
      }))
    } else {
      setLocalFilters(prev => ({ ...prev, [name]: value || undefined }))
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userName: undefined,
      department: undefined,
      company: undefined,
      team: undefined
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const clearSingleFilter = (filterName: keyof TaskReviewFilters) => {
    // When clearing team, also clear dependent filters
    if (filterName === "team") {
      setLocalFilters(prev => ({
        ...prev,
        team: undefined,
        department: undefined,
        userName: undefined
      }))
      onFilterChange({
        ...localFilters,
        team: undefined,
        department: undefined,
        userName: undefined
      })
    } 
    // When clearing department, also clear user filter
    else if (filterName === "department") {
      setLocalFilters(prev => ({
        ...prev,
        department: undefined,
        userName: undefined
      }))
      onFilterChange({
        ...localFilters,
        department: undefined,
        userName: undefined
      })
    } else {
      setLocalFilters(prev => ({ ...prev, [filterName]: undefined }))
      onFilterChange({ ...localFilters, [filterName]: undefined })
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">{activeFiltersCount} active</Badge>
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
          </div>
        </div>
        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {localFilters.team && (
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Users2 className="h-3 w-3 mr-1" />
                Team: {localFilters.team}
                <button
                  onClick={() => clearSingleFilter("team")}
                  className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.status && (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <CheckSquare className="h-3 w-3 mr-1" />
                Status: {localFilters.status}
                <button
                  onClick={() => clearSingleFilter("status")}
                  className="ml-1 p-0.5 hover:bg-blue-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.userName && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Users className="h-3 w-3 mr-1" />
                User: {localFilters.userName}
                <button
                  onClick={() => clearSingleFilter("userName")}
                  className="ml-1 p-0.5 hover:bg-purple-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.department && (
              <Badge className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Briefcase className="h-3 w-3 mr-1" />
                Department: {localFilters.department}
                <button
                  onClick={() => clearSingleFilter("department")}
                  className="ml-1 p-0.5 hover:bg-green-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {localFilters.company && (
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Building className="h-3 w-3 mr-1" />
                Company: {localFilters.company}
                <button
                  onClick={() => clearSingleFilter("company")}
                  className="ml-1 p-0.5 hover:bg-yellow-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(localFilters.startDate || localFilters.endDate) && (
              <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Calendar className="h-3 w-3 mr-1" />
                Date: {localFilters.startDate || "Any"} to {localFilters.endDate || "Any"}
                <button
                  onClick={() => {
                    clearSingleFilter("startDate")
                    clearSingleFilter("endDate")
                  }}
                  className="ml-1 p-0.5 hover:bg-red-100 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ height: "auto", opacity: 1 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  {uniqueTeams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

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
                  disabled={!localFilters.team}
                >
                  <option value="">
                    {localFilters.team ? "All Departments" : "Select team first"}
                  </option>
                  {filteredValues.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <select
                  id="userName"
                  name="userName"
                  value={localFilters.userName || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={!localFilters.team}
                >
                  <option value="">
                    {localFilters.team ? "All Members" : "Select team first"}
                  </option>
                  {filteredValues.users.map(user => (
                    <option key={user.id} value={user.username}>{user.username}</option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <select
                  id="company"
                  name="company"
                  value={localFilters.company || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">All Companies</option>
                  {filteredValues.companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

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
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
              >
                Reset All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-green border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
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

export default OverAllFilterSection