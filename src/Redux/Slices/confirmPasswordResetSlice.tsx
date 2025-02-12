import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showSuccessToast, showErrorToast } from "../../utilis/ToastProps"

interface ConfirmPasswordResetState {
  loading: boolean
  error: string | null
  message: string | null
  showSuccessModal: boolean
}

const BASE_URL = import.meta.env.VITE_BASE_URL

export const resetPassword = createAsyncThunk(
  "passwordReset/resetPassword",
  async (passwordData: { newPassword: string; confirmPassword: string }, { rejectWithValue }) => {
    try {
      const email = localStorage.getItem("resetEmail")
      const resetToken = localStorage.getItem("resetToken")

      if (!email || !resetToken) {
        throw new Error("Reset information is missing. Please restart the reset process.")
      }

      const response = await axios.post(`${BASE_URL}/user/reset-password`, {
        email,
        resetToken,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })

      localStorage.removeItem("resetEmail")
      localStorage.removeItem("resetToken")

      showSuccessToast(response.data.message)
      return { message: response.data.message }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Password reset failed"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const confirmPasswordResetSlice = createSlice({
  name: "confirmPasswordReset",
  initialState: {
    loading: false,
    error: null,
    message: null,
    showSuccessModal: false,
  } as ConfirmPasswordResetState,
  reducers: {
    clearState: (state) => {
      state.loading = false
      state.error = null
      state.message = null
      state.showSuccessModal = false
    },
    closeSuccessModal: (state) => {
      state.showSuccessModal = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload.message
        state.showSuccessModal = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearState, closeSuccessModal } = confirmPasswordResetSlice.actions
export default confirmPasswordResetSlice.reducer
