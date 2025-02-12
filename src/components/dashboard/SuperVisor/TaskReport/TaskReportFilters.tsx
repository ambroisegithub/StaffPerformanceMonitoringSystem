"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "../../../ui/Card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Button } from "../../../ui/button"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover"
import { Calendar as CalendarComponent } from "../../../ui/calendar"
import React from "react"

interface TaskReportFiltersProps {
  filters: {
    teamId?: string
    userId?: string
    year?: string
    month?: string
    startDate?: string
    endDate?: string
  }
  onFilterChange: (filters: any) => void
  teams: any[]
}

const TaskReportFilters = ({ filters, onFilterChange, teams }: TaskReportFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [dateRange, setDateRange] = useState<"custom" | "month" | "year">("month")
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined)
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(filters.teamId)
  const [selectedUser, setSelectedUser] = useState<string | undefined>(filters.userId)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
    setStartDate(filters.startDate ? new Date(filters.startDate) : undefined)
    setEndDate(filters.endDate ? new Date(filters.endDate) : undefined)
    setSelectedTeam(filters.teamId)
    setSelectedUser(filters.userId)
  }, [filters])

  // Update available users when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      const team = teams.find((t) => t.id.toString() === selectedTeam)
      if (team) {
        setAvailableUsers(team.members)
      }
    } else {
      // If no team is selected, collect all users from all teams
      const allUsers: any[] = []
      teams.forEach((team) => {
        team.members.forEach((member:any) => {
          if (!allUsers.some((u) => u.id === member.id)) {
            allUsers.push(member)
          }
        })
      })
      setAvailableUsers(allUsers)
    }
  }, [selectedTeam, teams])

  const handleDateRangeChange = (value: "custom" | "month" | "year") => {
    setDateRange(value)

    // Reset date-related filters
    const newFilters = { ...localFilters }
    delete newFilters.startDate
    delete newFilters.endDate
    delete newFilters.year
    delete newFilters.month

    setLocalFilters(newFilters)
  }

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value || undefined)

    // Reset user selection when team changes
    setSelectedUser(undefined)

    const newFilters = {
      ...localFilters,
      teamId: value || undefined,
      userId: undefined,
    }

    setLocalFilters(newFilters)
  }

  const handleUserChange = (value: string) => {
    setSelectedUser(value || undefined)

    const newFilters = {
      ...localFilters,
      userId: value || undefined,
    }

    setLocalFilters(newFilters)
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)

    if (date) {
      const newFilters = {
        ...localFilters,
        startDate: format(date, "yyyy-MM-dd"),
        year: undefined,
        month: undefined,
      }

      setLocalFilters(newFilters)
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)

    if (date) {
      const newFilters = {
        ...localFilters,
        endDate: format(date, "yyyy-MM-dd"),
        year: undefined,
        month: undefined,
      }

      setLocalFilters(newFilters)
    }
  }

  const handleMonthYearChange = (type: "month" | "year", value: string) => {
    const newFilters = { ...localFilters }

    if (type === "month") {
      newFilters.month = value
    } else {
      newFilters.year = value
    }

    // Remove custom date range when using month/year
    delete newFilters.startDate
    delete newFilters.endDate

    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange(localFilters)
  }

  const handleResetFilters = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const resetFilters = {
      startDate: format(firstDayOfMonth, "yyyy-MM-dd"),
      endDate: format(lastDayOfMonth, "yyyy-MM-dd"),
    }

    setDateRange("month")
    setStartDate(firstDayOfMonth)
    setEndDate(lastDayOfMonth)
    setSelectedTeam(undefined)
    setSelectedUser(undefined)
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <Select value={selectedTeam} onValueChange={handleTeamChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent className="bg-white z-10">
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <Select value={selectedUser} onValueChange={handleUserChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Members" />
              </SelectTrigger>
              <SelectContent className="bg-white z-10">
                <SelectItem value="all">All Members</SelectItem>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range Type</label>
            <Select value={dateRange} onValueChange={(value: any) => handleDateRangeChange(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range type" />
              </SelectTrigger>
              <SelectContent className="bg-white z-10">
                <SelectItem value="custom">Custom Date Range</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Inputs - changes based on selection */}
          {dateRange === "custom" && (
            <div className="lg:col-span-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {dateRange === "month" && (
            <div className="lg:col-span-1 flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <Select value={localFilters.month} onValueChange={(value) => handleMonthYearChange("month", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-10">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Select value={localFilters.year} onValueChange={(value) => handleMonthYearChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-10">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {dateRange === "year" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Select value={localFilters.year} onValueChange={(value) => handleMonthYearChange("year", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskReportFilters

