import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast } from "../../utilis/ToastProps"
import type { RootState } from "../store"

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  telephone: string
  role: string
  company?: {
    id: number
    name: string
  }
  department?: {
    id: number
    name: string
  }
  position?: {
    id: number
    title: string
  }
  supervisoryLevelObj?: {
    id: number
    level: string
  }
}

interface UpdateUserData {
  firstName?: string
  lastName?: string
  email?: string
  telephone?: string
  supervisoryLevelId?: number
  company_id?: number
  department_id?: number
  position_id?: number
}

interface AuthState {
  currentUser: User | null
  updateLoading: boolean
  updateError: string | null
  updateSuccess: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  currentUser: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: false,
  loading: false,
  error: null,
}

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ userId, userData }: { userId: number; userData: UpdateUserData }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id

      if (!organizationId) {
        throw new Error("Organization ID is missing")
      }

      const token = localStorage.getItem("token")

      // Process the data to handle placeholder values
      const processedData = { ...userData }

      // Convert placeholder values to undefined/null
      if (processedData.company_id === -1) {
        delete processedData.company_id
      }
      if (processedData.department_id === -1) {
        delete processedData.department_id
      }
      if (processedData.position_id === -1) {
        delete processedData.position_id
      }
      if (processedData.supervisoryLevelId === -1) {
        delete processedData.supervisoryLevelId
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/users/${userId}`,
        {
          ...processedData,
          organization_id: organizationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      return response.data.data.user
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update user"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.updateError = null
    },
    clearSuccess: (state) => {
      state.updateSuccess = false
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
        state.updateSuccess = false
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false
        state.currentUser = action.payload
        state.updateSuccess = true
        state.updateError = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload as string
        state.updateSuccess = false
      })
  },
})

export const { clearError, clearSuccess, setCurrentUser } = authSlice.actions
export default authSlice.reducer
