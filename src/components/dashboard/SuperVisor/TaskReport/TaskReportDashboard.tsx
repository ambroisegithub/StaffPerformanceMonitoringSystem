// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchTaskReport,
  fetchTeamMemberTaskCounts,
  selectTaskReport,
  selectLoading,
  selectError,
  selectMemberTaskCounts,
  selectMemberTaskCountsLoading,
  selectMemberTaskCountsError,
  setFilters,
} from "../../../../Redux/Slices/TaskReportSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import withSupervisorAuth from "../../../Auth/withSupervisorAuth"
import TaskReportFilters from "./TaskReportFilters"
import TaskReportSummary from "./TaskReportSummary"
import TeamTasksReport from "./TeamTasksReport"
import MemberTasksReport from "./MemberTasksReport"
import TeamMemberTaskCountsView from "./TeamMemberTaskCountsView"
import Loader from "../../../ui/Loader"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Card, CardContent } from "../../../ui/Card"
import { Alert, AlertDescription, AlertTitle } from "../../../ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "../../../ui/button"
import React from "react"

const TaskReportDashboard = () => {
  const dispatch = useAppDispatch()
  const { supervisor, dateRange, overallTotals, teams, filters } = useAppSelector(selectTaskReport)
  const loading = useAppSelector(selectLoading)
  const error = useAppSelector(selectError)

  // Add new state selectors for member task counts
  const memberTaskCounts = useAppSelector(selectMemberTaskCounts)
  const memberTaskCountsLoading = useAppSelector(selectMemberTaskCountsLoading)
  const memberTaskCountsError = useAppSelector(selectMemberTaskCountsError)

  const [supervisorId, setSupervisorId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  useEffect(() => {
    const id = getSupervisorId()
    if (id) {
      setSupervisorId(id)

      // Set default date range to current month if not already set
      if (!filters.startDate || !filters.endDate) {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        dispatch(
          setFilters({
            startDate: format(firstDayOfMonth, "yyyy-MM-dd"),
            endDate: format(lastDayOfMonth, "yyyy-MM-dd"),
          }),
        )
      }
    }
  }, [dispatch, filters])

  useEffect(() => {
    if (supervisorId) {
      dispatch(fetchTaskReport({ supervisorId, filters }))
      // Add dispatch for the new team member task counts
      dispatch(fetchTeamMemberTaskCounts({ supervisorId, filters }))
    }
  }, [dispatch, supervisorId, filters])

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters))

    // Reset selections when filters change
    setSelectedTeamId(null)
    setSelectedMemberId(null)
  }

  const handleRefresh = () => {
    if (supervisorId) {
      dispatch(fetchTaskReport({ supervisorId, filters }))
      // Add refresh for the new team member task counts
      dispatch(fetchTeamMemberTaskCounts({ supervisorId, filters }))
    }
  }

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId)
    setSelectedMemberId(null)
  }

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId)
  }

  const selectedTeam = selectedTeamId ? teams.find((team: any) => team.id.toString() === selectedTeamId) : null

  const selectedMember =
    selectedTeamId && selectedMemberId && selectedTeam
      ? selectedTeam.members.find((member: any) => member.id.toString() === selectedMemberId)
      : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Report Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive view of tasks across teams and members</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      <TaskReportFilters filters={filters} onFilterChange={handleFilterChange} teams={teams} />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !supervisor ? (
        <Loader />
      ) : supervisor && overallTotals ? (
        <>
          <TaskReportSummary supervisor={supervisor} dateRange={dateRange} overallTotals={overallTotals} />

          <Tabs defaultValue="teams" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teams">Teams Overview</TabsTrigger>
              <TabsTrigger value="details" disabled={!selectedTeamId}>
                {selectedMemberId ? "Member Details" : selectedTeamId ? "Team Details" : "Select a Team"}
              </TabsTrigger>
              <TabsTrigger value="member-counts">Member Task Counts</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="mt-6">
              <TeamTasksReport teams={teams} onTeamSelect={handleTeamSelect} selectedTeamId={selectedTeamId} />
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {selectedTeamId && selectedTeam ? (
                <MemberTasksReport
                  team={selectedTeam}
                  onMemberSelect={handleMemberSelect}
                  selectedMemberId={selectedMemberId}
                  selectedMember={selectedMember}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Please select a team to view details</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Add new tab content for member task counts */}
            <TabsContent value="member-counts" className="mt-6">
              <TeamMemberTaskCountsView
                data={memberTaskCounts}
                loading={memberTaskCountsLoading}
                error={memberTaskCountsError}
              />
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No data available. Please adjust your filters or try again later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default withSupervisorAuth(TaskReportDashboard)

