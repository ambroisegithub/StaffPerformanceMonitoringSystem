import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { showErrorToast, showSuccessToast } from '../../utilis/ToastProps';

export enum UserRole {
  ADMIN = "overall",
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
}

interface SignUpState {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  company_id: number;
  department_id: number;
  loading: boolean;
  error: string | null;
}

const initialState: SignUpState = {
  username: '',
  email: '',
  password: '',
  role: UserRole.EMPLOYEE,
  company_id: 0,
  department_id: 0,
  loading: false,
  error: null,
};

const apiUrl = `${import.meta.env.VITE_BASE_URL}/user/register`;

export const registerUser = createAsyncThunk(
  'signUp/registerUser',
  async (
    userData: Omit<SignUpState, 'loading' | 'error'>,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axios.post(apiUrl, userData);
      showSuccessToast('User registered successfully!');
      
      // Store user email for potential use in verification
      dispatch(setEmail(userData.email));
      
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        'Something went wrong';
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const signUpSlice = createSlice({
  name: 'signUp',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    setCompanyId: (state, action: PayloadAction<number>) => {
      state.company_id = action.payload;
    },
    setDepartmentId: (state, action: PayloadAction<number>) => {
      state.department_id = action.payload;
    },
    resetForm: (state) => {
      Object.assign(state, initialState);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Reset form after successful registration
        Object.assign(state, initialState);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export const {
  setUsername,
  setEmail,
  setPassword,
  setRole,
  setCompanyId,
  setDepartmentId,
  resetForm
} = signUpSlice.actions;

export default signUpSlice.reducer;