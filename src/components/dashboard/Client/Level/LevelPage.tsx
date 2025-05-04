
// @ts-nocheck
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAllLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  updateFormData,
  setSelectedLevel,
  filterLevels,
  resetForm,
  clearError,
} from "../../../../Redux/Slices/levelSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Plus, Search, Edit, Trash2, AlertCircle, Loader2, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react"
import { Dialog, Transition } from "@headlessui/react"
import { Button } from "../../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/Card"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Switch } from "../../../ui/switch"
import { Badge } from "../../../ui/Badge"
import { Tabs, TabsList, TabsTrigger } from "../../../ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice"
const LevelPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { levels, filteredLevels, selectedLevel, loading, error, success, formData, isEditing } = useSelector(
    (state: RootState) => state.level,
  )

  const [showForm, setShowForm] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [levelToDelete, setLevelToDelete] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  
  const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);

  useEffect(() => {
    dispatch(fetchAllLevels())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      setShowForm(false)
      setTimeout(() => {
        dispatch(resetForm())
      }, 2000)
    }
  }, [success, dispatch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    dispatch(filterLevels(value))
  }

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateFormData({ level: e.target.value }))
  }

  const handleIsActiveChange = (checked: boolean) => {
    dispatch(updateFormData({ isActive: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.level) {
      return
    }

    if (isEditing && selectedLevel) {
      dispatch(updateLevel({ id: selectedLevel.id, levelData: formData }))
    } else {
      dispatch(createLevel(formData))
    }
  }

  const handleEdit = (level: (typeof levels)[0]) => {
    dispatch(setSelectedLevel(level))
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    setLevelToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (levelToDelete !== null) {
      setIsDeleting(true)
      dispatch(deleteLevel(levelToDelete))
        .then(() => {
          setShowDeleteDialog(false)
          setIsDeleting(false)
        })
        .catch(() => {
          setIsDeleting(false)
        })
    }
  }

  const handleCancel = () => {
    dispatch(resetForm())
    setShowForm(false)
  }

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const sortedLevels = [...filteredLevels].sort((a, b) => {
    if (sortDirection === "asc") {
      return a.level.localeCompare(b.level)
    } else {
      return b.level.localeCompare(a.level)
    }
  })

  const filteredByStatus =
    activeTab === "all"
      ? sortedLevels
      : sortedLevels.filter((level) => (activeTab === "active" ? level.isActive : !level.isActive))

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredByStatus.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredByStatus.length / itemsPerPage)

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Supervisory Levels Management</h1>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5">
          <Card>
            <CardHeader className="pb-3">
              <div>
                {error && (
                  <div className="mb-4 p-3 border border-red text-red rounded-md flex gap-2">
                    <AlertCircle className="h-5 w-5 text-red" />
                    <div className="text-sm">{error}</div>
                    <button onClick={() => dispatch(clearError())} className="ml-auto text-red hover:text-red-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green border border-green-200 text-white rounded-md flex gap-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                    <div className="text-sm">
                      {isEditing
                        ? "Supervisory level updated successfully!"
                        : "Supervisory level created successfully!"}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Supervisory Levels</CardTitle>
                  <CardDescription>Manage organizational hierarchy with supervisory levels</CardDescription>
                </div>
                                {loggedInUser?.role !== "overall" && (

                <Button onClick={() => setShowForm(true)} className="bg-green hover:bg-green-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  New Level
                </Button>
                                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search levels..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loading && !isEditing && !showForm ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-green" />
                </div>
              ) : filteredByStatus.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <p className="text-gray-500">No supervisory levels found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={toggleSort}>
                          <div className="flex items-center">
                            Level
                            {sortDirection === "asc" ? (
                              <ChevronUp size={16} className="ml-1" />
                            ) : (
                              <ChevronDown size={16} className="ml-1" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                                {loggedInUser?.role !== "overall" && (

                        <TableHead className="text-right">Actions</TableHead>
                                )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentItems.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">{level.level}</TableCell>
                          <TableCell>
                            {level.isActive ? (
                              <Badge variant="outline" className="bg-green text-white hover:bg-green-100">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red text-white hover:bg-red-100">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(level.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(level.updated_at).toLocaleDateString()}</TableCell>
                                {loggedInUser?.role !== "overall" && (
                         
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(level)}
                                className="h-8 w-8 p-0 text-green hover:text-white bg-white hover:bg-green"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(level.id)}
                                className="h-8 w-8 p-0 text-red hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </TableCell>
                                )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredByStatus.length > itemsPerPage && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredByStatus.length)} of{" "}
                        {filteredByStatus.length} levels
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="hover:bg-green hover:text-white"
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(i + 1)}
                            className="hover:bg-white"
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="bg-green text-white hover:bg-green"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? "Edit" : "Create"} Supervisory Level</CardTitle>
                <CardDescription>
                  {isEditing ? "Update the existing supervisory level" : "Create a new supervisory level"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="level">
                      Level Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="level"
                      placeholder="e.g., Level 1, Overall, None"
                      value={formData.level}
                      onChange={handleLevelChange}
                      required
                    />
                    <p className="text-xs text-gray-500">Format should be "Level n", "Overall", or "None"</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active Status
                    </Label>
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleIsActiveChange} />
                  </div>

                  <div className="flex justify-between gap-4 pt-2">
                    <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 hover:bg-white">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.level.trim()}
                      className="flex-1 bg-green hover:bg-green-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : isEditing ? (
                        "Update"
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Transition show={showDeleteDialog} as="div" className="relative z-50">
        <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
              <Dialog.Title className="text-lg font-medium text-gray-900">Confirm Deletion</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete this supervisory level? This action cannot be undone.
              </Dialog.Description>

              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="hover:bg-white">
                  Cancel
                </Button>
                <Button onClick={confirmDelete} className="bg-red text-white">
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default LevelPage

