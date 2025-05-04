"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card"
import { Badge } from "../../../../components/ui/Badge"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "../../../../lib/utils"

interface CalendarViewProps {
  calendarData: any[]
  onDateSelect: (date: Date) => void
  selectedDate?: Date
}

const CalendarView: React.FC<CalendarViewProps> = ({ calendarData, onDateSelect, selectedDate }) => {
  const getDateStatus = (day: any) => {
    if (!day.hasEntry) return "empty"
    if (day.submitted) return "submitted"
    return "draft"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-emerald-100 border-emerald-300 text-emerald-800"
      case "draft":
        return "bg-amber-100 border-amber-300 text-amber-800"
      case "empty":
        return "bg-slate-50 border-slate-200 text-slate-400"
      default:
        return "bg-slate-50 border-slate-200 text-slate-400"
    }
  }

  const selectedDateData = selectedDate
    ? calendarData.find((day) => day.date === format(selectedDate, "yyyy-MM-dd"))
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Task Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((day) => {
                const date = parseISO(day.date)
                const status = getDateStatus(day)
                const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === day.date

                return (
                  <button
                    key={day.date}
                    onClick={() => onDateSelect(date)}
                    className={cn(
                      "p-3 border rounded-lg text-sm transition-all hover:shadow-md",
                      getStatusColor(status),
                      isSelected && "ring-2 ring-blue-500 ring-offset-2",
                    )}
                  >
                    <div className="font-medium">{format(date, "d")}</div>
                    {day.hasEntry && (
                      <div className="text-xs mt-1">
                        {day.taskCount} task{day.taskCount !== 1 ? "s" : ""}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
                <span className="text-sm text-slate-600">Submitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
                <span className="text-sm text-slate-600">Draft</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200"></div>
                <span className="text-sm text-slate-600">No Entry</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Details */}
      <div>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a Date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <Badge className={getStatusColor(getDateStatus(selectedDateData))}>
                    {getDateStatus(selectedDateData) === "submitted" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {getDateStatus(selectedDateData) === "draft" && <Clock className="h-3 w-3 mr-1" />}
                    {getDateStatus(selectedDateData) === "empty" && <XCircle className="h-3 w-3 mr-1" />}
                    {getDateStatus(selectedDateData).charAt(0).toUpperCase() + getDateStatus(selectedDateData).slice(1)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Tasks</span>
                  <span className="text-sm text-slate-600">{selectedDateData.taskCount}</span>
                </div>

                {selectedDateData.hasEntry && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Completed</span>
                      <span className="text-sm text-slate-600">
                        {selectedDateData.taskStatusCounts?.completed || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Pending Reviews</span>
                      <span className="text-sm text-slate-600">
                        {selectedDateData.reviewStatusCounts?.pending || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Click on a date to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CalendarView
