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
  isReworking: boolean
  reworkError: string | null
  uploadProgress: number
}

const initialState: TaskState = {
  tasks: [],
  dailyTasks: [],
  loading: false,
  error: null,
  isReworking: false,
  reworkError: null,
  uploadProgress: 0,
}

const apiUrl = `${import.meta.env.VITE_BASE_URL}/task`

export const createTask = createAsyncThunk("tasks/createTask", async (taskData: any, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { login: { user: { id: number; company: { name: string } | null } } }
    const user = state.login.user
    const token = localStorage.getItem("token")

    // Create FormData if files are present
    let requestData: FormData | any = taskData
    const headers: any = {
      Authorization: `Bearer ${token}`,
    }

    if (taskData.attached_documents && taskData.attached_documents.length > 0) {
      const formData = new FormData()

      // Append all form fields
      Object.keys(taskData).forEach((key) => {
        if (key !== "attached_documents") {
          formData.append(key, taskData[key])
        }
      })

      // Append files
      taskData.attached_documents.forEach((file: File) => {
        formData.append("documents", file)
      })

      // Add company and user info
      if (user.company) {
        formData.append("company_served", user.company.name)
      }
      formData.append("created_by", user.id.toString())

      requestData = formData
      // Don't set Content-Type header, let browser set it with boundary
    } else {
      // Regular JSON request
      const company_served = user.company ? user.company.name : ""
      const created_by = user.id
      requestData = { ...taskData, company_served, created_by }
      headers["Content-Type"] = "application/json"
    }

    const response = await axios.post(`${apiUrl}/tasks`, requestData, { headers })
    showSuccessToast("Task created successfully!")
    return response.data
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Failed to create task"
    showErrorToast(errorMessage)
    return rejectWithValue(errorMessage)
  }
})

// New rework task action
export const reworkTask = createAsyncThunk(
  "tasks/reworkTask",
  async ({ taskId, formData }: { taskId: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.put(`${apiUrl}/tasks/${taskId}/rework`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, let browser handle it for FormData
        },
      })

      showSuccessToast("Task reworked successfully!")
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to rework task"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)


export const fetchDailyTasks = createAsyncThunk(
  "tasks/fetchDailyTasks",
  async (userId: number, { rejectWithValue,getState }) => {
    try {
      const state = getState() as RootState
      const organizationId = state.login.user?.organization?.id
      const token = localStorage.getItem("token") // Get token from local storage
      // http://localhost:3002/api/v1/organizations/organization/11/teams/daily-tasks
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
    clearTaskErrors: (state) => {
      state.error = null
      state.reworkError = null
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload && action.payload.task) {
          state.tasks.push(action.payload.task)
        } else if (action.payload) {
          state.tasks.push(action.payload)
        }
        state.uploadProgress = 0
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.uploadProgress = 0
      })

      // Rework Task
      .addCase(reworkTask.pending, (state) => {
        state.isReworking = true
        state.reworkError = null
      })
      .addCase(reworkTask.fulfilled, (state, action) => {
        state.isReworking = false
        // Update the task in the daily tasks
        if (action.payload && action.payload.task) {
          const updatedTask = action.payload.task
          state.dailyTasks = state.dailyTasks.map((dailyTask) => ({
            ...dailyTask,
            tasks: dailyTask.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
          }))
        }
        state.uploadProgress = 0
      })
      .addCase(reworkTask.rejected, (state, action) => {
        state.isReworking = false
        state.reworkError = action.payload as string
        state.uploadProgress = 0
      })

      // Fetch Daily Tasks
      .addCase(fetchDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        state.dailyTasks = action.payload || []
      })
      .addCase(fetchDailyTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Submit Daily Tasks
      .addCase(submitDailyTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitDailyTasks.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
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

export const { clearTaskErrors, setUploadProgress, resetUploadProgress } = taskSlice.actions
export default taskSlice.reducer
