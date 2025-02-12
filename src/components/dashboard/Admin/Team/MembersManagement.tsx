"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllUsers, addTeamMembers, removeTeamMembers } from "../../../../Redux/Slices/teamManagementSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"
import  Checkbox  from "../../../ui/checkbox"
import { Avatar, AvatarFallback } from "../../../ui/avatar"
import { Badge } from "../../../ui/Badge"
import { X, Search, UserPlus, UserMinus, Loader2 } from "lucide-react"

interface MembersManagementProps {
  onClose: () => void
}

const MembersManagement: React.FC<MembersManagementProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedTeam, users, isAddingMembers, isRemovingMembers } = useSelector(
    (state: RootState) => state.teamManagement,
  )

  const [activeTab, setActiveTab] = useState("current")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectedMembers, setSelectedMembers] = useState<number[]>([])

  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  if (!selectedTeam) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No team selected</p>
        </CardContent>
      </Card>
    )
  }

  // Get current team members
  const currentMemberIds = selectedTeam.members.map((member) => member.id)

  // Filter users who are not already in the team
  const availableUsers = users.filter((user) => !currentMemberIds.includes(user.id))

  // Filter based on search term
  const filteredAvailableUsers = availableUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCurrentMembers = selectedTeam.members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddMembers = () => {
    if (selectedUsers.length > 0 && selectedTeam) {
      dispatch(
        addTeamMembers({
          teamId: selectedTeam.id,
          memberIds: selectedUsers,
        }),
      )
      setSelectedUsers([])
    }
  }

  const handleRemoveMembers = () => {
    if (selectedMembers.length > 0 && selectedTeam) {
      dispatch(
        removeTeamMembers({
          teamId: selectedTeam.id,
          memberIds: selectedMembers,
        }),
      )
      setSelectedMembers([])
    }
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl">Manage Team Members</CardTitle>
          <CardDescription>{selectedTeam.name}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Members ({selectedTeam.members.length})</TabsTrigger>
            <TabsTrigger value="add">Add Members</TabsTrigger>
          </TabsList>

          <div className="relative w-full mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <TabsContent value="current" className="space-y-4">
            {selectedTeam.members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members in this team</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">{selectedMembers.length} members selected</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveMembers}
                    disabled={selectedMembers.length === 0 || isRemovingMembers}
                    className="flex items-center gap-1"
                  >
                    {isRemovingMembers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                    Remove Selected
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredCurrentMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => toggleMemberSelection(member.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            {availableUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available users to add</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">{selectedUsers.length} users selected</h3>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddMembers}
                    disabled={selectedUsers.length === 0 || isAddingMembers}
                    className="flex items-center gap-1"
                  >
                    {isAddingMembers ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    Add Selected
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No users found</p>
                    </div>
                  ) : (
                    filteredAvailableUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {user.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default MembersManagement

