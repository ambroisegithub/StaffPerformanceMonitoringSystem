import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import type { RootState } from "../store"

// Types for the API response
export interface TaskReportState {
  supervisor: {
    id: number
    name: string
    level: string
  } | null
  dateRange: {
    startDate: string
    endDate: string
    year: number
    month: number
    monthName: string
  } | null
  overallTotals: {
    teams: number
    members: number
    tasksCreated: number
    dailyTasksSubmitted: number
    totalTasksInDailyTasks: number
    taskStatusCounts: {
      pending: number
      in_progress: number
      completed: number
      delayed: number
    }
    reviewStatusCounts: {
      pending: number
      approved: number
      rejected: number
    }
  } | null
  teams: Array<{
    id: number
    name: string
    description: string
    memberCount: number
    totals: {
      tasksCreated: number
      dailyTasksSubmitted: number
      totalTasksInDailyTasks: number
      taskStatusCounts: {
        pending: number
        in_progress: number
        completed: number
        delayed: number
      }
      reviewStatusCounts: {
        pending: number
        approved: number
        rejected: number
      }
    }
    members: Array<{
      id: number
      name: string
      username: string
      email: string
      tasksCreated: number
      dailyTasksSubmitted: number
      totalTasksInDailyTasks: number
      taskStatusCounts: {
        pending: number
        in_progress: number
        completed: number
        delayed: number
      }
      reviewStatusCounts: {
        pending: number
        approved: number
        rejected: number
      }
      dailyTasks: Array<{
        id: number
        date: string
        submitted: boolean
        taskCount: number
        tasks: Array<{
          id: number
          title: string
          status: string
          review_status: string
          reviewed: boolean
          company: string
          related_project: string
        }>
      }>
    }>
  }>
  loading: boolean
  error: string | null
  filters: {
    teamId?: string
    userId?: string
    year?: string
    month?: string
    startDate?: string
    endDate?: string
  }
  memberTaskCounts: {
    supervisor: {
      id: number
      name: string
      level: string
    } | null
    dateRange: {
      startDate: string
      endDate: string
      month: number
      year: number
    } | null
    teams: Array<{
      id: number
      name: string
      description: string
      memberCount: number
      members: Array<{
        id: number
        name: string
        username: string
        tasksCreated: number
        dailyTasksSubmitted: number
        totalTasksInDailyTasks: number
        taskStatusCounts: {
          pending: number
          in_progress: number
          completed: number
          delayed: number
        }
        reviewStatusCounts: {
          pending: number
          approved: number
          rejected: number
        }
        dailyTasks: Array<{
          id: number
          date: string
          submitted: boolean
          taskCount: number
          submittedAt: string
        }>
      }>
    }>
  } | null
  memberTaskCountsLoading: boolean
  memberTaskCountsError: string | null
}

const initialState: TaskReportState = {
  supervisor: null,
  dateRange: null,
  overallTotals: null,
  teams: [],
  loading: false,
  error: null,
  filters: {
    teamId: undefined,
    userId: undefined,
    year: undefined,
    month: undefined,
    startDate: undefined,
    endDate: undefined,
  },
  memberTaskCounts: null,
  memberTaskCountsLoading: false,
  memberTaskCountsError: null,
}

// Async thunk for fetching task report data
export const fetchTaskReport = createAsyncThunk(
  "taskReport/fetchTaskReport",
  async (
    {
      supervisorId,
      filters,
    }: {
      supervisorId: number
      filters?: {
        teamId?: string
        userId?: string
        year?: string
        month?: string
        startDate?: string
        endDate?: string
      }
    },
    { rejectWithValue },
  ) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (filters) {
        if (filters.teamId) queryParams.append("teamId", filters.teamId)
        if (filters.userId) queryParams.append("userId", filters.userId)
        if (filters.year) queryParams.append("year", filters.year)
        if (filters.month) queryParams.append("month", filters.month)
        if (filters.startDate) queryParams.append("startDate", filters.startDate)
        if (filters.endDate) queryParams.append("endDate", filters.endDate)
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/supervisor/${supervisorId}/user-tasks${queryString}`,
      )

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch task report")
    }
  },
)


export const fetchTeamMemberTaskCounts = createAsyncThunk(
  "taskReport/fetchTeamMemberTaskCounts",
  async (
    {
      supervisorId,
      filters,
    }: {
      supervisorId: number
      filters?: {
        teamId?: string
        userId?: string
        month?: string
        year?: string
      }
    },
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        if (filters.teamId) queryParams.append("teamId", filters.teamId)
        if (filters.userId) queryParams.append("userId", filters.userId)
        if (filters.year) queryParams.append("year", filters.year)
        if (filters.month) queryParams.append("month", filters.month)
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/supervisor/${supervisorId}/team-member-task-counts${queryString}`,
      )

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team member task counts")
    }
  },
)

const taskReportSlice = createSlice({
  name: "taskReport",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskReport.fulfilled, (state, action) => {
        state.loading = false
        state.supervisor = action.payload.supervisor
        state.dateRange = action.payload.dateRange
        state.overallTotals = action.payload.overallTotals
        state.teams = action.payload.teams
      })
      .addCase(fetchTaskReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchTeamMemberTaskCounts.pending, (state) => {
        state.memberTaskCountsLoading = true
        state.memberTaskCountsError = null
      })
      .addCase(fetchTeamMemberTaskCounts.fulfilled, (state, action) => {
        state.memberTaskCountsLoading = false
        state.memberTaskCounts = action.payload
      })
      .addCase(fetchTeamMemberTaskCounts.rejected, (state, action) => {
        state.memberTaskCountsLoading = false
        state.memberTaskCountsError = action.payload as string
      })
  },
})

export const { setFilters, clearFilters } = taskReportSlice.actions

// Selectors
export const selectTaskReport = (state: RootState) => state.taskReport
export const selectSupervisor = (state: RootState) => state.taskReport.supervisor
export const selectDateRange = (state: RootState) => state.taskReport.dateRange
export const selectOverallTotals = (state: RootState) => state.taskReport.overallTotals
export const selectTeams = (state: RootState) => state.taskReport.teams
export const selectLoading = (state: RootState) => state.taskReport.loading
export const selectError = (state: RootState) => state.taskReport.error
export const selectFilters = (state: RootState) => state.taskReport.filters
export const selectMemberTaskCounts = (state: RootState) => state.taskReport.memberTaskCounts
export const selectMemberTaskCountsLoading = (state: RootState) => state.taskReport.memberTaskCountsLoading
export const selectMemberTaskCountsError = (state: RootState) => state.taskReport.memberTaskCountsError
export default taskReportSlice.reducer

