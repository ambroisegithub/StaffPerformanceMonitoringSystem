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
} from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import withSupervisorAuth from "../../../Auth/withSupervisorAuth"
import TaskList from "../Task/TaskList"
import TaskReviewModal from "../Task/TaskReviewModal"
import FilterSection from "../Task/FilterSection"
import Pagination from "../Task/Pagination"
import { format, subDays } from "date-fns"
import { useNavigate } from "react-router-dom"
import TaskReportComponent from "./TaskReportComponent"
import ChatButton from "../../../Chat/ChatButton"
import React from "react"

const TaskReviewDashboard = () => {
  const dispatch = useAppDispatch()
  const teamTasks = useAppSelector(selectTeamTasks)
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)
  const pagination = useAppSelector(selectPagination)
  const filters = useAppSelector(selectFilters)
  const user = useAppSelector((state) => state.login.user) // Get logged-in user
  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const id = getSupervisorId()
    if (id) {
      setSupervisorId(id)

      // Set default date range to last 30 days if not already set
      if (!filters.startDate || !filters.endDate) {
        const endDate = new Date()
        const startDate = subDays(endDate, 30)

        dispatch(
          setFilters({
            ...filters,
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
          }),
        )
      }
    }
  }, [dispatch, filters])

  useEffect(() => {
    if (supervisorId) {
      dispatch(
        fetchTeamTasks({
          supervisorId,
          page: pagination.current_page,
          filters,
        }),
      )
    }
  }, [dispatch, supervisorId, pagination.current_page, filters])

  const handlePageChange = (page: number) => {
    if (supervisorId) {
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

          {/* Add global chat button */}
          {user && user.organization && <ChatButton userId={user.id} organizationId={user.organization.id} />}
        </div>
      </div>

      {/* Task Report Component */}
      <div>{!loading && teamTasks && teamTasks.length > 0 && <TaskReportComponent teamTasks={teamTasks} />}</div>

      <FilterSection filters={filters} onFilterChange={handleFilterChange} />

      {error && (
        <div className="border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <TaskList teamTasks={teamTasks} loading={loading} onOpenReviewModal={handleOpenModal} filters={filters} />

      <Pagination
        currentPage={pagination.current_page}
        totalPages={pagination.total_pages}
        onPageChange={handlePageChange}
        totalItems={pagination.total_items}
      />

      <TaskReviewModal isOpen={isModalOpen} onClose={handleCloseModal} supervisorId={supervisorId} />
    </div>
  )
}

export default withSupervisorAuth(TaskReviewDashboard)
