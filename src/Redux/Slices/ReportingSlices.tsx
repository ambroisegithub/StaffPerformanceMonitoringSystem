import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { getStartDateFromTimeRange } from "../../components/dashboard/SuperVisor/utils/dateUtils"

// Define types for our state
interface ReportingState {
  dashboardData: any | null
  teamPerformance: any[]
  taskDistribution: any | null
  memberPerformance: any | null
  selectedTeam: string
  selectedMember: string
  timeRange: string
  loading: {
    dashboard: boolean
    teams: boolean
    distribution: boolean
    member: boolean
  }
  error: string | null

}


// Initial state
const initialState: ReportingState = {
  dashboardData: null,
  teamPerformance: [],
  taskDistribution: null,
  memberPerformance: null,
  selectedTeam: "",
  selectedMember: "",
  timeRange: "30days",
  loading: {
    dashboard: false,
    teams: false,
    distribution: false,
    member: false,
  },
  error: null,

}

// Async thunks for API calls
export const fetchDashboardData = createAsyncThunk(
  "reporting/fetchDashboardData",
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/supervisor/${userId}/dashboard`)
      return response.data.data
    } catch (error) {
      return rejectWithValue("Failed to fetch dashboard data")
    }
  },
)

export const fetchTeamPerformance = createAsyncThunk(
  "reporting/fetchTeamPerformance",
  async ({ userId, timeRange }: { userId: number; timeRange: string }, { rejectWithValue }) => {
    try {
      const startDate = getStartDateFromTimeRange(timeRange)
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/supervisor/${userId}/teams/performance`, {
        params: { startDate },
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue("Failed to fetch team performance")
    }
  },
)



export const fetchMemberPerformance = createAsyncThunk(
  "reporting/fetchMemberPerformance",
  async ({ memberId, timeRange }: { memberId: string; timeRange: string }, { rejectWithValue }) => {
    try {
      const startDate = getStartDateFromTimeRange(timeRange)
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/member/${memberId}/performance`, {
        params: { startDate },
      })
      return response.data.data
    } catch (error) {
      return rejectWithValue("Failed to fetch member performance")
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

// Create the slice
const reportingSlice = createSlice({
  name: "reporting",
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<string>) => {
      state.timeRange = action.payload
    },
    setSelectedTeam: (state, action: PayloadAction<string>) => {
      state.selectedTeam = action.payload
      // Reset selected member when team changes
      state.selectedMember = ""
      state.memberPerformance = null
    },
    setSelectedMember: (state, action: PayloadAction<string>) => {
      state.selectedMember = action.payload
    },
    resetMemberPerformance: (state) => {
      state.memberPerformance = null
    },
  },
  extraReducers: (builder) => {
    // Dashboard data
    builder.addCase(fetchDashboardData.pending, (state) => {
      state.loading.dashboard = true
      state.error = null
    })
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      state.loading.dashboard = false
      state.dashboardData = action.payload
    })
    builder.addCase(fetchDashboardData.rejected, (state, action) => {
      state.loading.dashboard = false
      state.error = action.payload as string
    })

    // Team performance
    builder.addCase(fetchTeamPerformance.pending, (state) => {
      state.loading.teams = true
      state.error = null
    })
    builder.addCase(fetchTeamPerformance.fulfilled, (state, action) => {
      state.loading.teams = false
      state.teamPerformance = action.payload
      // Set default selected team if available
      if (action.payload.length > 0 && !state.selectedTeam) {
        state.selectedTeam = action.payload[0].id.toString()
      }
    })
    builder.addCase(fetchTeamPerformance.rejected, (state, action) => {
      state.loading.teams = false
      state.error = action.payload as string
    })

    // Task distribution


    // Member performance
    builder.addCase(fetchMemberPerformance.pending, (state) => {
      state.loading.member = true
      state.error = null
    })
    builder.addCase(fetchMemberPerformance.fulfilled, (state, action) => {
      state.loading.member = false
      state.memberPerformance = action.payload
    })
    builder.addCase(fetchMemberPerformance.rejected, (state, action) => {
      state.loading.member = false
      state.error = action.payload as string
    })
  },
})

export const { setTimeRange, setSelectedTeam, setSelectedMember, resetMemberPerformance } = reportingSlice.actions
export default reportingSlice.reducer

