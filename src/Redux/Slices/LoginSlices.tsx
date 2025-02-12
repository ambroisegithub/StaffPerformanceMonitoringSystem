import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import type { NavigateFunction } from "react-router-dom"

interface User {
  organization: any
  id: number
  username: string
  email: string
  role: string
  isFirstLogin: boolean
  company: {
    id: number
    name: string
  }
  department: {
    id: number
    name: string
  }
}

interface LoginCredentials {
  username: string
  password: string
  navigate: NavigateFunction
}

interface LoginResponse {
  message: string
  data: {
    user: User
  }
  token: string
}

interface LoginState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isFirstLogin: boolean
}

const initialState: LoginState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
  isFirstLogin: false,
}


export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  "login/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>(`${import.meta.env.VITE_BASE_URL}/user/login`, credentials)
      showSuccessToast(response.data.message)
      const { user } = response.data.data
      const { token } = response.data
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)

      if (user.isFirstLogin) {
        localStorage.setItem("firstLoginEmail", user.email) // Store email for first login
        credentials.navigate("/reset-password")
      } else {
        credentials.navigate(getRedirectPath(user.role))
      }

      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed"
      showErrorToast(errorMessage)
      if (errorMessage === "First login detected. Please reset your password.") {
        credentials.navigate("/forgot-password")
      }
      return rejectWithValue(errorMessage)
    }
  },
)

const getRedirectPath = (role: string) => {
  switch (role.toLowerCase()) {
    case "overall":
      return "/admin"
    case "supervisor":
      return "/super-visor"
    case "employee":
      return "/employeeDashboard"
    case "system_leader":
      return "/system-leader"
    default:
      return "/"
  }
}

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isFirstLogin = false
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    },
    clearErrors: (state) => {
      state.error = null
    },
    restoreAuth: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")
      if (token && user) {
        state.token = token
        state.user = JSON.parse(user)
        state.isAuthenticated = true
        state.isFirstLogin = state.user?.isFirstLogin || false
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.data.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isFirstLogin = action.payload.data.user.isFirstLogin
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.isFirstLogin = false
      })
  },
})

export const { logout, clearErrors, restoreAuth } = loginSlice.actions
export default loginSlice.reducer

