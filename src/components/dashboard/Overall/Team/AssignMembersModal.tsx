
// @ts-nocheck

"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { assignUsersToTeams, fetchAllUsers, removeTeamMembers } from "../../../../Redux/Slices/teamManagementSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { store } from "../../../../Redux/store"
import type { Team } from "../../../../Redux/Slices/teamManagementSlice"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import  Checkbox  from "../../../ui/checkbox"
import { Search, Loader2, UserPlus, ChevronLeft, ChevronRight, AlertTriangle, Info, UserMinus } from "lucide-react"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../ui/dialog"
import { Badge } from "../../../ui/Badge"
import { Alert, AlertDescription } from "../../../ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"
import { fetchTeams } from "../../../../Redux/Slices/teamSlice"

interface AssignMembersModalProps {
  team: Team
  onClose: () => void
}

const AssignMembersModal: React.FC<AssignMembersModalProps> = ({ team, onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, isAddingMembers, isRemovingMembers } = useSelector((state: RootState) => state.teamManagement)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [roleFilter, setRoleFilter] = useState<string | "all">("all")
  const [activeTab, setActiveTab] = useState("assign")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Get existing member IDs to filter them out
  const existingMemberIds = team.members.map((member) => member.id)

  // Get supervisor information
  const supervisorRole = team.supervisor.role
  const supervisorLevel = Number.parseInt(team.supervisor.level || "0", 10)
  const isOverallSupervisor = supervisorRole === "overall"

  // Filter eligible users based on hierarchy (for assigning)
  const eligibleUsers = useMemo(() => {
    return users.filter((user) => {
      // Don't show users already in the team
      if (existingMemberIds.includes(user.id)) {
        return false
      }

      // Overall supervisors can see all users
      if (isOverallSupervisor) {
        return true
      }

      // Normal supervisors cannot see overall users
      if (user.role === "overall") {
        return false
      }

      // Level-based filtering
      const userLevel = Number.parseInt(user.level || "0", 10)

      // Higher level supervisors can only see lower level users
      if (supervisorLevel > 0 && userLevel > 0) {
        return userLevel < supervisorLevel
      }

      return true
    })
  }, [users, existingMemberIds, isOverallSupervisor, supervisorLevel])

  // Filter current team members (for removing)
  const currentTeamMembers = useMemo(() => {
    return team.members.filter((member) => {
      // Filter by search term
      const matchesSearch =
        member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.firstName && member.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (member.lastName && member.lastName.toLowerCase().includes(searchTerm.toLowerCase()))

      // Filter by role
      const matchesRole = roleFilter === "all" || member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [team.members, searchTerm, roleFilter])

  // Apply search and role filters for assign tab
  const filteredUsers = useMemo(() => {
    return eligibleUsers.filter((user) => {
      const matchesSearch =
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRole = roleFilter === "all" || user.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [eligibleUsers, searchTerm, roleFilter])

  // Get unique roles for filtering
  const availableRoles = useMemo(() => {
    const roles = new Set<string>()
    if (activeTab === "assign") {
      eligibleUsers.forEach((user) => {
        if (user.role) roles.add(user.role)
      })
    } else {
      currentTeamMembers.forEach((member) => {
        if (member.role) roles.add(member.role)
      })
    }
    return Array.from(roles)
  }, [eligibleUsers, currentTeamMembers, activeTab])

  // Calculate pagination based on active tab
  const currentData = activeTab === "assign" ? filteredUsers : currentTeamMembers
  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = currentData.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(currentData.length / itemsPerPage)

  useEffect(() => {
    // Reset to first page when search term, role filter, or tab changes
    setCurrentPage(1)
    setSelectedUserIds([])
  }, [searchTerm, roleFilter, activeTab])

  useEffect(() => {
    // Fetch users if not already loaded
    if (users.length === 0) {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, users.length])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value as string | "all")
  }

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAll = () => {
    if (selectedUserIds.length === currentUsers.length) {
      // If all are selected, deselect all
      setSelectedUserIds((prev) => prev.filter((id) => !currentUsers.map((user) => user.id).includes(id)))
    } else {
      // Otherwise, select all current page users
      const currentUserIds = currentUsers.map((user) => user.id)
      setSelectedUserIds((prev) => {
        const existingIds = prev.filter((id) => !currentUserIds.includes(id))
        return [...existingIds, ...currentUserIds]
      })
    }
  }

  const handleAssignUsers = async () => {
    if (selectedUserIds.length === 0) return;
  
    const state = store.getState() as RootState;
    const organizationId = state.login.user?.organization?.id;
  
    if (!organizationId) {
      return;
    }
  
    await dispatch(
      assignUsersToTeams({
        teamId: team.id,
        userIds: selectedUserIds,
        organizationId,
      })
    );
  
    onClose();
  };

  const handleRemoveUsers = async () => {
    if (selectedUserIds.length === 0) return;
  
    await dispatch(
      removeTeamMembers({
        teamId: team.id,
        memberIds: selectedUserIds,
      })
    );
    await dispatch(fetchTeams());
  
    onClose();
  };

  const isAllCurrentSelected =
    currentUsers.length > 0 && currentUsers.every((user) => selectedUserIds.includes(user.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-[40%] bg-white rounded-xl shadow-2xl overflow-hidden px-10 py-10">
        <DialogHeader>
          <DialogTitle>
            {activeTab === "assign" ? "Assign Members to " : "Remove Members from "} 
            {team.name}
          </DialogTitle>
          <DialogDescription>
            {activeTab === "assign" 
              ? "Select users to add to this team. Users already in the team are not shown."
              : "Select users to remove from this team."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Supervisor info and filtering rules */}
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <span className="font-medium">Team Supervisor:</span> {team.supervisor.firstName}{" "}
                {team.supervisor.lastName}
                {team.supervisor.level && (
                  <Badge className="ml-2 bg-blue text-white" variant="outline">
                    Level {team.supervisor.level}
                  </Badge>
                )}
                {team.supervisor.role && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800" variant="outline">
                    {team.supervisor.role}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isOverallSupervisor
                  ? "As an overall supervisor, you can manage any user in this team."
                  : `You can only manage users with level lower than ${supervisorLevel || "yours"}.`}
              </div>
            </AlertDescription>
          </Alert>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assign">Assign Members</TabsTrigger>
              <TabsTrigger value="remove">Remove Members</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center mb-4 gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={handleSearchChange} />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All roles</option>
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>

          {/* User list */}
          {currentData.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <AlertTriangle className="h-8 w-8 text-yellow mx-auto mb-2" />
              <p className="text-gray-500">
                {activeTab === "assign" 
                  ? "No eligible users found" 
                  : "No team members found"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "assign" && eligibleUsers.length === 0
                  ? "There are no users that can be assigned to this team based on level hierarchy."
                  : "Try adjusting your search filters."}
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center">
                <Checkbox id="select-all" checked={isAllCurrentSelected} onCheckedChange={handleSelectAll} />
                <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                  Select All on This Page
                </label>
                <div className="ml-auto text-sm text-gray-500">{selectedUserIds.length} selected</div>
              </div>

              <div className="divide-y">
                {currentUsers.map((user) => (
                  <div key={user.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label htmlFor={`user-${user.id}`} className="ml-3 flex-1 cursor-pointer">
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </label>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-gray-100 text-gray-800">{user.role}</Badge>
                      {user.level && (
                        <Badge variant="outline" className="text-xs">
                          Level {user.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              <div className="bg-gray-50 px-4 py-2 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, currentData.length)} of{" "}
                  {currentData.length} users
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, and pages around current page
                    let pageToShow = i + 1
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageToShow = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i
                      } else {
                        pageToShow = currentPage - 2 + i
                      }
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="hover:bg-white">
            Cancel
          </Button>
          {activeTab === "assign" ? (
            <Button
              onClick={handleAssignUsers}
              disabled={selectedUserIds.length === 0 || isAddingMembers}
              className="bg-green text-white hover:bg-green-600"
            >
              {isAddingMembers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign {selectedUserIds.length} Users
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRemoveUsers}
              disabled={selectedUserIds.length === 0 || isRemovingMembers}
              className="bg-red-600 text-white hover:bg-red-600"
            >
              {isRemovingMembers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove {selectedUserIds.length} Users
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </div>
    </div>
  )
}

export default AssignMembersModal