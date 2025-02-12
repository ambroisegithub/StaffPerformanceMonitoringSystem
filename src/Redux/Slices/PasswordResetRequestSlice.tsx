import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showSuccessToast, showErrorToast } from "../../utilis/ToastProps"

interface PasswordResetRequestState {
  loading: boolean
  error: string | null
  message: string | null
}

const BASE_URL = import.meta.env.VITE_BASE_URL

export const requestPasswordReset = createAsyncThunk(
  "passwordReset/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/user/forgot-password`, { email })

      localStorage.setItem("resetEmail", email)

      showSuccessToast(response.data.message)
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Password reset request failed"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const passwordResetRequestSlice = createSlice({
  name: "passwordResetRequest",
  initialState: {
    loading: false,
    error: null,
    message: null,
  } as PasswordResetRequestState,
  reducers: {
    clearState: (state) => {
      state.loading = false
      state.error = null
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload.message
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearState } = passwordResetRequestSlice.actions
export default passwordResetRequestSlice.reducer

