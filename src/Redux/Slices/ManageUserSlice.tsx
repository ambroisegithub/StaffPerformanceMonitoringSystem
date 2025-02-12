import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface User {
  supervisoryLevel: any;
  id: number;
  username: string;
  email: string;
  role: string;
  company: {
    id: number;
    name: string;
  } | null;
  department: {
    id: number;
    name: string;
  } | null;
  team: {
    id: number;
    name: string;
  } | null;
  supervisor: {
    id: number;
    username: string;
    email: string;
    role: string;
  } | null;
  organization: {
    id: number;
    name: string;
    description: string;
  } | null; 
}

interface ManageUserState {
  users: User[]
  loading: boolean
  error: string | null
}

const initialState: ManageUserState = {
  users: [],
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk(
  "manageUser/fetchUsers",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Get token from local storage
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/${organizationId}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
      return response.data.data; // Return the users data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch users");
    }
  }
);

export const fetchsupervisors = createAsyncThunk("AssignUser/fetchsupervisors", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/supervisors`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response.data)
  }
})

export const updateUserRole = createAsyncThunk(
  "manageUser/updateUserRole",
  async ({ userId, newRole }: { userId: number; newRole: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/api/user/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        },
      )
      showSuccessToast("User role updated successfully")
      return response.data
    } catch (error: any) {
      showErrorToast(error.response.data.message || "Failed to update user role")
      return rejectWithValue(error.response.data)
    }
  },
)

export const deleteUser = createAsyncThunk("manageUser/deleteUser", async (userId: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token") // Get token from local storage
    await axios.delete(`${import.meta.env.VITE_BASE_URL}/user/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in headers
      },
    })
    showSuccessToast("User deleted successfully")
    return userId
  } catch (error: any) {
    showErrorToast(error.response.data.message || "Failed to delete user")
    return rejectWithValue(error.response.data)
  }
})

const manageUserSlice = createSlice({
  name: "manageUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchsupervisors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchsupervisors.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchsupervisors.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload
        const index = state.users.findIndex((user) => user.id === updatedUser.id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload)
      })
  },
})

export default manageUserSlice.reducer

