"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/Card"
import { Badge } from "../../../../components/ui/Badge"
import { Button } from "../../../../components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible"
import { ChevronDown, ChevronRight, MessageSquare, Clock, Calendar } from "lucide-react"
import { format, parseISO } from "date-fns"

interface DailyReportsViewProps {
  dailyReports: any[]
  submissionStatus: string
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

const DailyReportsView: React.FC<DailyReportsViewProps> = ({
  dailyReports,
  submissionStatus,
  getStatusColor,
  getStatusIcon,
}) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDays(newExpanded)
  }

  const filteredReports = dailyReports.filter((day) => day.hasEntry || submissionStatus === "all")
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage)

  if (filteredReports.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Daily Reports Found</h3>
          <p className="text-slate-600">No daily reports match your current filter criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Reports ({filteredReports.length} days)</span>
            <Badge variant="outline">{`Page ${currentPage} of ${totalPages}`}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedReports.map((day) => (
              <Collapsible key={day.date}>
                <CollapsibleTrigger onClick={() => toggleDayExpansion(day.date)} className="w-full">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {expandedDays.has(day.date) ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">
                          {format(parseISO(day.date), "EEEE, MMM dd, yyyy")}
                        </p>
                        <p className="text-sm text-slate-600">{day.hasEntry ? `${day.taskCount} tasks` : "No entry"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {day.submitted && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Submitted</Badge>
                      )}
                      {day.hasEntry && !day.submitted && (
                        <Badge variant="outline" className="border-amber-200 text-amber-800">
                          Draft
                        </Badge>
                      )}
                      {!day.hasEntry && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          No Entry
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {day.tasks.length > 0 && (
                    <div className="mt-3 ml-9 space-y-4">
                      {day.tasks.map((task: any) => (
                        <Card key={task.id} className="border-l-4 border-l-blue-500 shadow-sm">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 mb-1">{task.title}</h4>
                                  <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Badge className={`${getStatusColor(task.status)} text-white border-0`}>
                                    {getStatusIcon(task.status)}
                                    <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
                                  </Badge>
                                  <Badge className={`${getStatusColor(task.review_status)} text-white border-0`}>
                                    {getStatusIcon(task.review_status)}
                                    <span className="ml-1 capitalize">{task.review_status}</span>
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">Contribution</p>
                                  <p className="text-slate-600">{task.contribution || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">Deliverables</p>
                                  <p className="text-slate-600">{task.achieved_deliverables || "Not specified"}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">Related Project</p>
                                  <p className="text-slate-600">{task.related_project || "Not specified"}</p>
                                </div>
                              </div>

                              {/* Comments Section */}
                              {task.comments && task.comments.length > 0 && (
                                <div className="border-t border-slate-200 pt-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <MessageSquare className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">
                                      Comments ({task.comments.length})
                                    </span>
                                  </div>
                                  <div className="space-y-3 max-h-40 overflow-y-auto">
                                    {task.comments.map((comment: any, index: number) => (
                                      <div key={index} className="bg-white border border-slate-200 p-3 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="font-medium text-slate-700 text-sm">
                                            {comment.user_name}
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            {format(parseISO(comment.timestamp), "MMM dd, HH:mm")}
                                          </span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{comment.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Review History */}
                              {task.review_history && task.review_history.length > 0 && (
                                <div className="border-t border-slate-200 pt-4">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Review History</span>
                                  </div>
                                  <div className="space-y-2">
                                    {task.review_history.map((review: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            className={`${getStatusColor(review.status)} text-white border-0 text-xs`}
                                          >
                                            {review.status}
                                          </Badge>
                                          <span className="text-slate-600">by {review.reviewer_name}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                          {format(parseISO(review.timestamp), "MMM dd, HH:mm")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DailyReportsView
