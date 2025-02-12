import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast } from "../../utilis/ToastProps"
import { RootState } from "../store"

interface Department {
  id: number
  name: string
  group?: {
    id: number
    name: string
    tin: string | null
  }
  company?: {
    id: number
    name: string
    tin: string
    group: {
      id: number
      name: string
      tin: string | null
    }
  }
}

interface SupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface Subsidiary {
  id: number
  name: string
  tin: string
  group: {
    id: number
    name: string
    tin: string | null
  }
  departments: Department[]
}

interface HoldingCompany {
  id: number
  groupName: string
  tinNumber: string | null
  departments: Department[]
  subsidiaries: Subsidiary[]
}

interface Position {
  id: number
  title: string
  description: string
  isActive: boolean
  created_at: string
  updated_at: string
  company: {
    id: number
    name: string
    tin: string
  } | null
  department: {
    id: number
    name: string
  } | null
}

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  // Add other user properties as needed
}

interface RegisterData {
  lastName: string
  firstName: string
  telephone: string
  email: string
  group_id: number
  company_id?: number
  department_id: number
  supervisoryLevelId: number
  position_id: number
}

interface RegisterState {
  holdingCompanies: HoldingCompany[]
  supervisoryLevels: SupervisoryLevel[]
  positions: Position[]
  user: User | null
  loading: boolean
  error: string | null
  success: boolean
}

const initialState: RegisterState = {
  holdingCompanies: [],
  supervisoryLevels: [],
  positions: [],
  user: null,
  loading: false,
  error: null,
  success: false,
}

// Async thunks
export const fetchHoldingCompanies = createAsyncThunk(
  "register/fetchHoldingCompanies",
  async (_, { rejectWithValue, getState }) => {
    try {

      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id;
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/holding-companies/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.holdingCompanies
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch holding companies")
    }
  },
)

const API_URL = `${import.meta.env.VITE_BASE_URL}/v1/position`

export const fetchPositions = createAsyncThunk(
  "positions/fetchPositions",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const response = await axios.get(`${API_URL}/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch positions";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  "register/registerUser",
  async (userData: RegisterData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }
      const token = localStorage.getItem("token") 
      const processedData = {
        ...userData,
        group_id: Number(userData.group_id),
        company_id: userData.company_id ? Number(userData.company_id) : undefined,
        department_id: Number(userData.department_id),
        supervisoryLevelId: Number(userData.supervisoryLevelId),
        position_id: userData.position_id ? Number(userData.position_id) : undefined,
        organization_id: organizationId, 
      }
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/register`, processedData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      return response.data.data.user
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to register user"
      showErrorToast(errorMessage)
      return rejectWithValue({ message: errorMessage })
    }
  },
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

// Create slice
const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch holding companies cases
      .addCase(fetchHoldingCompanies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHoldingCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.holdingCompanies = action.payload
      })
      .addCase(fetchHoldingCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch positions cases
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.loading = false
        state.positions = action.payload
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Register user cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.success = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        // Handle the error object properly
        if (typeof action.payload === "object" && action.payload !== null) {
          const errorPayload = action.payload as { message: string }
          state.error = errorPayload.message
        } else {
          state.error = (action.payload as string) || "An error occurred"
        }
        state.success = false
      })
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
  },
})

export const { clearError, resetSuccess } = registerSlice.actions
export default registerSlice.reducer

