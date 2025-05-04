"use client"

import React from "react"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { reworkTask, fetchDailyTasks } from "../../../Redux/Slices/TaskSlices"
import TaskModal from "./TaskModal"

interface ReworkModalProps {
  isOpen: boolean
  onClose: () => void
  task: any
}

const ReworkModal: React.FC<ReworkModalProps> = ({ isOpen, onClose, task }) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)

  const handleReworkSubmit = async (taskData: any) => {
    if (!task || !user) return

    try {
      // Create FormData for rework submission
      const formData = new FormData()

      // Append all form fields
      Object.keys(taskData).forEach((key) => {
        if (key !== "attached_documents") {
          formData.append(key, taskData[key])
        }
      })

      // Append files if any
      if (taskData.attached_documents && taskData.attached_documents.length > 0) {
        taskData.attached_documents.forEach((file: File) => {
          formData.append("documents", file)
        })
      }

      // Add task ID for rework
      formData.append("taskId", task.id.toString())

      // Dispatch rework action
      await dispatch(
        reworkTask({
          taskId: task.id,
          formData,
        }),
      ).unwrap()

      // Refresh daily tasks
      await dispatch(fetchDailyTasks(user.id))

      onClose()
    } catch (error) {
      console.error("Rework submission error:", error)
      throw error
    }
  }

  return <TaskModal isOpen={isOpen} onClose={onClose} onSubmit={handleReworkSubmit} mode="rework" initialData={task} />
}

export default ReworkModal
