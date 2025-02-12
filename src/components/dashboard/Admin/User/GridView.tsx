// @ts-nocheck

import React from "react"
import { type User, SupervisoryLevel } from "../../types/users"
import { useDispatch, useSelector } from "react-redux"
import { addSelectedUser, removeSelectedUser } from "../../../../Redux/Slices/supervisorSlice"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { Card, CardContent } from "../../../ui/Card"
import { Badge } from "../../../ui/Badge"
import  Checkbox  from "../../../ui/checkbox"
import { Eye, UserIcon, Users, Check } from "lucide-react"

interface GridViewProps {
  users: User[]
  type: "users" | "supervisors"
  onSelectSupervisor?: (id: number) => void
}

const GridView: React.FC<GridViewProps> = ({ users, type, onSelectSupervisor }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedUsers } = useSelector((state: RootState) => state.supervisor)

  const getLevelColor = (level: SupervisoryLevel): string => {
    switch (level) {
      case SupervisoryLevel.OVERALL:
        return "bg-purple-500 text-white"
      case SupervisoryLevel.LEVEL_3:
        return "bg-blue text-white"
      case SupervisoryLevel.LEVEL_2:
        return "bg-green text-white"
      case SupervisoryLevel.LEVEL_1:
        return "bg-amber-600 text-white"
      case SupervisoryLevel.NONE:
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleUserToggle = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id)

    if (isSelected) {
      dispatch(removeSelectedUser(user.id))
    } else {
      dispatch(addSelectedUser(user))
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.length === 0 ? (
        <div className="col-span-full text-center py-8 text-muted-foreground">No {type} found</div>
      ) : (
        users.map((user) => (
          <Card
            key={user.id}
            className={`overflow-hidden ${selectedUsers.some((u) => u.id === user.id) ? "border-primary" : ""}`}
          >
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">
                    {user.firstName} {user.lastName}
                  </h3>
                  {type === "users" && (
                    <Checkbox
                      checked={selectedUsers.some((u) => u.id === user.id)}
                      onCheckedChange={() => handleUserToggle(user)}
                    />
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">{user.username}</p>
                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getLevelColor(user.supervisoryLevel)} variant="outline">
                    {user.supervisoryLevel}
                  </Badge>

                  {type === "supervisors" && (
                    <Badge variant="outline" className="bg-white">
                      <Users className="h-3 w-3 mr-1" />
                      {user.subordinatesCount || 0} subordinates
                    </Badge>
                  )}
                </div>

                {type === "users" && user.supervisor && (
                  <div className="text-xs text-muted-foreground">Supervisor: {user.supervisor.username}</div>
                )}
              </div>

              <div className="border-t p-2 bg-muted/50 flex justify-between">
                {type === "supervisors" && onSelectSupervisor && (
                  <button
                    onClick={() => onSelectSupervisor(user.id)}
                    className="text-xs flex items-center text-primary hover:underline"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Hierarchy
                  </button>
                )}
                {type === "users" && (
                  <button
                    onClick={() => handleUserToggle(user)}
                    className="text-xs flex items-center text-primary hover:underline"
                  >
                    {selectedUsers.some((u) => u.id === user.id) ? (
                      <p className="text-green flex items-center font-bold flex-row">
                        <Check className="h-5 w-5 mr-1 text-green font-bold text-2xl" />
                        Selected
                      </p>
                    ) : (
                      <>
                        <UserIcon className="h-5 w-5 mr-1" />
                        Select
                      </>
                    )}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

export default GridView

