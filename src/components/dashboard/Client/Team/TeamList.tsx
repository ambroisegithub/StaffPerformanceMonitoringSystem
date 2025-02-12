"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppDispatch } from "../../../../Redux/hooks"
import { setSelectedTask } from "../../../../Redux/Slices/TaskReviewSlice"
import { ChevronDown, ChevronRight, Users, Shield, CheckCircle, Clock, AlertCircle, Search, Filter } from "lucide-react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Badge } from "../../../ui/Badge"
import { Input } from "../../../ui/input"
import TeamTaskCard from "./TeamTaskCard"

interface TeamListProps {
  teamTasks: any[]
  loading: boolean
  onOpenReviewModal: () => void
}

const TeamList: React.FC<TeamListProps> = ({ teamTasks, loading, onOpenReviewModal }) => {
  const dispatch = useAppDispatch()
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  // Initialize all teams as collapsed by default
  useEffect(() => {
    if (teamTasks.length > 0) {
      const initialExpandedState: Record<string, boolean> = {}
      teamTasks.forEach((team) => {
        initialExpandedState[team.team] = false
      })
      setExpandedTeams(initialExpandedState)
    }
  }, [teamTasks])

  const toggleTeamExpanded = (teamName: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }))
  }

  const handleSelectTask = (task: any) => {
    dispatch(setSelectedTask(task))
    onOpenReviewModal()
  }

  // Filter tasks based on search term
  const filteredTeamTasks =
    searchTerm.trim() === ""
      ? teamTasks
      : teamTasks
          .map((team) => {
            // Filter tasks that match the search term
            const filteredTasks = team.tasks.filter(
              (task: any) =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.related_project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.created_by?.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )

            // Only include team if it has matching tasks
            if (filteredTasks.length > 0) {
              return {
                ...team,
                tasks: filteredTasks,
              }
            }
            return null
          })
          .filter(Boolean)

  // Calculate task statistics for each team
  const getTeamStats = (tasks: any[]) => {
    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 }

    tasks.forEach((task) => {
      stats.total++

      if (task.review_status === "approved") {
        stats.approved++
      } else if (task.review_status === "rejected") {
        stats.rejected++
      } else {
        stats.pending++
      }
    })

    return stats
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredTeamTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-4">
          <Filter className="h-16 w-16 text-gray-300" />
        </div>
        <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
        <p className="text-gray-500 mt-2">There are no tasks that match your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search tasks within teams..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-green text-white" : "bg-white text-gray-500"}`}
              title="List View"
            >
              <Users className="h-5 w-5" />
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-green text-white" : "bg-white text-gray-500"}`}
              title="Grid View"
            >
              <Shield className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        {filteredTeamTasks.map((teamData) => {
          const isTeamExpanded = expandedTeams[teamData.team] === true
          const teamStats = getTeamStats(teamData.tasks)

          return (
            <motion.div
              key={teamData.team}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleTeamExpanded(teamData.team)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {isTeamExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{teamData.team}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      <span>Supervisor: {teamData.supervisor?.name || "Unknown"}</span>
                      <span className="mx-1.5">•</span>
                      <span>Role: {teamData.supervisor?.role || "Unknown"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Task Statistics */}
                  <div className="hidden md:flex items-center gap-2">
                    <Badge className="bg-blue text-white border-blue">
                      <Clock className="h-3 w-3 mr-1" />
                      {teamStats.pending} pending
                    </Badge>
                    <Badge className="bg-green text-white border-green">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {teamStats.approved} approved
                    </Badge>
                    <Badge className="bg-red text-white border-red">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {teamStats.rejected} rejected
                    </Badge>
                  </div>

                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                    {teamData.tasks.length} task{teamData.tasks.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>

              <AnimatePresence>
                {isTeamExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Mobile Task Statistics */}
                    <div className="md:hidden flex items-center justify-center gap-2 p-3 bg-gray-50 border-t border-gray-200">
                      <Badge className="bg-blue text-white border-blue">
                        <Clock className="h-3 w-3 mr-1" />
                        {teamStats.pending} pending
                      </Badge>
                      <Badge className="bg-green text-white border-green">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {teamStats.approved} approved
                      </Badge>
                      <Badge className="bg-red text-white border-red">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {teamStats.rejected} rejected
                      </Badge>
                    </div>

                    {/* Tasks */}
                    <div className="p-4 border-t border-gray-200">
                      {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {teamData.tasks.map((task: any) => (
                            <TeamTaskCard key={task.id} task={task} onSelect={() => handleSelectTask(task)} />
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Title
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                >
                                  Created By
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                                >
                                  Company
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell"
                                >
                                  Project
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Status
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {teamData.tasks.map((task: any) => (
                                <tr key={task.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{task.created_by?.name || "Unknown"}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                    <div className="text-sm text-gray-900">{task.company || "N/A"}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                                    <div className="text-sm text-gray-900">{task.related_project || "N/A"}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {task.review_status === "approved" ? (
                                      <Badge className="bg-green text-white">Approved</Badge>
                                    ) : task.review_status === "rejected" ? (
                                      <Badge className="bg-red text-white">Rejected</Badge>
                                    ) : (
                                      <Badge className="bg-blue text-white">Pending</Badge>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      onClick={() => !task.reviewed && handleSelectTask(task)}
                                      disabled={task.reviewed}
                                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                                        task.reviewed
                                          ? "bg-gray-400 text-white cursor-not-allowed"
                                          : "bg-green text-white hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
                                      }`}
                                    >
                                      {task.reviewed ? (
                                        <>
                                          {/* <FaEye className="text-green mr-2" /> */}
                                          <span className="font-medium">Reviewed</span>
                                        </>
                                      ) : (
                                        <>
                                          {/* <FaEyeSlash className="text-red mr-2" /> */}
                                          <span className="font-medium">Not Reviewed</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default TeamList

