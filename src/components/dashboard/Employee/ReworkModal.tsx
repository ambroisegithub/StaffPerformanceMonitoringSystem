// @ts-nocheck
"use client"

import React from "react"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { reworkTask, fetchDailyTasks } from "../../../Redux/Slices/TaskSlices"
import TaskModal from "./TaskModal"
import { FaExchangeAlt, FaRedo } from "react-icons/fa"

interface Task {
  id: number
  title: string
  description: string
  contribution: string
  status: string
  due_date: string
  related_project: string
  achieved_deliverables: string
  review_status?: string
  workDaysCount?: number
  originalDueDate?: string
  lastShiftedDate?: string
  isShifted?: boolean
}

interface ReworkModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
}

const ReworkModal: React.FC<ReworkModalProps> = ({ isOpen, onClose, task }) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)

  const handleReworkSubmit = async (taskData: any) => {
    if (!task || !user) return

    try {
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

      // Add task ID and shifted flag if applicable
      formData.append("taskId", task.id.toString())
      if (task.isShifted) {
        formData.append("isShifted", "true")
        formData.append("originalDueDate", task.originalDueDate || task.due_date)
      }

      await dispatch(
        reworkTask({
          taskId: task.id,
          formData,
        })
      ).unwrap()

      await dispatch(fetchDailyTasks(user.id))
      onClose()
    } catch (error) {
      console.error("Rework submission error:", error)
      throw error
    }
  }

  // Return null if task is not provided
  if (!task) return null

  return (
    <TaskModal 
      isOpen={isOpen} 
      onClose={onClose} 
      onSubmit={handleReworkSubmit} 
      mode="rework" 
      initialData={task}
      title={task.isShifted ? "Continue Shifted Task" : "Rework Task"}
      submitText={task.isShifted ? "Continue Task" : "Rework Task"}
      submitIcon={task.isShifted ? <FaExchangeAlt /> : <FaRedo />}
    />
  )
}

export default ReworkModal