"use client"

import React from "react"
import { useState } from "react"
import { type HierarchyData, SupervisoryLevel, type User } from "../../types/users"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/tabs"
import { Users, UserPlus, ChevronDown, ChevronRight, UserIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { setSelectedUsers } from "../../../../Redux/Slices/supervisorSlice"
import type { AppDispatch } from "../../../../Redux/store"

interface HierarchyViewProps {
  data: HierarchyData
  supervisorId: number
}

const HierarchyView: React.FC<HierarchyViewProps> = ({ data, supervisorId }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [activeTab, setActiveTab] = useState("levels")
  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({
    [SupervisoryLevel.LEVEL_3]: true,
    [SupervisoryLevel.LEVEL_2]: true,
    [SupervisoryLevel.LEVEL_1]: true,
    [SupervisoryLevel.NONE]: true,
  })

  // Find the supervisor details
  const supervisor = data.allSubordinates.find((user) => user.supervisor && user.supervisor.id === supervisorId)
    ?.supervisor || { id: supervisorId, username: "Supervisor" }

  const toggleLevel = (level: string) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [level]: !prev[level],
    }))
  }

  const handleSelectUsersForAssignment = (users: User[]) => {
    dispatch(setSelectedUsers(users))
    // In a real app you might want to navigate to the assignment form
    // or open a modal
  }

  const renderUserCard = (user: User) => (
    <Card key={user.id} className="mb-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleSelectUsersForAssignment([user])}
              className="p-1 rounded-full hover:bg-muted"
              title="Assign to different supervisor"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Group users by supervisory level
  const usersByLevel = data.allSubordinates.reduce(
    (acc, user) => {
      if (!acc[user.supervisoryLevel]) {
        acc[user.supervisoryLevel] = []
      }
      acc[user.supervisoryLevel].push(user)
      return acc
    },
    {} as Record<string, User[]>,
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Hierarchy View</span>
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
              {supervisor.username}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="levels">By Level</TabsTrigger>
              <TabsTrigger value="direct">Direct Subordinates</TabsTrigger>
              <TabsTrigger value="all">All Subordinates</TabsTrigger>
            </TabsList>

            <TabsContent value="levels" className="space-y-4">
              {Object.entries(usersByLevel).map(([level, users]) => (
                <div key={level} className="border rounded-md overflow-hidden">
                  <div
                    className="flex justify-between items-center p-3 bg-blue cursor-pointer"
                    onClick={() => toggleLevel(level)}
                  >
                    <div className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {level} ({users.length} users)
                    </div>
                    {expandedLevels[level] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>

                  {expandedLevels[level] && (
                    <div className="p-3">
                      {users.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No users at this level</p>
                      ) : (
                        users.map((user) => renderUserCard(user))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="direct">
              <div className="space-y-2">
                {data.directSubordinates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No direct subordinates</p>
                ) : (
                  data.directSubordinates.map((user) => renderUserCard(user))
                )}
              </div>
            </TabsContent>

            <TabsContent value="all">
              <div className="space-y-2">
                {data.allSubordinates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No subordinates found</p>
                ) : (
                  data.allSubordinates.map((user) => renderUserCard(user))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default HierarchyView

