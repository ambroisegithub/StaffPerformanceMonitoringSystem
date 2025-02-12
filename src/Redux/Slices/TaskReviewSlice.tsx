import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { store, type RootState } from "../store"
import axios from "axios"

// Types
export interface TeamMember {
  id: number
  username: string
  firstName: string
  lastName: string
  level: string
  email: string
  role: string
  teamId: number
  teamName: string
  supervisorId: number
  supervisorName: string
  supervisorLevel: string
  hasSubordinates: boolean
  subordinateCount: number
}

export interface Supervisor {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  level: string
}




export interface Team {
  id: number
  name: string
  description: string
  isActive: boolean
  memberCount: number
  created_at: string
  updated_at: string
  supervisor: Supervisor
  members?: TeamMember[]

}

export interface SupervisorTeamData {
  supervisor: Supervisor
  teams: Team[]
  members: TeamMember[]

}

export interface TaskComment {
  text: string
  user_id: number
  user_name: string
  timestamp: Date
}

export interface Task {
  id: number
  title: string
  description: string
  company: string
  department: string
  status: "pending" | "in_progress" | "completed" | "delayed"
  review_status: "pending" | "approved" | "rejected"
  contribution: string
  achieved_deliverables: string
  related_project: string
  reviewed: boolean
  reviewed_by: number | null
  reviewed_at: string | null
  comment: TaskComment[]
  created_by?: number // Added
}

export interface DailySubmission {
  dailyTasksId: number
  date: string
  tasks: Task[]
  submitted_at: string
}
// New hierarchical data types
export interface HierarchicalTeamData {
  teams: Team[]
  members: HierarchicalMember[]
  pagination: Pagination
}

export interface HierarchicalMember {
  user: TeamMember
  submissions: Record<string, DailySubmission>
}
export interface TeamTasksData {
  user: TeamMember
  submissions: Record<string, DailySubmission>
}

export interface Pagination {
  current_page: number
  total_pages: number
  total_items: number
}

export interface TaskReviewFilters {
  status?: string
  startDate?: string
  endDate?: string
  userName?: string
  userLevel?: string
  company?: string
  department?: string
  project?: string
  team?: string // Added
  supervisor?: string // Added
  search?: string // Added
}

export interface ReviewTaskPayload {
  taskId: number
  status: "approved" | "rejected"
  comment?: string
  reviewedBy: number
}

interface TaskReviewState {
  teamTasks: TeamTasksData[]
  hierarchicalTeamData: HierarchicalTeamData | null
  supervisorTeamData: SupervisorTeamData | null
  selectedTask: Task | null
  loading: boolean
  hierarchicalLoading: boolean
  teamMembersLoading: boolean
  reviewLoading: boolean
  adminTeamTasks: any[]
  adminTeamTasksLoading: boolean
  adminTeamTasksError: string | null
  error: string | null
  hierarchicalError: string | null
  teamMembersError: string | null
  pagination: Pagination
  filters: TaskReviewFilters
}

const initialState: TaskReviewState = {
  teamTasks: [],
  supervisorTeamData: null,
  hierarchicalTeamData: null,
  selectedTask: null,
  loading: false,
  hierarchicalLoading: false,
  teamMembersLoading: false,
  reviewLoading: false,
  adminTeamTasks: [], // Add this
  adminTeamTasksLoading: false, // Add this
  adminTeamTasksError: null, // Add this
  error: null,
  hierarchicalError: null,
  teamMembersError: null,
  pagination: {
    current_page: 1,
    total_pages: 0,
    total_items: 0,
  },
  filters: {
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    userName: undefined
  },
}


// Async thunks
export const fetchTeamTasks = createAsyncThunk(
  "taskReview/fetchTeamTasks",
  async (
    {
      supervisorId,
      page = 1,
      limit = 10,
      filters,
    }: {
      supervisorId: number
      page?: number
      limit?: number
      filters?: TaskReviewFilters
    },
    { rejectWithValue , getState},
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", limit.toString())

      // Apply filters if they exist
      if (filters) {
        if (filters.status) {
          queryParams.append("status", filters.status)
        }

        if (filters.startDate) {
          queryParams.append("startDate", filters.startDate)
        }

        if (filters.endDate) {
          queryParams.append("endDate", filters.endDate)
        }

        if (filters.userName) {
          queryParams.append("userName", filters.userName)
        }
        if (filters?.userName) {
          queryParams.append("userName", filters.userName)
        }
  
        if (filters?.userLevel) {
          queryParams.append("userLevel", filters.userLevel)
        }
  
        if (filters?.company) {
          queryParams.append("company", filters.company)
        }
  
        if (filters?.department) {
          queryParams.append("department", filters.department)
        }
  
        if (filters?.project) {
          queryParams.append("project", filters.project)
        }
  
      }

      const state = store.getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
     if (!organizationId) {
       return
     }
      const token = localStorage.getItem("token")
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/task/${organizationId}/supervisor/${supervisorId}/team-tasks?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        },
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch team tasks")
    }
  },
)

export const fetchSupervisorTeamMembers = createAsyncThunk(
  "taskReview/fetchSupervisorTeamMembers",
  async (supervisorId: number, { rejectWithValue, getState }) => {
    try {   
       const state = store.getState() as RootState;
       const organizationId = state.login.user?.organization?.id;
      if (!organizationId) {
        return
      }
      const token =localStorage.getItem("token")  
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/supervisor/${supervisorId}/team-members`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        },
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch supervisor team members")
    }
  }
)

export const reviewTask = createAsyncThunk(
  "taskReview/reviewTask",
  async (reviewData: ReviewTaskPayload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/task/tasks/${reviewData.taskId}/review`,
        {
          status: reviewData.status,
          comment: reviewData.comment,
          reviewedBy: reviewData.reviewedBy, // Dynamically passed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        },
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to review task")
    }
  },
)
export const fetchHierarchicalTeamTasks = createAsyncThunk(
  "taskReview/fetchHierarchicalTeamTasks",
  async (
    {
      supervisorId,
      page = 1,
      limit = 10,
      filters,
    }: {
      supervisorId: number
      page?: number
      limit?: number
      filters?: TaskReviewFilters
    },
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", limit.toString())

      // Apply filters if they exist
      if (filters) {
        if (filters.status) {
          queryParams.append("status", filters.status)
        }

        if (filters.startDate) {
          queryParams.append("startDate", filters.startDate)
        }

        if (filters.endDate) {
          queryParams.append("endDate", filters.endDate)
        }

        if (filters.userName) {
          queryParams.append("userName", filters.userName)
        }
      }
      const token = localStorage.getItem("token")

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/task/tasks/${supervisorId}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      },
    )
      

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch hierarchical team tasks")
    }
  },
)
export const fetchAdminTeamTasks = createAsyncThunk(
  "taskReview/fetchAdminTeamTasks",
  async (
    {
      userId,
      page = 1,
      limit = 10,
      filters,
    }: {
      userId: number
      page?: number
      limit?: number
      filters?: TaskReviewFilters
    },
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", limit.toString())

      // Apply filters if they exist
      if (filters) {
        if (filters.status) {
          queryParams.append("status", filters.status)
        }

        if (filters.startDate) {
          queryParams.append("startDate", filters.startDate)
        }

        if (filters.endDate) {
          queryParams.append("endDate", filters.endDate)
        }

        if (filters.userName) {
          queryParams.append("userName", filters.userName)
        }

        if (filters.userLevel) {
          queryParams.append("userLevel", filters.userLevel)
        }

        if (filters.company) {
          queryParams.append("company", filters.company)
        }

        if (filters.department) {
          queryParams.append("department", filters.department)
        }

        if (filters.project) {
          queryParams.append("project", filters.project)
        }
      }

      const token = localStorage.getItem("token")
        
      const state = store.getState() as RootState;
         const organizationId = state.login.user?.organization?.id;
       
         if (!organizationId) {
           return;
         }
       
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/task/${organizationId}/admin/team-tasks?userId=${userId}&${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        },
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch admin team tasks")
    }
  },
)

const taskReviewSlice = createSlice({
  name: "taskReview",
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task>) => {
      state.selectedTask = action.payload
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null
    },
    setFilters: (state, action: PayloadAction<TaskReviewFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = {
        startDate: undefined,
        endDate: undefined,
        status: undefined,
        userName: undefined, 
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTeamTasks
      .addCase(fetchTeamTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeamTasks.fulfilled, (state, action) => {
        state.loading = false
        state.teamTasks = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTeamTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // fetchHierarchicalTeamTasks
      .addCase(fetchHierarchicalTeamTasks.pending, (state) => {
        state.hierarchicalLoading = true
        state.hierarchicalError = null
      })
      .addCase(fetchHierarchicalTeamTasks.fulfilled, (state, action) => {
        state.hierarchicalLoading = false
        state.hierarchicalTeamData = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchHierarchicalTeamTasks.rejected, (state, action) => {
        state.hierarchicalLoading = false
        state.hierarchicalError = action.payload as string
      })
      // fetchSupervisorTeamMembers
      .addCase(fetchSupervisorTeamMembers.pending, (state) => {
        state.teamMembersLoading = true
        state.teamMembersError = null
      })
      .addCase(fetchSupervisorTeamMembers.fulfilled, (state, action) => {
        state.teamMembersLoading = false
        state.supervisorTeamData = action.payload.data
      })
      .addCase(fetchSupervisorTeamMembers.rejected, (state, action) => {
        state.teamMembersLoading = false
        state.teamMembersError = action.payload as string
      })

      // reviewTask
      .addCase(reviewTask.pending, (state) => {
        state.reviewLoading = true
        state.error = null
      })
      .addCase(fetchAdminTeamTasks.pending, (state) => {
        state.adminTeamTasksLoading = true
        state.adminTeamTasksError = null
      })
      .addCase(fetchAdminTeamTasks.fulfilled, (state, action) => {
        state.adminTeamTasksLoading = false
        state.adminTeamTasks = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAdminTeamTasks.rejected, (state, action) => {
        state.adminTeamTasksLoading = false
        state.adminTeamTasksError = action.payload as string
      })
      .addCase(reviewTask.fulfilled, (state, action) => {
        state.reviewLoading = false

        // Update the reviewed task in the state
        if (state.selectedTask) {
          state.selectedTask = {
            ...state.selectedTask,
            review_status: action.payload.data.task.review_status,
            reviewed: true,
            reviewed_by: action.payload.data.reviewedBy.id,
            reviewed_at: action.payload.data.task.reviewed_at,
            comment: action.payload.data.task.comment,
          }
        }

        // Update the task in the teamTasks array
        const reviewedTaskId = action.payload.data.task.id

        state.teamTasks = state.teamTasks.map((teamMember) => {
          const updatedSubmissions = { ...teamMember.submissions }

          // Loop through each date in submissions
          Object.keys(updatedSubmissions).forEach((date) => {
            // Update the task if it exists in this submission
            updatedSubmissions[date].tasks = updatedSubmissions[date].tasks.map((task) =>
              task.id === reviewedTaskId
                ? {
                    ...task,
                    review_status: action.payload.data.task.review_status,
                    reviewed: true,
                    reviewed_by: action.payload.data.reviewedBy.id,
                    reviewed_at: action.payload.data.task.reviewed_at,
                    comment: action.payload.data.task.comment,
                  }
                : task,
            )
          })

          return {
            ...teamMember,
            submissions: updatedSubmissions,
          }
        })
      })
      .addCase(reviewTask.rejected, (state, action) => {
        state.reviewLoading = false
        state.error = action.payload as string
      })
      
  },
})

export const { setSelectedTask, clearSelectedTask, setFilters, resetFilters } = taskReviewSlice.actions

export const selectTeamTasks = (state: RootState) => state.taskReview.teamTasks
export const selectSelectedTask = (state: RootState) => state.taskReview.selectedTask
export const selectLoading = (state: RootState) => state.taskReview.loading
export const selectReviewLoading = (state: RootState) => state.taskReview.reviewLoading
export const selectError = (state: RootState) => state.taskReview.error
export const selectPagination = (state: RootState) => state.taskReview.pagination
export const selectFilters = (state: RootState) => state.taskReview.filters
export const selectSupervisorTeamData = (state: RootState) => state.taskReview.supervisorTeamData
export const selectTeamMembersLoading = (state: RootState) => state.taskReview.teamMembersLoading
export const selectTeamMembersError = (state: RootState) => state.taskReview.teamMembersError
export const selectHierarchicalTeamData = (state: RootState) => state.taskReview.hierarchicalTeamData
export const selectHierarchicalLoading = (state: RootState) => state.taskReview.hierarchicalLoading
export const selectHierarchicalError = (state: RootState) => state.taskReview.hierarchicalError
export const selectAdminTeamTasks = (state: RootState) => state.taskReview.adminTeamTasks
export const selectAdminTeamTasksLoading = (state: RootState) => state.taskReview.adminTeamTasksLoading
export const selectAdminTeamTasksError = (state: RootState) => state.taskReview.adminTeamTasksError
export default taskReviewSlice.reducer