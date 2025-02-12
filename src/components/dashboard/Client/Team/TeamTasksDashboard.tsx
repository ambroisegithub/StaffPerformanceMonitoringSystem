// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchAdminTeamTasks,
  selectAdminTeamTasks,
  selectAdminTeamTasksLoading,
  selectAdminTeamTasksError,
  selectPagination,
  selectFilters,
  setFilters,
  selectSelectedTask,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { format, subDays } from "date-fns"
import withAdminAuth from "../../../Auth/withAdminAuth"
import TeamList from "./TeamList"
import TeamFilterSection from "./TeamFilterSection"
import TeamTaskReviewModal from "./TeamTaskReviewModal"
import { Card, CardContent } from "../../../ui/Card"
import { AlertCircle, BarChart2, ListIcon } from "lucide-react"
import Pagination from "../Position/Pagination"
import TeamTaskReportComponent from "./TaskReportComponent"
import { Button } from "../../../ui/button"
import React from "react"

const TeamTasksDashboard = () => {
  const dispatch = useAppDispatch()
  const adminTeamTasks = useAppSelector(selectAdminTeamTasks)
  const loading = useAppSelector(selectAdminTeamTasksLoading)
  const error = useAppSelector(selectAdminTeamTasksError)
  const pagination = useAppSelector(selectPagination)
  const filters = useAppSelector(selectFilters)
  const selectedTask = useAppSelector(selectSelectedTask)
  const user = useAppSelector((state: { login: { user: any } }) => state.login.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "report">("list")

  useEffect(() => {
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
  }, [dispatch, filters])

  useEffect(() => {
    if (user?.id) {
      dispatch(
        fetchAdminTeamTasks({
          userId: user.id,
          page: pagination.current_page,
          filters,
        }),
      )
    }
  }, [dispatch, user?.id, pagination.current_page, filters])

  const handlePageChange = (page: number) => {
    if (user?.id) {
      dispatch(
        fetchAdminTeamTasks({
          userId: user.id,
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Team Tasks Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and manage tasks across all teams in the organization</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <ListIcon className="h-4 w-4" />
              List View
            </Button>
            <Button
              variant={viewMode === "report" ? "default" : "outline"}
              onClick={() => setViewMode("report")}
              className="flex items-center gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Report View
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Administrator: {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      <TeamFilterSection filters={filters} onFilterChange={handleFilterChange} teamTasks={adminTeamTasks} />

      {error && (
        <Card className="mb-6 border-red">
          <CardContent className="p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red">Error</h3>
              <p className="text-sm text-red">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "list" ? (
        <>
          <TeamList teamTasks={adminTeamTasks} loading={loading} onOpenReviewModal={handleOpenModal} />

          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
            totalItems={pagination.total_items}
          />
        </>
      ) : (
        <TeamTaskReportComponent teamTasks={adminTeamTasks} />
      )}

      <TeamTaskReviewModal isOpen={isModalOpen} onClose={handleCloseModal} adminId={user?.id || null} />
    </div>
  )
}

export default withAdminAuth(TeamTasksDashboard)

