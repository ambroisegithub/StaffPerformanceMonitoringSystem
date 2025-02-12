import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import { RootState } from "../store"

// Types
interface Company {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
}

export interface Department {
  id: number
  name: string
  company?: Company
  group?: Group
  users?: { id: number; firstName: string; lastName: string; email: string }[]
  created_at?: string
  updated_at?: string
}

interface DepartmentState {
  departments: Department[]
  filteredDepartments: Department[]
  selectedDepartment: Department | null
  loading: boolean
  error: string | null
  success: boolean
  successMessage: string
  isEditing: boolean
}

// Initial state
const initialState: DepartmentState = {
  departments: [],
  filteredDepartments: [], // Initialize as empty array
  selectedDepartment: null,
  loading: false,
  error: null,
  success: false,
  successMessage: "",
  isEditing: false,
}

// API URL
const API_URL = `${import.meta.env.VITE_BASE_URL}/v1/departments`

export const fetchAllDepartments = createAsyncThunk(
  "departments/fetchAllDepartments",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data.departments || [];
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch departments";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createDepartment = createAsyncThunk(
  "departments/createDepartment",
  async (
    departmentData: { name: string; company_id: number },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments`,
        departmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccessToast("Department created successfully");
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create department";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "departments/updateDepartment",
  async (
    { id, departmentData }: { id: number; departmentData: { name?: string; company_id?: number } },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments/${id}`,
        departmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccessToast("Department updated successfully");
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update department";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "departments/deleteDepartment",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;

      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }

      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccessToast("Department deleted successfully");
      return id;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to delete department";
      showErrorToast(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


export const getDepartmentById = createAsyncThunk(
  "departments/getDepartmentById",
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch department details"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const getDepartmentsByCompany = createAsyncThunk(
  "departments/getDepartmentsByCompany",
  async (companyId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/v1/${companyId}/departments`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch departments by company"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const getUsersByDepartment = createAsyncThunk(
  "departments/getUsersByDepartment",
  async (departmentId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${API_URL}/${departmentId}/users`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return { departmentId, users: response.data.data || [] }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch users by department"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// Create slice
const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null
    },
    clearDepartmentSuccess: (state) => {
      state.success = false
      state.successMessage = ""
    },
    setSelectedDepartment: (state, action) => {
      state.selectedDepartment = action.payload
    },
    clearSelectedDepartment: (state) => {
      state.selectedDepartment = null
    },
    filterDepartments: (state, action) => {
      const searchTerm = action.payload.toLowerCase()
      if (!searchTerm) {
        state.filteredDepartments = state.departments
      } else {
        state.filteredDepartments = state.departments.filter(
          (dept) =>
            dept.name.toLowerCase().includes(searchTerm) || dept.company?.name?.toLowerCase().includes(searchTerm),
        )
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all departments
      .addCase(fetchAllDepartments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllDepartments.fulfilled, (state, action) => {
        state.loading = false
        state.departments = action.payload || [] // Ensure it's an array
        state.filteredDepartments = action.payload || [] // Ensure it's an array
      })
      .addCase(fetchAllDepartments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.departments = [] // Reset to empty array on error
        state.filteredDepartments = [] // Reset to empty array on error
      })

      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.loading = true
        state.error = null
        state.isEditing = true
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false
        state.departments.push(action.payload)
        state.filteredDepartments = [...state.departments] // Create a new array reference
        state.success = true
        state.successMessage = "Department created successfully"
        state.isEditing = false
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isEditing = false
      })

      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true
        state.error = null
        state.isEditing = true
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false
        const index = state.departments.findIndex((dept) => dept.id === action.payload.id)
        if (index !== -1) {
          state.departments[index] = action.payload
        }
        state.filteredDepartments = [...state.departments] // Create a new array reference
        state.selectedDepartment = null
        state.success = true
        state.successMessage = "Department updated successfully"
        state.isEditing = false
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isEditing = false
      })

      // Delete department
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false
        state.departments = state.departments.filter((dept) => dept.id !== action.payload)
        state.filteredDepartments = state.departments.filter((dept) => dept.id !== action.payload)
        state.success = true
        state.successMessage = "Department deleted successfully"
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get department by ID
      .addCase(getDepartmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedDepartment = action.payload
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Get departments by company
      .addCase(getDepartmentsByCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDepartmentsByCompany.fulfilled, (state, action) => {
        state.loading = false
        state.departments = action.payload || [] // Ensure it's an array
        state.filteredDepartments = action.payload || [] // Ensure it's an array
      })
      .addCase(getDepartmentsByCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.departments = [] // Reset to empty array on error
        state.filteredDepartments = [] // Reset to empty array on error
      })

      // Get users by department
      .addCase(getUsersByDepartment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsersByDepartment.fulfilled, (state, action) => {
        state.loading = false
        const { departmentId, users } = action.payload
        const departmentIndex = state.departments.findIndex((dept) => dept.id === departmentId)
        if (departmentIndex !== -1) {
          state.departments[departmentIndex].users = users
        }

        const filteredDepartmentIndex = state.filteredDepartments.findIndex((dept) => dept.id === departmentId)
        if (filteredDepartmentIndex !== -1) {
          state.filteredDepartments[filteredDepartmentIndex].users = users
        }

        if (state.selectedDepartment && state.selectedDepartment.id === departmentId) {
          state.selectedDepartment.users = users
        }
      })
      .addCase(getUsersByDepartment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearDepartmentError,
  clearDepartmentSuccess,
  setSelectedDepartment,
  clearSelectedDepartment,
  filterDepartments,
} = departmentSlice.actions

export default departmentSlice.reducer

