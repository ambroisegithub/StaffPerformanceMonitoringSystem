// @ts-nocheck

"use client"

import React from "react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  selectSelectedTask,
  selectReviewLoading,
  clearSelectedTask,
  reviewTask,
  fetchAdminTeamTasks,
  selectFilters,
  selectPagination,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { formatDateTime } from "../../../../utilis/dateUtils"
import { motion } from "framer-motion"
import { Badge } from "../../../ui/Badge"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Building,
  Briefcase,
  User,
  Calendar,
  MessageSquare,
  X,
  Loader,
} from "lucide-react"

interface TeamTaskReviewModalProps {
  isOpen: boolean
  onClose: () => void
  adminId: number | null
}

const TeamTaskReviewModal: React.FC<TeamTaskReviewModalProps> = ({ isOpen, onClose, adminId }) => {
  const dispatch = useAppDispatch()
  const selectedTask = useAppSelector(selectSelectedTask)
  const reviewLoading = useAppSelector(selectReviewLoading)
  const filters = useAppSelector(selectFilters)
  const pagination = useAppSelector(selectPagination)
  const user = useAppSelector((state: { login: { user: any } }) => state.login.user)

  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved")
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")

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
      await dispatch(
        reviewTask({
          taskId: selectedTask.id,
          status: reviewStatus,
          comment: comment.trim() || undefined,
          reviewedBy: user.id, // Use logged-in user's ID
        }),
      ).unwrap()

      // Refresh the task list
      if (user.id) {
        dispatch(
          fetchAdminTeamTasks({
            userId: user.id,
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

  if (!isOpen || !selectedTask) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r px-6 py-5 text-black">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold mb-1">Task Review</h3>
            <p className="text-black text-sm">Review and approve or reject the submitted task</p>
          </div>

          {/* Content area with increased height */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {/* Task header */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
              <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedTask.title}</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                {selectedTask.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    <span>{selectedTask.company}</span>
                  </div>
                )}

                {selectedTask.department && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    <span>{selectedTask.department}</span>
                  </div>
                )}

                {selectedTask.created_by && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    <span>By {selectedTask.created_by.name}</span>
                  </div>
                )}

                {selectedTask.created_at && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    <span>{formatDateTime(selectedTask.created_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Task content */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h5 className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <FileText className="h-4 w-4 mr-2 text-green-500" />
                  Description
                </h5>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Contribution */}
              {selectedTask.contribution && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    Contribution
                  </h5>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedTask.contribution}</p>
                </div>
              )}

              {/* Deliverables */}
              {selectedTask.achieved_deliverables && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <CheckCircle className="h-4 w-4 mr-2 text-purple-500" />
                    Achieved Deliverables
                  </h5>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {selectedTask.achieved_deliverables}
                  </p>
                </div>
              )}

              {/* Related Project */}
              {selectedTask.related_project && (
                <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Related Project</div>
                    <div className="text-gray-700 dark:text-gray-300">{selectedTask.related_project}</div>
                  </div>
                </div>
              )}

              {/* Already reviewed message */}
              {selectedTask.reviewed ? (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        This task has already been reviewed
                      </h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                        <p className="space-y-1">
                          <span className="block">
                            <span className="font-medium">Status:</span>
                            <Badge
                              className={`ml-2 ${
                                selectedTask.review_status === "approved"
                                  ? "bg-green text-white dark:bg-green-900/60 dark:text-green-300"
                                  : "bg-red text-white dark:bg-red-900/60 dark:text-red-300"
                              }`}
                            >
                              {selectedTask.review_status}
                            </Badge>
                          </span>
                          <span className="block">
                            <span className="font-medium">Reviewed at:</span>{" "}
                            {selectedTask.reviewed_at ? formatDateTime(selectedTask.reviewed_at) : "N/A"}
                          </span>
                          {selectedTask.review_comment && (
                            <span className="block">
                              <span className="font-medium">Comment:</span> {selectedTask.review_comment}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6 bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {error && (
                    <div className="border dark:bg-red-900/30 border-l-4 border-red p-4 rounded-r-lg">
                      <div className="flex">
                        <XCircle className="h-5 w-5 text-red flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-red dark:text-red-300">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Review Status
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label
                        className={`flex items-center border rounded-lg p-3 cursor-pointer transition-colors ${
                          reviewStatus === "approved"
                            ? "bg-green border-green dark:bg-green-900/30 dark:border-green-700"
                            : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          className="h-4 w-4 text-white focus:ring-green"
                          name="reviewStatus"
                          value="approved"
                          checked={reviewStatus === "approved"}
                          onChange={() => setReviewStatus("approved")}
                          hidden
                        />
                        <CheckCircle
                          className={`h-5 w-5 mr-2 ${reviewStatus === "approved" ? "text-white" : "text-gray-400"}`}
                        />
                        <span
                          className={`font-medium ${
                            reviewStatus === "approved"
                              ? "text-white dark:text-green-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Approve
                        </span>
                      </label>

                      <label
                        className={`flex items-center border rounded-lg p-3 cursor-pointer transition-colors ${
                          reviewStatus === "rejected"
                            ? "bg-red border-red dark:bg-red-900 dark:border-red-700"
                            : "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          className="h-4 w-4 text-red-600 focus:ring-red"
                          name="reviewStatus"
                          value="rejected"
                          checked={reviewStatus === "rejected"}
                          onChange={() => setReviewStatus("rejected")}
                          hidden
                        />
                        <XCircle
                          className={`h-5 w-5 mr-2 ${reviewStatus === "rejected" ? "text-white" : "text-gray-500"}`}
                        />
                        <span
                          className={`font-medium ${
                            reviewStatus === "rejected"
                              ? "text-white dark:text-red"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          Reject
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                      Comments
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green text-gray-900 dark:text-gray-100"
                      placeholder="Add your feedback or reasons for approval/rejection..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
            >
              Close
            </button>

            {!selectedTask.reviewed && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={reviewLoading}
                className={`w-full sm:w-auto px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white
                  ${
                    reviewStatus === "approved"
                      ? "bg-green hover:bg-green focus:ring-green"
                      : "bg-red hover:bg-red focus:ring-red"
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                  flex items-center justify-center
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {reviewLoading ? (
                  <>
                    <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Submitting...
                  </>
                ) : (
                  <>
                    {reviewStatus === "approved" ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {reviewStatus === "approved" ? "Approve Task" : "Reject Task"}
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default TeamTaskReviewModal

