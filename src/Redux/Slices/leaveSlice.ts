// src/lib/features/leave/leaveSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

// Types
export interface Leave {
  leave_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  employee: {
    id: number;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LeaveFormData {
  employee_id: number;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason?: string;
  reviewer_id?: number;
}

interface LeaveState {
  leaves: Leave[];
  myLeaves: Leave[];
  selectedLeave: Leave | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Initial state
const initialState: LeaveState = {
  leaves: [],
  myLeaves: [],
  selectedLeave: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const createLeave = createAsyncThunk(
  'leave/createLeave',
  async (leaveData: LeaveFormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
       const token = localStorage.getItem("token") 

      const response = await axios.post(
        `${process.env.VITE_BASE_URL}/leaves`,
        leaveData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create leave request'
      );
    }
  }
);

export const fetchMyLeaves = createAsyncThunk(
  'leave/fetchMyLeaves',
  async (
    { page = 1, limit = 10, status, leave_type }: { page?: number; limit?: number; status?: string; leave_type?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
     const token = localStorage.getItem("token") 
      let url = `${process.env.VITE_BASE_URL}/leaves/my?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (leave_type) url += `&leave_type=${leave_type}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch leave requests'
      );
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  'leave/fetchAllLeaves',
  async (
    {
      page = 1,
      limit = 10,
      employee_id,
      status,
      leave_type,
    }: {
      page?: number;
      limit?: number;
      employee_id?: number;
      status?: string;
      leave_type?: string;
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
    const token = localStorage.getItem("token") 

      let url = `${process.env.VITE_BASE_URL}/leaves?page=${page}&limit=${limit}`;
      if (employee_id) url += `&employee_id=${employee_id}`;
      if (status) url += `&status=${status}`;
      if (leave_type) url += `&leave_type=${leave_type}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch all leave requests'
      );
    }
  }
);

export const approveRejectLeave = createAsyncThunk(
  'leave/approveRejectLeave',
  async (
    { leaveId, status, rejection_reason }: { leaveId: number; status: string; rejection_reason?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
         const token = localStorage.getItem("token") 

      const response = await axios.put(
        `${process.env.VITE_BASE_URL}/leaves/${leaveId}/review`,
        { status, rejection_reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process leave request'
      );
    }
  }
);

// Slice
const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedLeave: (state, action: PayloadAction<Leave | null>) => {
      state.selectedLeave = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create leave
      .addCase(createLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.myLeaves.unshift(action.payload);
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my leaves
      .addCase(fetchMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload.leaves;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all leaves
      .addCase(fetchAllLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload.leaves;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Approve/Reject leave
      .addCase(approveRejectLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRejectLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update the leave in both leaves and myLeaves arrays
        const updatedLeave = action.payload;
        state.leaves = state.leaves.map(leave =>
          leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
        );
        state.myLeaves = state.myLeaves.map(leave =>
          leave.leave_id === updatedLeave.leave_id ? updatedLeave : leave
        );
        if (state.selectedLeave?.leave_id === updatedLeave.leave_id) {
          state.selectedLeave = updatedLeave;
        }
      })
      .addCase(approveRejectLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess, setSelectedLeave } = leaveSlice.actions;
export default leaveSlice.reducer;