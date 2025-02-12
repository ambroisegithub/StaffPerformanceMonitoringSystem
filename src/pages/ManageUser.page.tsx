"use client"

import React from "react"
import { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchUsers, updateUserRole, deleteUser } from "../Redux/Slices/ManageUserSlice"
import type { AppDispatch, RootState } from "../Redux/store"
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Users, UserCheck, UserX, Shield, User, Briefcase } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import Checkbox  from "../components/ui/checkbox"
import { debounce } from "lodash"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import Loader from "../components/ui/Loader" // Import the Loader component

const ManageUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading, error } = useSelector((state: RootState) => state.manageUser)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isEditRoleVisible, setIsEditRoleVisible] = useState(false)
  const [usersPerPage, setUsersPerPage] = useState(10)
  const [activityFilter, setActivityFilter] = useState("all")
  const [userToDelete, setUserToDelete] = useState<number | null>(null)
  const [newRole, setNewRole] = useState<string>("")
  const { user } = useSelector((state: RootState) => state.login); 
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage

  useEffect(() => {
    if (user?.organization?.id) {
      dispatch(fetchUsers(user.organization.id));
    }
  }, [dispatch, user]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term)
      setCurrentPage(1)
    }, 300),
    [],
  )


  const handleBulkUpdateRole = async () => {
    if (!newRole) return

    try {
      for (const userId of selectedUsers) {
        await dispatch(updateUserRole({ userId, newRole })).unwrap()
      }
      if (user?.organization?.id) {
        dispatch(fetchUsers(user.organization.id))
      }
      setSelectedUsers([])
      setIsEditRoleVisible(false)
    } catch (error) {
    }
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete)).unwrap()
        setUserToDelete(null)
        setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete))
      } catch (error) {
      }
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRoles.length === 0 || selectedRoles.includes(user.role)) &&
      (activityFilter === "all" ||
        (activityFilter === "active" && user.role !== "disabled") ||
        (activityFilter === "disabled" && user.role === "disabled")),
  )

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleCheckUser = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSelectAllUsers = () => {
    setSelectedUsers(selectedUsers.length === currentUsers.length ? [] : currentUsers.map((user) => user.id))
  }

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
    setCurrentPage(1)
  }

  const getInitials = (username: string) => {
    return (
      username
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || username.substring(0, 2).toUpperCase()
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pageNumbers = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Always show first page
    if (startPage > 1) {
      pageNumbers.push(
        <Button key={1} onClick={() => handlePageChange(1)} variant="outline" size="sm" className="mx-1">
          1
        </Button>,
      )

      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis-start" className="mx-1">
            ...
          </span>,
        )
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          className={`mx-1 ${currentPage === i ? "bg-green text-white" : ""}`}
        >
          {i}
        </Button>,
      )
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="mx-1">
            ...
          </span>,
        )
      }

      pageNumbers.push(
        <Button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          variant="outline"
          size="sm"
          className="mx-1"
        >
          {totalPages}
        </Button>,
      )
    }

    return (
      <div className="flex justify-center items-center mt-6">
        <Button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center">{pageNumbers}</div>
        <Button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="ml-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user accounts, roles, and permissions</p>
      </div>

      {loading ? ( // Display Loader while fetching users
        <Loader />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green">
                  <Users className="mr-2 h-5 w-5" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Overall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.filter((user) => user.role === "overall").length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green">
                  <User className="mr-2 h-5 w-5" />
                  Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.filter((user) => user.role === "supervisor").length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Employee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.filter((user) => user.role === "employee").length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-red">
                  <UserX className="mr-2 h-5 w-5" />
                  Disabled Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.filter((user) => user.role === "disabled").length}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center text-green">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.filter((user) => user.role !== "disabled").length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-500">Filter by role:</span>
                  {["overall", "supervisor", "employee", "disabled"].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleChange(role)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-10">
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="disabled">Disabled Users</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={usersPerPage.toString()} onValueChange={(value) => setUsersPerPage(Number(value))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Results per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {error ? (
            <Card className="border-red">
              <CardContent className="p-6">
                <div className="text-red flex flex-col items-center justify-center py-6">
                  <p className="mb-4 font-medium">{error}</p>
                  <Button onClick={() => user?.organization?.id && dispatch(fetchUsers(user.organization.id))} variant="outline">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {currentUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-muted-500"
                          >
                            <TableCell className="font-medium">{indexOfFirstUser + index + 1}</TableCell>

                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : user.role === "supervisor"
                                      ? "bg-blue text-white border-blue-300"
                                      : user.role === "employee"
                                        ? "bg-green text-white border-green-300"
                                        : "bg-gray-100 text-gray-800 border-gray-300"
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.company?.name || "N/A"}</TableCell>
                            <TableCell>{user.department?.name || "N/A"}</TableCell>
                            <TableCell>{user.supervisoryLevel?.level || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                               
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-2 bg-white text-red hover:bg-white hover:text-red"
                                  onClick={() => setUserToDelete(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only md:not-sr-only md:ml-2">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {renderPagination()}
        </>
      )}

      <Dialog open={isEditRoleVisible} onOpenChange={setIsEditRoleVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Role for {selectedUsers.length > 1 ? `${selectedUsers.length} Users` : "User"}
            </DialogTitle>
          </DialogHeader>
          <Select onValueChange={setNewRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select new role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleVisible(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdateRole} disabled={!newRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red text-white hover:bg-white hover:text-red">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageUser

