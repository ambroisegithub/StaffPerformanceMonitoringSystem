import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showSuccessToast, showErrorToast } from "../../utilis/ToastProps"

interface TwoFactorAuthState {
  loading: boolean
  error: string | null
  resetToken: string | null
}

const BASE_URL = import.meta.env.VITE_BASE_URL

export const verifyOTP = createAsyncThunk("passwordReset/verifyOTP", async (otpCode: string, { rejectWithValue }) => {
  try {
    const email = localStorage.getItem("resetEmail")

    if (!email) {
      throw new Error("Email not found. Please restart the reset process.")
    }

    const response = await axios.post(`${BASE_URL}/user/verify-otp`, {
      email,
      otp: otpCode,
    })

    showSuccessToast("OTP verified successfully")
    return { resetToken: response.data.resetToken }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "OTP verification failed"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

const twoFactorAuthSlice = createSlice({
  name: "twoFactorAuth",
  initialState: {
    loading: false,
    error: null,
    resetToken: null,
  } as TwoFactorAuthState,
  reducers: {
    clearState: (state) => {
      state.loading = false
      state.error = null
      state.resetToken = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false
        state.resetToken = action.payload.resetToken
        localStorage.setItem("resetToken", action.payload.resetToken)
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearState } = twoFactorAuthSlice.actions
export default twoFactorAuthSlice.reducer

