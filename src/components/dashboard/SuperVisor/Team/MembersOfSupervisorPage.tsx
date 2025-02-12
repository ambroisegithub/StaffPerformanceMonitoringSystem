"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../../Redux/hooks"
import {
  fetchSupervisorTeamMembers,
  selectSupervisorTeamData,
  selectTeamMembersLoading,
  selectTeamMembersError,
  type Team,
  type TeamMember,
} from "../../../../Redux/Slices/TaskReviewSlice"
import { getSupervisorId } from "../../../../utilis/auth"
import withSupervisorAuth from "../../../Auth/withSupervisorAuth"
import Loader from "../../../ui/Loader"
// Icons
import {
  ChevronDown,
  ChevronUp,
  Search,
  UserPlus,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Info,
  User,
  X,
} from "lucide-react"
import React from "react"

const MembersOfSupervisorPage = () => {
  const dispatch = useAppDispatch()
  const supervisorTeamData = useAppSelector(selectSupervisorTeamData)
  const loading = useAppSelector(selectTeamMembersLoading)
  const error = useAppSelector(selectTeamMembersError)
  const [supervisorId, setSupervisorId] = useState<number | null>(null)

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [teamSearchTerm, setTeamSearchTerm] = useState("")
  const [showTeamInfo, setShowTeamInfo] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string | null
    direction: "ascending" | "descending" | null
  }>({ key: null, direction: null })
  const [filterRole, setFilterRole] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const id = getSupervisorId()
    if (id) {
      setSupervisorId(id)
      dispatch(fetchSupervisorTeamMembers(id))
    }
  }, [dispatch])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterRole, sortConfig, selectedTeamId])

  useEffect(() => {
    if (supervisorTeamData?.teams && supervisorTeamData.teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(supervisorTeamData.teams[0].id)
    }
  }, [supervisorTeamData, selectedTeamId])

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending"

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending"
      } else if (sortConfig.direction === "descending") {
        direction = null
      }
    }

    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return (
        <span className="ml-1 opacity-0 group-hover:opacity-50">
          <ChevronDown size={16} />
        </span>
      )
    }

    if (sortConfig.direction === "ascending") {
      return (
        <span className="ml-1">
          <ChevronUp size={16} />
        </span>
      )
    }

    if (sortConfig.direction === "descending") {
      return (
        <span className="ml-1">
          <ChevronDown size={16} />
        </span>
      )
    }

    return (
      <span className="ml-1 opacity-50">
        <ChevronDown size={16} />
      </span>
    )
  }

  const getSelectedTeam = (): Team | undefined => {
    return supervisorTeamData?.teams?.find((team) => team.id === selectedTeamId)
  }

  const getTeamMembers = (): TeamMember[] => {
    const team = getSelectedTeam()
    return team?.members || []
  }

  const filteredTeams = () => {
    if (!supervisorTeamData?.teams) return []

    if (!teamSearchTerm) return supervisorTeamData.teams

    return supervisorTeamData.teams.filter(
      (team) =>
        team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(teamSearchTerm.toLowerCase()),
    )
  }

  const filteredAndSortedMembers = () => {
    const members = getTeamMembers()
    if (!members || members.length === 0) return []

    // First filter by search term
    let filtered = members.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase()
      const email = member.email.toLowerCase()
      const username = member.username.toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      return fullName.includes(searchLower) || email.includes(searchLower) || username.includes(searchLower)
    })

    // Then filter by role if set
    if (filterRole) {
      filtered = filtered.filter((member) => member.role === filterRole)
    }

    // Then sort if configured
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }

  // Get current page of items
  const paginateMembers = (members: any[]) => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return members.slice(indexOfFirstItem, indexOfLastItem)
  }

  const totalPages = Math.ceil(filteredAndSortedMembers().length / itemsPerPage)

  const renderRoleBadge = (role: string) => {
    let bgColor = "bg-gray-200 text-gray-800"

    if (role === "supervisor") {
      bgColor = "bg-blue text-white"
    } else if (role === "employee") {
      bgColor = "bg-green text-white"
    }

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>{role}</span>
  }

  const getUniqueRoles = () => {
    const members = getTeamMembers()
    return members ? [...new Set(members.map((member) => member.role))] : []
  }

  const renderPagination = () => {
    const pageNumbers = []

    // Logic for displaying page numbers
    const maxPageNumbersToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPageNumbersToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPageNumbersToShow - 1)

    if (endPage - startPage + 1 < maxPageNumbersToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPageNumbersToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return (
      <div className="flex items-center mt-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`p-2 rounded-md mx-1 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          <ChevronLeft size={16} />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1 rounded-md mx-1 hover:bg-gray-200 ${currentPage === 1 ? "bg-blue text-white" : ""}`}
            >
              1
            </button>
            {startPage > 2 && <span className="mx-1">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-1 rounded-md mx-1 ${currentPage === number ? "bg-blue text-white" : "hover:bg-gray-200"}`}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`px-3 py-1 rounded-md mx-1 hover:bg-gray-200 ${currentPage === totalPages ? "bg-blue text-white" : ""}`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`p-2 rounded-md mx-1 ${currentPage === totalPages || totalPages === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
        >
          <ChevronRight size={16} />
        </button>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value))
            setCurrentPage(1) // Reset to first page when changing items per page
          }}
          className="ml-4 px-2 py-1 border border-green rounded-md focus:outline-none focus:ring-2 focus:ring-green text-sm"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
      </div>
    )
  }

  const renderTeamInfo = () => {
    const selectedTeam = getSelectedTeam()
    if (!selectedTeam) return null

    // Calculate role distribution
    const members = selectedTeam.members || []
    const roleDistribution = members.reduce(
      (acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4 relative">
        <button
          onClick={() => setShowTeamInfo(false)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} className="text-gray-500" />
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{selectedTeam.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{selectedTeam.description}</p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${selectedTeam.isActive ? "bg-green text-white" : "bg-red text-white"}`}
            >
              {selectedTeam.isActive ? "Active" : "Inactive"}
            </span>
            <span className="ml-4 text-gray-600 text-xs">
              Created: {new Date(selectedTeam.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue mr-2" />
              <div>
                <p className="text-xs text-gray-500">Members</p>
                <p className="text-lg font-bold">{selectedTeam.memberCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 text-green mr-2" />
              <div>
                <p className="text-xs text-gray-500">Supervisor</p>
                <p className="text-sm font-medium truncate">{selectedTeam.supervisor.firstName}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center">
              <UserPlus className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Supervisors</p>
                <p className="text-lg font-bold">{roleDistribution["supervisor"] || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center">
              <User className="h-5 w-5 text-orange-500 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Employees</p>
                <p className="text-lg font-bold">{roleDistribution["employee"] || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Members</h1>
          {supervisorTeamData?.supervisor && (
            <p className="text-gray-600 mt-1">
              Supervised by:{" "}
              <span className="font-medium">
                {supervisorTeamData.supervisor.firstName} {supervisorTeamData.supervisor.lastName}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="border border-red text-red px-4 py-3 rounded-md mb-4 shadow-sm">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && <Loader />}

      {!loading && supervisorTeamData && (
        <>
          {/* Team selection and info */}
          <div className="bg-white rounded-lg shadow-sm mb-4 p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Team</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search teams..."
                    className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue text-sm"
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-auto flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Teams ({filteredTeams().length})</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                  {filteredTeams()
                    .slice(0, 20)
                    .map((team) => (
                      <button
                        key={team.id}
                        onClick={() => {
                          setSelectedTeamId(team.id)
                          setShowTeamInfo(true)
                        }}
                        className={`px-3 py-1 rounded-md text-xs border border-blue font-medium transition-colors ${
                          selectedTeamId === team.id
                            ? "bg-blue text-white border border-blue"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {team.name} ({team.memberCount})
                      </button>
                    ))}
                  {filteredTeams().length > 20 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                      +{filteredTeams().length - 20} more
                    </span>
                  )}
                </div>
              </div>

              {!showTeamInfo && selectedTeamId && (
                <button
                  onClick={() => setShowTeamInfo(true)}
                  className="px-3 py-1 bg-blue text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Info size={16} className="mr-1" />
                  Team Info
                </button>
              )}
            </div>
          </div>

          {/* Team info (collapsible) */}
          {showTeamInfo && renderTeamInfo()}

          {/* Filters and search */}
          <div className="bg-white rounded-lg shadow-sm mb-4 p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email or username..."
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-8 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue"
                    value={filterRole || ""}
                    onChange={(e) => setFilterRole(e.target.value || null)}
                  >
                    <option value="">All roles</option>
                    {getUniqueRoles().map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown size={18} className="text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team members table - ALWAYS VISIBLE */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-md font-semibold text-gray-800">
                {getSelectedTeam()?.name} - Team Members ({filteredAndSortedMembers().length})
              </h3>
              <div className="text-sm text-gray-500">
                {getSelectedTeam()?.isActive ? (
                  <span className="text-green">Active</span>
                ) : (
                  <span className="text-red">Inactive</span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                    >
                      No.
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                      onClick={() => handleSort("firstName")}
                    >
                      <div className="flex items-center">
                        Name
                        {getSortIcon("firstName")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        Username
                        {getSortIcon("username")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {getSortIcon("email")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center">
                        Role
                        {getSortIcon("role")}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                      onClick={() => handleSort("level")}
                    >
                      <div className="flex items-center">
                        Level
                        {getSortIcon("level")}
                      </div>
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedMembers().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-md font-medium">No team members found</p>
                          <p className="text-sm text-gray-400">
                            Try selecting a different team or adjusting your search
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginateMembers(filteredAndSortedMembers()).map((member, index) => {
                      const itemNumber = (currentPage - 1) * itemsPerPage + index + 1
                      return (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-500">
                            {itemNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{member.username}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{renderRoleBadge(member.role)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{member.level}</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredAndSortedMembers().length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers().length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredAndSortedMembers().length}</span> members
                </div>

                {renderPagination()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default withSupervisorAuth(MembersOfSupervisorPage)

