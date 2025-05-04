// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchTeamTasks,
  selectTeamTasks,
  selectLoading,
  selectError,
  selectPagination,
  selectFilters,
  setFilters,
  resetFilters,
  fetchSupervisorTeamMembers
} from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import withSupervisorAuth from "../../../Auth/withSupervisorAuth"
import TaskList from "../Task/TaskList"
import TaskReviewModal from "../Task/TaskReviewModal"
import FilterSection from "../Task/FilterSection"
import Pagination from "../Task/Pagination"
import { useNavigate } from "react-router-dom"
import TaskReportComponent from "./TaskReportComponent"
import React from "react"
import TaskWarningSection from "../Task/TaskWarningSection"

const TaskReviewDashboard = () => {
  const dispatch = useAppDispatch()
  const teamTasks = useAppSelector(selectTeamTasks)
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)
  const pagination = useAppSelector(selectPagination)
  const filters = useAppSelector(selectFilters)
  const user = useAppSelector((state) => state.login.user)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const id = getSupervisorId()
    if (id) {
      setSupervisorId(id)
      // Fetch team members immediately so they're available in filters
      dispatch(fetchSupervisorTeamMembers(id))
    }
  }, [dispatch])

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.userName ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  )

  useEffect(() => {
    // Only fetch tasks when filters are applied
    if (supervisorId && hasActiveFilters) {
      dispatch(
        fetchTeamTasks({
          supervisorId,
          page: pagination.current_page,
          filters,
        }),
      )
    }
  }, [dispatch, supervisorId, pagination.current_page, filters, hasActiveFilters])

  const handlePageChange = (page: number) => {
    if (supervisorId && hasActiveFilters) {
      dispatch(
        fetchTeamTasks({
          supervisorId,
          page,
          filters,
        }),
      )
    }
  }

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))
  }

  const handleClearFilters = () => {
    dispatch(resetFilters())
  }

  const handleOpenFilters = () => {
    setShowFilters(true)
    // Scroll to filter section
    setTimeout(() => {
      const filterSection = document.querySelector("[data-filter-section]")
      if (filterSection) {
        filterSection.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Task Review Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and manage tasks submitted by your team members</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold text-gray-600">{user?.username}'s Team</p>
        </div>
      </div>

      {/* Filter Section with data attribute for scrolling */}
      <div data-filter-section>
        <FilterSection filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {error && (
        <div className="border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Conditional rendering based on filter state */}
      {!hasActiveFilters ? (
        // Show warning section when no filters are applied
        <div className="space-y-6">
          <TaskWarningSection
            hasActiveFilters={false}
            totalTaskCount={0}
            filterSummary={{
              searchTerm: "",
              userNameFilter: undefined,
              statusFilter: undefined,
              dateRangeFilter: undefined,
            }}
            onClearFilters={handleClearFilters}
            onOpenFilters={handleOpenFilters}
          />
        </div>
      ) : (
        // Show task list and related components only when filters are applied
        <div className="space-y-6">
          {/* Task Report Component - Only show when there are tasks */}
          {!loading && teamTasks && teamTasks.length > 0 && <TaskReportComponent teamTasks={teamTasks} />}

          <TaskList
            teamTasks={teamTasks}
            loading={loading}
            onOpenReviewModal={handleOpenModal}
            filters={filters}
            onClearFilters={handleClearFilters}
            onOpenFilters={handleOpenFilters}
          />

          {/* Only show pagination when there are filtered results */}
          {teamTasks.length > 0 && (
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
              totalItems={pagination.total_items}
            />
          )}
        </div>
      )}

      <TaskReviewModal isOpen={isModalOpen} onClose={handleCloseModal} supervisorId={supervisorId} />
    </div>
  )
}

export default withSupervisorAuth(TaskReviewDashboard)