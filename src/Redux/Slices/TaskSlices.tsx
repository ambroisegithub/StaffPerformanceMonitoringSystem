import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import { RootState } from "../store"

interface Task {
  id: number
  title: string
  description: string
  contribution: string
  status: string
  due_date: string
  latitude: number
  longitude: number
  location_name: string
  remarks: string
  related_project: string
  achieved_deliverables: string
  created_by: number
  company_served:
    | {
        name: string
        tin?: string
      }
    | string
  department?: {
    id: number
    name: string
  }
  reviewed?: boolean
  review_status?: string
}

interface DailyTask {
  id: number
  submission_date: string
  tasks: Task[]
  submitted: boolean
  task_count?: number
  user?: {
    id: number
    username: string
    department?: {
      id: number
      name: string
    }
  }
  created_at?: string
  updated_at?: string
}

interface TaskState {
  tasks: Task[]
  dailyTasks: DailyTask[]
  loading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  dailyTasks: [],
  loading: false,
  error: null,
}

const apiUrl = `${import.meta.env.VITE_BASE_URL}/task`

export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskData: Partial<Task>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { login: { user: { id: number; company: { name: string } | null } } }
      const user = state.login.user
      // Only set company_served if user has a company
      const company_served = user.company ? user.company.name : ""
      const created_by = user.id
      const token = localStorage.getItem("token") // Get token from local storage

      const response = await axios.post(
        `${apiUrl}/tasks`,
        { ...taskData, company_served, created_by },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        },
      )
      showSuccessToast("Task created successfully!")
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create task"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchDailyTasks = createAsyncThunk(
  "tasks/fetchDailyTasks",
  async (userId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage

      const response = await axios.get(`${apiUrl}/user/${userId}/daily-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      // Ensure we're returning an array even if the API returns null or undefined
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch daily tasks"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const submitDailyTasks = createAsyncThunk(
  "tasks/submitDailyTasks",
  async ({ userId, dailyTaskId }: { userId: number; dailyTaskId: number }, { rejectWithValue }) => {
    try {
    const token = localStorage.getItem("token") 
      const response = await axios.post(
        `${apiUrl}/daily-tasks/${dailyTaskId}/submit`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        },
      )
      showSuccessToast("Daily tasks submitted successfully!")
      return response.data.data || response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to submit daily tasks"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Add a reducer to clear errors if needed
    clearTaskErrors: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        // Handle the case where the payload might be a task or a daily task
        if (action.payload && action.payload.task) {
          state.tasks.push(action.payload.task)
        } else if (action.payload) {
          state.tasks.push(action.payload)
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        // Ensure we're setting an array even if the payload is null or undefined
        state.dailyTasks = action.payload || []
      })
      .addCase(fetchDailyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(submitDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          // Find and update the submitted daily task
          const updatedDailyTask = action.payload
          state.dailyTasks = state.dailyTasks.map((dailyTask) =>
            dailyTask.id === updatedDailyTask.id ? updatedDailyTask : dailyTask,
          )
        }
      })
      .addCase(submitDailyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearTaskErrors } = taskSlice.actions
export default taskSlice.reducer
