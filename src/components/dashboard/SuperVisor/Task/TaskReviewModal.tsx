// @ts-nocheck

"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  selectSelectedTask,
  selectReviewLoading,
  clearSelectedTask,
  reviewTask,
  fetchTeamTasks,
  selectFilters,
  selectPagination,
  setSelectedTask,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { formatDateTime } from "../../../../utilis/dateUtils"
import { CheckCircle, AlertCircle, Clock, X, MessageSquare, Clipboard, FileCheck, Calendar, User, Building2, Target, Shield } from "lucide-react"
import { Badge } from "../../../ui/Badge"
import { Textarea } from "../../../ui/textarea"

interface TaskReviewModalProps {
  isOpen: boolean
  onClose: () => void
  supervisorId: number | null
}

const TaskReviewModal: React.FC<TaskReviewModalProps> = ({ isOpen, onClose, supervisorId }) => {
  const dispatch = useAppDispatch()
  const selectedTask = useAppSelector(selectSelectedTask)
  const reviewLoading = useAppSelector(selectReviewLoading)
  const filters = useAppSelector(selectFilters)
  const pagination = useAppSelector(selectPagination)
  const user = useAppSelector((state: { login: { user: any } }) => state.login.user)

  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [comment, setcomment] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"details" | "review">("details")

  useEffect(() => {
    if (!isOpen) {
      setReviewStatus("approved")
      setcomment("")
      setError("")
      setActiveTab("details")
    }
  }, [isOpen])

  const handleClose = () => {
    dispatch(clearSelectedTask())
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTask || !user?.id) {
      setError("Missing task or user information")
      return
    }

    try {
      const result = await dispatch(
        reviewTask({
          taskId: selectedTask.id,
          status: reviewStatus,
          comment: comment.trim() || undefined,
          reviewedBy: user.id, // Use logged-in user's ID
        }),
      ).unwrap()

      // Update the selected task with the new comment
      dispatch(setSelectedTask({
        ...selectedTask,
        review_status: result.data.task.review_status,
        reviewed: true,
        reviewed_by: result.data.reviewedBy.id,
        reviewed_at: result.data.task.reviewed_at,
        comment: result.data.task.comment,
      }))

      // Refresh the task list
      if (user.id) {
        dispatch(
          fetchTeamTasks({
            supervisorId: user.id,
            page: pagination.current_page,
            filters,
          }),
        )
      }

      handleClose()
    } catch (error: any) {
      setError(error.message || "Failed to submit review")
    }
  }

  // Helper function for review status badge
  const getReviewStatusBadge = (status: string | undefined) => {
    if (!status) return null

    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-emerald-500 text-white border-emerald-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="font-medium">Approved</span>
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500 text-white border-rose-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="font-medium">Rejected</span>
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-500 text-white border-amber-200 flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">Pending</span>
          </Badge>
        )
    }
  }

  if (!isOpen || !selectedTask) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm transition-all">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden">
          {/* Enhanced Modal Header */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <FileCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Task Review
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Review and provide feedback for task completion</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left Column - Task Details */}
            <div className="flex-1 px-8 py-6 border-r border-gray-200">
              {/* Task Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight pr-4">
                    {selectedTask.title}
                  </h2>
                  {getReviewStatusBadge(selectedTask.review_status)}
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{selectedTask.company || "Not specified"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span>{selectedTask.department || "Not specified"}</span>
                  </div>
                  {selectedTask.created_at && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(selectedTask.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Task Description */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Clipboard className="mr-3 h-5 w-5 text-blue-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedTask.description}</p>
                </div>
              </div>

              {/* Task Details Grid */}
              <div className="space-y-6">
                {selectedTask.contribution && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="mr-3 h-5 w-5 text-green-600" />
                      Contribution
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedTask.contribution}</p>
                  </div>
                )}

                {selectedTask.achieved_deliverables && (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-orange-600" />
                      Achieved Deliverables
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedTask.achieved_deliverables}</p>
                  </div>
                )}

                {selectedTask.related_project && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Target className="mr-3 h-5 w-5 text-purple-600" />
                      Related Project
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedTask.related_project}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Review Actions */}
            <div className="w-full lg:w-96 bg-gray-50 px-8 py-6">
              <div className="sticky top-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield className="mr-3 h-5 w-5 text-gray-600" />
                  Review Actions
                </h3>

                {/* Already Reviewed Notice */}
                {selectedTask.reviewed ? (
                  <div className="space-y-6">
                    <div className="border-l-4 border-amber-500 bg-amber-50 p-6 rounded-r-xl shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-800 mb-2">
                            Task Already Reviewed
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-700">Status:</span>
                              {getReviewStatusBadge(selectedTask.review_status)}
                            </div>
                            {selectedTask.reviewed_at && (
                              <div className="flex items-start space-x-2">
                                <span className="font-medium text-gray-700 mt-0.5">Reviewed:</span>
                                <span className="text-amber-700">
                                  {formatDateTime(selectedTask.reviewed_at)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Comments */}
                    {selectedTask.comment && Array.isArray(selectedTask.comment) && selectedTask.comment.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
                          Reviewer Comments
                        </h4>
                        <div className="space-y-2">
                          {selectedTask.comment.map((commentText, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                              {commentText}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Display */}
                    {error && (
                      <div className="border-l-4 border-rose-500 bg-rose-50 p-4 rounded-r-xl">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-rose-800">{error}</p>
                        </div>
                      </div>
                    )}

                    {/* Review Status Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Review Decision
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all cursor-pointer group">
                          <input
                            type="radio"
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            name="reviewStatus"
                            value="approved"
                            checked={reviewStatus === "approved"}
                            onChange={() => setReviewStatus("approved")}
                          />
                          <div className="ml-3 flex items-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700">
                              Approve Task
                            </span>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-rose-300 transition-all cursor-pointer group">
                          <input
                            type="radio"
                            className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300"
                            name="reviewStatus"
                            value="rejected"
                            checked={reviewStatus === "rejected"}
                            onChange={() => setReviewStatus("rejected")}
                          />
                          <div className="ml-3 flex items-center">
                            <AlertCircle className="h-5 w-5 text-rose-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-rose-700">
                              Reject Task
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Comment Section */}
                    <div>
                      <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        Add Review Comment
                      </label>
                      <Textarea
                        id="comment"
                        rows={4}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Share your feedback about this task..."
                        value={comment}
                        onChange={(e) => setcomment(e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className={`w-full inline-flex justify-center items-center px-6 py-3 font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                          reviewStatus === "approved"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500"
                            : "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500"
                        }`}
                      >
                        {reviewLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting Review...
                          </>
                        ) : (
                          <>
                            {reviewStatus === "approved" ? (
                              <CheckCircle className="mr-3 h-5 w-5" />
                            ) : (
                              <AlertCircle className="mr-3 h-5 w-5" />
                            )}
                            Submit Review
                          </>
                        )}
                      </button>
                    </div>

                    {/* Help Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Review Guidelines</p>
                          <p>Carefully review all task details and provide constructive feedback to help improve future performance.</p>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* Close Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full inline-flex justify-center items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskReviewModal