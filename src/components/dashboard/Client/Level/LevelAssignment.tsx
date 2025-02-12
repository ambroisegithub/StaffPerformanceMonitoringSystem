// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllLevels, fetchAllUsers, assignLevelToUser } from "../../../../Redux/Slices/levelSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import type { UserWithLevel } from "../../../../Redux/Slices/levelSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/Card"
import { Label } from "../../../ui/label"
import { Input } from "../../../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select"
import { Button } from "../../../ui/button"
import { AlertCircle, CheckCircle, Loader2, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Badge } from "../../../ui/Badge"

interface LevelAssignmentProps {
  userId?: number
  levelId?: number
  showTitle?: boolean
}

const LevelAssignment: React.FC<LevelAssignmentProps> = ({
  userId: initialUserId,
  levelId: initialLevelId,
  showTitle = true,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { levels, users, loading, error, success } = useSelector((state: RootState) => state.level)

  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId || null)
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(initialLevelId || null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<UserWithLevel[]>([])
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    dispatch(fetchAllLevels())
    dispatch(fetchAllUsers())
  }, [dispatch])

  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(users)
    }
  }, [users])

  useEffect(() => {
    if (success) {
      setSuccessMessage("Level assigned successfully!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }, [success])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term) {
      setFilteredUsers(users)
    } else {
      setFilteredUsers(
        users.filter(
          (user) =>
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.supervisoryLevel?.level || "").toLowerCase().includes(term),
        ),
      )
    }
  }

  const handleAssign = () => {
    if (selectedUserId && selectedLevelId) {
      dispatch(
        assignLevelToUser({
          userId: selectedUserId,
          levelId: selectedLevelId,
        }),
      )
    }
  }

  const handleUserClick = (user: UserWithLevel) => {
    setSelectedUserId(user.id)
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Assign Supervisory Levels</CardTitle>
          <CardDescription>Assign supervisory levels to users to establish organizational hierarchy</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="text-sm">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div className="text-sm">{successMessage}</div>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select
                value={selectedUserId?.toString() || ""}
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="bg-white z-10">
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstName} {user.lastName} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="level-select">Select Level</Label>
              <Select
                value={selectedLevelId?.toString() || ""}
                onValueChange={(value) => setSelectedLevelId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a level" />
                </SelectTrigger>
                <SelectContent className="bg-white z-10">
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.level} {!level.isActive && "(Inactive)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || !selectedLevelId || loading}
            className="w-full bg-green text-white hover:bg-green-600"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Assign Level
          </Button>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Users</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Search users..." className="pl-10" value={searchTerm} onChange={handleSearch} />
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Current Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className={`cursor-pointer hover:bg-gray-50 ${selectedUserId === user.id ? "bg-green-50" : ""}`}
                          onClick={() => handleUserClick(user)}
                        >
                          <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.supervisoryLevel ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {user.supervisoryLevel.level}
                              </Badge>
                            ) : (
                              <span className="text-gray-500 text-sm">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LevelAssignment

