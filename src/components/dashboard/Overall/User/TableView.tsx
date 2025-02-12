// @ts-nocheck

import React from "react"
import { type User, SupervisoryLevel } from "../../types/users"
import { useDispatch, useSelector } from "react-redux"
import { addSelectedUser, removeSelectedUser } from "../../../../Redux/Slices/supervisorSlice"
import type { RootState, AppDispatch } from "../../../../Redux/store"
import { Badge } from "../../../ui/Badge"
import  Checkbox  from "../../../ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Eye, UserIcon, Users } from "lucide-react"

interface TableViewProps {
  users: User[]
  type: "users" | "supervisors"
  onSelectSupervisor?: (id: number) => void
}

const TableView: React.FC<TableViewProps> = ({ users, type, onSelectSupervisor }) => {
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
        return "bg-gray-400 text-white"
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
    <div className="border rounded-md overflow-hidden ">
      <Table>
        <TableHeader>
          <TableRow>
            {type === "users" && (
              <TableHead className="w-[50px]">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Level</TableHead>
            {type === "users" && <TableHead>Supervisor</TableHead>}
            {type === "supervisors" && <TableHead>Subordinates</TableHead>}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={type === "users" ? 7 : 6} className="text-center h-24 text-muted-foreground">
                No {type} found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                {type === "users" && (
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.some((u) => u.id === user.id)}
                      onCheckedChange={() => handleUserToggle(user)}
                    />
                  </TableCell>
                )}

                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getLevelColor(user.supervisoryLevel)} variant="outline">
                    {user.supervisoryLevel}
                  </Badge>
                </TableCell>
                {type === "users" && (
                  <TableCell>
                    {user.supervisor ? (
                      <span className="text-sm">{user.supervisor.username}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                )}
                {type === "supervisors" && (
                  <TableCell>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {user.subordinatesCount || 0}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  {type === "supervisors" && onSelectSupervisor && (
                    <button
                      onClick={() => onSelectSupervisor(user.id)}
                      className="p-1 rounded-md hover:bg-blue"
                      title="View Hierarchy"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {type === "users" && (
                    <button
                      onClick={() => handleUserToggle(user)}
                      className="p-1 rounded-md hover:bg-blue"
                      title={selectedUsers.some((u) => u.id === user.id) ? "Deselect" : "Select"}
                    >
                      <UserIcon className="h-4 w-4" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default TableView

