"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Calendar, Users, CheckSquare } from "lucide-react"
import type { TaskReviewFilters } from "../../../../Redux/Slices/TaskReviewSlice"
import { useAppSelector, useAppDispatch } from "../../../../Redux/hooks"
import { 
  selectTeamTasks, 
  selectSupervisorTeamData,
  fetchTeamTasks 
} from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import { Badge } from "../../../ui/Badge"

interface FilterSectionProps {
  filters: TaskReviewFilters
  onFilterChange: (filters: TaskReviewFilters) => void
}

const FilterSection: React.FC<FilterSectionProps> = ({ filters, onFilterChange }) => {
  const dispatch = useAppDispatch()
  const [localFilters, setLocalFilters] = useState<TaskReviewFilters>(filters)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [teamMembers, setTeamMembers] = useState<Array<{id: number, username: string, level: string}>>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  
  const teamTasks = useAppSelector(selectTeamTasks)
  const supervisorTeamData = useAppSelector(selectSupervisorTeamData)

  // Fetch team members directly using fetchTeamTasks
  useEffect(() => {
    const loadTeamMembers = async () => {
      const supervisorId = getSupervisorId()
      if (!supervisorId) return

      setLoadingMembers(true)
      try {
        // Fetch team tasks to get team members directly
        const result = await dispatch(fetchTeamTasks({
          supervisorId,
          page: 1,
          limit: 100, // Get more items to ensure we get all team members
          filters: {} // No filters to get all team members
        })).unwrap()

        // Extract unique users from the fetched data
        if (result.data && result.data.length > 0) {
          const users = result.data.map((task: any) => ({
            id: task.user.id,
            username: task.user.username,
            level: task.user.level,
          }))
          const uniqueUsers = Array.from(
            new Map(users.map((user: any) => [user.id, user])).values()
          ) as Array<{ id: number; username: string; level: string }>
          setTeamMembers(uniqueUsers)
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error)
        // Fallback to existing data if fetch fails
        if (supervisorTeamData && supervisorTeamData.members) {
          const fallbackUsers = supervisorTeamData.members.map(member => ({
            id: member.id,
            username: member.username,
            level: member.level
          }))
          setTeamMembers(fallbackUsers)
        }
      } finally {
        setLoadingMembers(false)
      }
    }

    loadTeamMembers()
  }, [dispatch])

  // Alternative approach: Extract unique users from existing teamTasks or supervisorTeamData as fallback
  const uniqueUsers = useMemo(() => {
    // If we have fetched team members directly, use those
    if (teamMembers.length > 0) {
      return teamMembers
    }

    // Fallback: Try to get from teamTasks if available
    if (teamTasks && teamTasks.length > 0) {
      const users = teamTasks.map((task) => ({
        id: task.user.id,
        username: task.user.username,
        level: task.user.level,
      }))
      return Array.from(new Map(users.map((user) => [user.id, user])).values())
    }
    
    // Final fallback: Get from supervisorTeamData if teamTasks is empty
    if (supervisorTeamData && supervisorTeamData.members && supervisorTeamData.members.length > 0) {
      return supervisorTeamData.members.map(member => ({
        id: member.id,
        username: member.username,
        level: member.level
      }))
    }

    return []
  }, [teamMembers, teamTasks, supervisorTeamData])

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

    setActiveFiltersCount(count)
  }, [localFilters])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
    if (window.innerWidth < 768) {
      setIsExpanded(false)
    }
  }

  const handleResetFilters = () => {
    const resetFilters = {
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      userName: undefined,
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const clearSingleFilter = (filterName: keyof TaskReviewFilters) => {
    setLocalFilters((prev) => ({ ...prev, [filterName]: undefined }))
    const updatedFilters = { ...localFilters, [filterName]: undefined }
    onFilterChange(updatedFilters)
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
              <Badge className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1 pl-2 pr-1 py-1">
                <Calendar className="h-3 w-3 mr-1" />
                Date Range: {localFilters.startDate || "Any"} to {localFilters.endDate || "Any"}
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
              <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member
                </label>
                <select
                  id="userName"
                  name="userName"
                  value={localFilters.userName || ""}
                  onChange={handleInputChange}
                  disabled={loadingMembers}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                >
                  <option value="">
                    {loadingMembers ? "Loading team members..." : "All Team Members"}
                  </option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.username}>
                      {user.username}
                    </option>
                  ))}
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

export default FilterSection