import type { TeamTasksData, Task } from "../Redux/Slices/TaskReviewSlice"

export interface FilteredTaskResult {
  filteredTeamTasks: TeamTasksData[]
  totalTaskCount: number
  hasActiveFilters: boolean
  filterSummary: {
    searchTerm: string
    userNameFilter: string | undefined
    statusFilter: string | undefined
    dateRangeFilter: string | undefined
  }
}

export interface TaskFilterOptions {
  teamTasks: TeamTasksData[]
  searchTerm: string
  filters: { userName?: string; status?: string; startDate?: string; endDate?: string }
}

/**
 * Utility class for handling task filtering logic
 */
export class TaskFilteringService {
  /**
   * Apply search and filters to team tasks
   */
  static filterTeamTasks(options: TaskFilterOptions): FilteredTaskResult {
    const { teamTasks, searchTerm, filters } = options

    // Check if any filters are active
    const hasActiveFilters = !!(
      searchTerm.trim() ||
      filters.userName ||
      filters.status ||
      filters.startDate ||
      filters.endDate
    )

    // First filter by username if it's set
    let filteredByUsername = teamTasks
    if (filters.userName) {
      filteredByUsername = teamTasks.filter((member) => member.user.username === filters.userName)
    }

    // If no search term and no other filters, return username-filtered results
    if (!searchTerm.trim() && !filters.status && !filters.startDate && !filters.endDate) {
      const totalTaskCount = this.calculateTotalTasks(filteredByUsername)
      return {
        filteredTeamTasks: filteredByUsername,
        totalTaskCount,
        hasActiveFilters,
        filterSummary: {
          searchTerm,
          userNameFilter: filters.userName,
          statusFilter: filters.status,
          dateRangeFilter: this.formatDateRange(filters.startDate, filters.endDate),
        },
      }
    }

    // Apply search term and other filters
    const filteredTeamTasks = filteredByUsername
      .map((member) => {
        const filteredSubmissions: Record<string, any> = {}

        Object.entries(member.submissions).forEach(([date, submission]) => {
          // Filter tasks by search term
          const filteredTasks = submission.tasks.filter((task: Task) => {
            const matchesSearch =
              !searchTerm.trim() ||
              task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              task.related_project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesStatus = !filters.status || task.review_status === filters.status

            const matchesDateRange = this.isTaskInDateRange(submission.date, filters.startDate, filters.endDate)

            return matchesSearch && matchesStatus && matchesDateRange
          })

          if (filteredTasks.length > 0) {
            filteredSubmissions[date] = {
              ...submission,
              tasks: filteredTasks,
            }
          }
        })

        // Only include member if they have matching tasks
        if (Object.keys(filteredSubmissions).length > 0) {
          return {
            ...member,
            submissions: filteredSubmissions,
          }
        }

        return null
      })
      .filter(Boolean) as TeamTasksData[]

    const totalTaskCount = this.calculateTotalTasks(filteredTeamTasks)

    return {
      filteredTeamTasks,
      totalTaskCount,
      hasActiveFilters,
      filterSummary: {
        searchTerm,
        userNameFilter: filters.userName,
        statusFilter: filters.status,
        dateRangeFilter: this.formatDateRange(filters.startDate, filters.endDate),
      },
    }
  }

  /**
   * Calculate total number of tasks across all team members
   */
  private static calculateTotalTasks(teamTasks: TeamTasksData[]): number {
    return teamTasks.reduce((total, member) => {
      const memberTaskCount = Object.values(member.submissions).reduce(
        (memberTotal, submission) => memberTotal + submission.tasks.length,
        0,
      )
      return total + memberTaskCount
    }, 0)
  }

  /**
   * Check if a task falls within the specified date range
   */
  private static isTaskInDateRange(submissionDate: string, startDate?: string, endDate?: string): boolean {
    if (!startDate && !endDate) return true

    const taskDate = new Date(submissionDate)

    if (startDate && taskDate < new Date(startDate)) {
      return false
    }

    if (endDate && taskDate > new Date(endDate)) {
      return false
    }

    return true
  }

  /**
   * Format date range for display
   */
  private static formatDateRange(startDate?: string, endDate?: string): string | undefined {
    if (!startDate && !endDate) return undefined
    if (startDate && endDate) return `${startDate} to ${endDate}`
    if (startDate) return `From ${startDate}`
    if (endDate) return `Until ${endDate}`
    return undefined
  }

  /**
   * Get filter statistics
   */
  static getFilterStatistics(result: FilteredTaskResult) {
    const { filteredTeamTasks } = result

    const stats = {
      totalMembers: filteredTeamTasks.length,
      totalTasks: result.totalTaskCount,
      pendingTasks: 0,
      approvedTasks: 0,
      rejectedTasks: 0,
    }

    filteredTeamTasks.forEach((member) => {
      Object.values(member.submissions).forEach((submission) => {
        submission.tasks.forEach((task: Task) => {
          switch (task.review_status) {
            case "pending":
              stats.pendingTasks++
              break
            case "approved":
              stats.approvedTasks++
              break
            case "rejected":
              stats.rejectedTasks++
              break
          }
        })
      })
    })

    return stats
  }
}

/**
 * Hook for task filtering (if using React hooks pattern)
 */
export const useTaskFiltering = (teamTasks: TeamTasksData[], searchTerm: string, filters: any) => {
  const result = TaskFilteringService.filterTeamTasks({
    teamTasks,
    searchTerm,
    filters,
  })

  const statistics = TaskFilteringService.getFilterStatistics(result)

  return {
    ...result,
    statistics,
  }
}
