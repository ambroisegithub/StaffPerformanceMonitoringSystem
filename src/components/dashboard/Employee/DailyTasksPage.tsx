// @ts-nocheck

"use client"
import React from "react"
import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks"
import { fetchDailyTasks } from "../../../Redux/Slices/TaskSlices"
import DailyTasksContainer from "./DailyTasksContainer"
import TaskStatistics from "./TaskStatistics"

const DailyTasksPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.login.user)
  const { dailyTasks, loading } = useAppSelector((state) => state.dailytasks)

  useEffect(() => {
    if (user) {
      dispatch(fetchDailyTasks(user.id))
    }
  }, [dispatch, user])

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Daily Tasks Dashboard</h1>

      {/* Statistics */}
      <TaskStatistics dailyTasks={dailyTasks} />

      {/* Daily Tasks */}
      <DailyTasksContainer />
    </div>
  )
}

export default DailyTasksPage

