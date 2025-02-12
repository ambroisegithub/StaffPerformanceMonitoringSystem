// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchTaskReviewDetails, reviewTask, ReviewStatus } from "../../../../Redux/Slices/taskReviewSlice1"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Badge } from "../../../ui/Badge"
import { Textarea } from "../../../ui/textarea"
import { Separator } from "../../../ui/separator"
import { Loader2, User, Calendar, Building, CheckCircle2, XCircle, MapPin, Paperclip, X } from "lucide-react"
import { format } from "date-fns"

interface TaskReviewDetailsProps {
  taskId: number | null
  onClose: () => void
  supervisorId: number | null
}

const TaskReviewDetails: React.FC<TaskReviewDetailsProps> = ({ taskId, onClose, supervisorId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { taskDetails, detailsLoading, loading } = useSelector((state: RootState) => state.taskReview)
  const [reviewComment, setReviewComment] = useState("")

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskReviewDetails(taskId))
    }
  }, [dispatch, taskId])

  const handleReview = (status: ReviewStatus) => {
    if (!taskId || !supervisorId) return

    dispatch(
      reviewTask({
        taskId,
        reviewStatus: status,
        comment: reviewComment,
        supervisorId,
      }),
    )

    setReviewComment("")
  }

  if (!taskId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Select a task to view details</p>
        </CardContent>
      </Card>
    )
  }

  if (detailsLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (!taskDetails) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Task details not found</p>
        </CardContent>
      </Card>
    )
  }

  const { task, reviewerDetails } = taskDetails

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const isReviewed = task.review_status !== ReviewStatus.PENDING

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Task #{task.id}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Employee</h3>
            <div className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <span>
                {task.created_by.firstName} {task.created_by.lastName}
              </span>
              <Badge variant="outline">{task.created_by.supervisoryLevel}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Due Date</h3>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span>{formatDate(task.due_date)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1">Company</h3>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-muted-foreground" />
                <span>{task.company_served.name}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm">{task.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Contribution</h3>
            <p className="text-sm">{task.contribution || "No contribution provided"}</p>
          </div>

          {task.related_project && (
            <div>
              <h3 className="text-sm font-medium mb-1">Related Project</h3>
              <p className="text-sm">{task.related_project}</p>
            </div>
          )}

          {task.achieved_deliverables && (
            <div>
              <h3 className="text-sm font-medium mb-1">Achieved Deliverables</h3>
              <p className="text-sm">{task.achieved_deliverables}</p>
            </div>
          )}

          {task.location_name && (
            <div>
              <h3 className="text-sm font-medium mb-1">Location</h3>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{task.location_name}</span>
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-1">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((attachment, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    <Paperclip size={14} />
                    <span>Attachment {index + 1}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-2">Review Status</h3>
          <div className="flex items-center gap-2">
            {task.review_status === ReviewStatus.PENDING && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Pending Review
              </Badge>
            )}
            {task.review_status === ReviewStatus.APPROVED && (
              <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle2 size={14} />
                Approved
              </Badge>
            )}
            {task.review_status === ReviewStatus.REJECTED && (
              <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle size={14} />
                Rejected
              </Badge>
            )}

            {isReviewed && reviewerDetails && (
              <span className="text-sm text-muted-foreground">
                by {reviewerDetails.name} on {formatDate(task.reviewed_at || "")}
              </span>
            )}
          </div>
        </div>

        {task.comments && task.comments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Comments</h3>
            <div className="space-y-2">
              {task.comments.map((comment, index) => (
                <div key={index} className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isReviewed && supervisorId && (
          <div>
            <h3 className="text-sm font-medium mb-2">Add Review Comment</h3>
            <Textarea
              placeholder="Enter your review comments..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => handleReview(ReviewStatus.REJECTED)}
                disabled={loading}
                className="flex items-center gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle size={16} />}
                Reject
              </Button>
              <Button
                onClick={() => handleReview(ReviewStatus.APPROVED)}
                disabled={loading}
                className="flex items-center gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 size={16} />}
                Approve
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskReviewDetails

