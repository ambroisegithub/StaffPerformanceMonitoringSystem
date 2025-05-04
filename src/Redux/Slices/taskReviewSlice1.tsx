// @ts-nocheck
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"

export enum TaskStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

interface TaskComment {
  text: string
  user_id: number
  user_name: string
  timestamp: Date
}

interface Task {
  id: number
  title: string
  description: string
  contribution: string
  status: TaskStatus
  review_status: ReviewStatus
  due_date: string
  reviewed: boolean
  reviewed_at: string | null
  reviewed_by: number | null
  comments: TaskComment[]
  created_by: {
    id: number
    username: string
    firstName: string
    lastName: string
    email: string
    supervisoryLevel: string
  }
  company_served: {
    id: number
    name: string
  }
  department: {
    id: number
    name: string
  } | null
  related_project: string | null
  achieved_deliverables: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  attachments: string[]
}

interface ReviewerDetails {
  id: number
  name: string
  role: string
  supervisoryLevel: string
}

interface TaskReviewDetails {
  task: Task
  reviewerDetails: ReviewerDetails | null
}

interface TaskStatistics {
  tasksByStatus: { status: string; count: string }[]
  tasksByReviewStatus: { review_status: string; count: string }[]
  tasksByUser: {
    id: string
    firstName: string
    lastName: string
    supervisoryLevel: string
    taskCount: string
  }[]
  teamMemberCount: number
}

interface Pagination {
  current_page: number
  total_pages: number
  total_items: number
}

interface TaskReviewState {
  reviewLoading: any
  teamTasks: any
  tasks: Task[]
  selectedTask: Task | null
  taskDetails: TaskReviewDetails | null
  statistics: TaskStatistics | null
  loading: boolean
  detailsLoading: boolean
  statisticsLoading: boolean
  error: string | null
  pagination: Pagination
  filters: {
    status: string | null
    reviewStatus: string | null
    teamId: number | null
    supervisorId: number | null
  }
}

const initialState: TaskReviewState = {
  tasks: [],
  selectedTask: null,
  taskDetails: null,
  statistics: null,
  loading: false,
  detailsLoading: false,
  statisticsLoading: false,
  error: null,
  pagination: {
    current_page: 1,
    total_pages: 0,
    total_items: 0,
  },
  filters: {
    status: null,
    reviewStatus: ReviewStatus.PENDING,
    teamId: null,
    supervisorId: null,
  },
}

// Fetch tasks for review
export const fetchTasksForReview = createAsyncThunk(
  "taskReview/fetchTasksForReview",
  async (
    {
      teamId,
      page = 1,
      limit = 10,
      status = null,
      reviewStatus = ReviewStatus.PENDING,
    }: {
      teamId: number
      page?: number
      limit?: number
      status?: string | null
      reviewStatus?: string | null
    },
    { rejectWithValue },
  ) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      let url = `${import.meta.env.VITE_BASE_URL}/task/review/team/${teamId}?page=${page}&limit=${limit}`

      if (status) {
        url += `&status=${status}`
      }

      if (reviewStatus) {
        url += `&reviewStatus=${reviewStatus}`
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks for review")
    }
  },
)

// Fetch task review details
export const fetchTaskReviewDetails = createAsyncThunk(
  "taskReview/fetchTaskReviewDetails",
  async (taskId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/task/review/${taskId}/details`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch task review details")
    }
  },
)

// Review a task
export const reviewTask = createAsyncThunk(
  "taskReview/reviewTask",
  async (
    {
      taskId,
      reviewStatus,
      comment,
      supervisorId,
    }: {
      taskId: number
      reviewStatus: ReviewStatus
      comment?: string
      supervisorId: number
    },
    { rejectWithValue, dispatch },
  ) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/task/review/${taskId}`,
        {
          reviewStatus,
          comment,
          supervisorId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        },
      )

      toast.success("Task reviewed successfully")

      // Refresh task details
      dispatch(fetchTaskReviewDetails(taskId))

      return response.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to review task")
      return rejectWithValue(error.response?.data?.message || "Failed to review task")
    }
  },
)

// Fetch task review statistics
export const fetchTaskReviewStatistics = createAsyncThunk(
  "taskReview/fetchTaskReviewStatistics",
  async (teamId: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token") // Get token from local storage
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/task/review/team/${teamId}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch task review statistics")
    }
  },
)

const taskReviewSlice = createSlice({
  name: "taskReview",
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload
    },
    setFilters: (
      state,
      action: PayloadAction<{
        status?: string | null
        reviewStatus?: string | null
        teamId?: number | null
        supervisorId?: number | null
      }>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks for review
      .addCase(fetchTasksForReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasksForReview.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTasksForReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch task review details
      .addCase(fetchTaskReviewDetails.pending, (state) => {
        state.detailsLoading = true
        state.error = null
      })
      .addCase(fetchTaskReviewDetails.fulfilled, (state, action) => {
        state.detailsLoading = false
        state.taskDetails = action.payload.data
      })
      .addCase(fetchTaskReviewDetails.rejected, (state, action) => {
        state.detailsLoading = false
        state.error = action.payload as string
      })

      // Review task
      .addCase(reviewTask.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(reviewTask.fulfilled, (state, action) => {
        state.loading = false

        // Update the task in the list
        const updatedTask = action.payload.data
        state.tasks = state.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))

        // If this is the selected task, update it
        if (state.selectedTask && state.selectedTask.id === updatedTask.id) {
          state.selectedTask = updatedTask
        }
      })
      .addCase(reviewTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Fetch task review statistics
      .addCase(fetchTaskReviewStatistics.pending, (state) => {
        state.statisticsLoading = true
        state.error = null
      })
      .addCase(fetchTaskReviewStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false
        state.statistics = action.payload.data
      })
      .addCase(fetchTaskReviewStatistics.rejected, (state, action) => {
        state.statisticsLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedTask, setFilters, clearError } = taskReviewSlice.actions

export default taskReviewSlice.reducer

