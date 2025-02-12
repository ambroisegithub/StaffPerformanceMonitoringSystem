import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { RootState } from "../store"

export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  supervisoryLevel?: {
    id: number
    level: string
  }
  organization?: {
    id: number
    name: string
  }
}

export interface Team {
  id: number
  name: string
  description: string
  supervisorId: number
  isActive: boolean
  created_at: string
  updated_at: string
  supervisor?: User
  members: User[]
  organization?: {
    id: number
    name: string
  }
}

export interface SupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
  organization?: {
    id: number
    name: string
  }
}


interface TeamState {
  teams: Team[]
  users: User[]
  supervisoryLevels: SupervisoryLevel[]
  filteredUsers: User[]
  eligibleSupervisors: User[]
  selectedSupervisor: User | null
  selectedMembers: number[]
  loading: boolean
  error: string | null
  success: boolean
  currentStep: number
  formData: {
    name: string
    description: string
    supervisorId: number | null
    memberIds: number[]
    organizationId?: number
  }
}
// Helper function to determine if a level is lower than another
export const isLowerLevel = (memberLevel: string, supervisorLevel: string): boolean => {
  // Special case for "Employee" level (lowest)
  if (memberLevel === "Employee") return true
  if (supervisorLevel === "Employee") return false

  // Special case for "Overall" level (highest)
  if (supervisorLevel === "Overall") return true
  if (memberLevel === "Overall") return false

  // For "Level X" format, extract and compare the numbers
  const memberMatch = memberLevel.match(/Level (\d+)/i)
  const supervisorMatch = supervisorLevel.match(/Level (\d+)/i)

  if (memberMatch && supervisorMatch) {
    const memberNum = Number.parseInt(memberMatch[1], 10)
    const supervisorNum = Number.parseInt(supervisorMatch[1], 10)
    return memberNum < supervisorNum
  }

  // Default comparison as string
  return memberLevel < supervisorLevel
}

export const fetchAllUsers = createAsyncThunk(
  "team/fetchAllUsers", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/${organizationId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch users")
    }
  }
)

export const fetchSupervisoryLevels = createAsyncThunk(
  "team/fetchSupervisoryLevels",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/supervisory-levels`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisory levels")
    }
  }
)

export const createTeam = createAsyncThunk(
  "team/createTeam",
  async (
    teamData: { 
      name: string
      description: string
      supervisorId: number
      memberIds: number[]
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/teams`, 
        { ...teamData, organization_id: organizationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create team")
    }
  }
)

export const fetchTeams = createAsyncThunk(
  "team/fetchTeams", 
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/teams`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch teams")
    }
  }
)


// Initial state
const initialState: TeamState = {
  teams: [],
  users: [],
  supervisoryLevels: [],
  filteredUsers: [],
  eligibleSupervisors: [],
  selectedSupervisor: null,
  selectedMembers: [],
  loading: false,
  error: null,
  success: false,
  currentStep: 1,
  formData: {
    name: "",
    description: "",
    supervisorId: null,
    memberIds: [],
  },
}

// Slice
const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    updateFormData: (state, action: PayloadAction<Partial<TeamState["formData"]>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    selectSupervisor: (state, action: PayloadAction<number>) => {
      state.formData.supervisorId = action.payload
      state.selectedSupervisor = state.users.find((user) => user.id === action.payload) || null

      // Filter eligible members based on selected supervisor
      if (state.selectedSupervisor) {
        const supervisor = state.selectedSupervisor
        const supervisorLevel = supervisor.supervisoryLevel?.level || "Employee"

        if (supervisor.role === "admin") {
          // Admin can add anyone
          state.filteredUsers = state.users
        } else if (supervisorLevel === "Overall") {
          // Overall supervisors can add all non-admin users
          state.filteredUsers = state.users.filter((user) => user.role !== "admin")
        } else {
          // Other supervisors can only add users with lower levels
          state.filteredUsers = state.users.filter((user) => {
            const memberLevel = user.supervisoryLevel?.level || "Employee"
            return isLowerLevel(memberLevel, supervisorLevel)
          })
        }
      } else {
        state.filteredUsers = []
      }

      // Reset selected members when supervisor changes
      state.formData.memberIds = []
      state.selectedMembers = []
    },
    toggleMember: (state, action: PayloadAction<number>) => {
      const memberId = action.payload
      if (state.selectedMembers.includes(memberId)) {
        state.selectedMembers = state.selectedMembers.filter((id) => id !== memberId)
        state.formData.memberIds = state.formData.memberIds.filter((id) => id !== memberId)
      } else {
        state.selectedMembers.push(memberId)
        state.formData.memberIds.push(memberId)
      }
    },
    resetForm: (state) => {
      state.formData = initialState.formData
      state.selectedSupervisor = null
      state.selectedMembers = []
      state.currentStep = 1
      state.success = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload

        // Filter eligible supervisors (non-employee roles)
        state.eligibleSupervisors = state.users.filter(
          (user) => user.role === "supervisor" || user.role === "admin" || user.role === "overall",
        )
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch supervisory levels
      .addCase(fetchSupervisoryLevels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSupervisoryLevels.fulfilled, (state, action) => {
        state.loading = false
        state.supervisoryLevels = action.payload
      })
      .addCase(fetchSupervisoryLevels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        if (action.payload.data.team) {
          state.teams.push(action.payload.data.team)
        }
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.success = false
      })

      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false
        state.teams = action.payload
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentStep, updateFormData, selectSupervisor, toggleMember, resetForm, clearError } =
  teamSlice.actions

export default teamSlice.reducer

