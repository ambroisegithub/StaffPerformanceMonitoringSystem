
// @ts-nocheck
"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  fetchCompanies,
  deleteCompany,
  updateCompany,
  setSelectedCompany,
  clearSelectedCompany,
  filterCompanies,
  clearCompanyError,
  clearCompanySuccess,
  type Company,
} from "../../../../Redux/Slices/CompaniesSlice"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import { Card, CardContent, CardHeader } from "../../../ui/Card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  ChevronUp,
  ChevronDown,
  Building2,
  FileText,
} from "lucide-react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../ui/dialog"
import { Badge } from "../../../ui/Badge"
import Loader from "../../../ui/Loader"
import CompanySummaryReport from "./CompanySummaryReport"
// Validation schema for edit form
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Company name is required"),
  tin: Yup.string().nullable(),
  group_id: Yup.number().nullable(),
})

// Interface for API responses
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface IGroup {
  id: number
  name: string
  tin?: string
}

const ManageCompaniesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    companies,
    filteredCompanies,
    selectedCompany,
    pagination,
    loading,
    error,
    success,
    successMessage,
    isEditing,
  } = useSelector((state: RootState) => state.companies)

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [groups, setGroups] = useState<IGroup[]>([])
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false)
  const [companyUsers, setCompanyUsers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

  // Fetch companies and groups on component mount
  const { user } = useSelector((state: RootState) => state.login); 
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const organizationId = user?.organization?.id;

        if (!organizationId) {
          throw new Error("Organization ID is missing");
        }

        // Fetch companies for the specific organization
        const response = await axios.get<APIResponse<{ groups: IGroup[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/holding-companies`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in headers
            },
          }
        );

        if (response.data.success && response.data.data.groups) {
          setGroups(response.data.data.groups);
        } else {
          setGroups([]);
        }
      } catch (err) {
        setGroups([]);
      }
    };

    if (user?.organization?.id) {
      dispatch(fetchCompanies({ page: currentPage, limit: itemsPerPage }));
      fetchGroups();
    }
  }, [dispatch, currentPage, itemsPerPage, user?.organization?.id]);
  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearCompanySuccess())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, dispatch])

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    dispatch(filterCompanies(value))
    setCurrentPage(1)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
  }

  // Handle edit company
  const handleEditClick = (company: Company) => {
    dispatch(setSelectedCompany(company))
    setIsEditModalOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setCompanyToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (companyToDelete) {
      try {
        await dispatch(deleteCompany(companyToDelete)).unwrap()
        setIsDeleteModalOpen(false)
        setCompanyToDelete(null)
        dispatch(fetchCompanies({ page: 1, limit: itemsPerPage }))
      } catch (err) {
    // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setCompanyToDelete(id)
    setIsDeleteModalOpen(true)
  }
     // Error is handled in the slice
      }
    }
  }

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Apply sorting
  const getSortedCompanies = () => {
    // Ensure filteredCompanies is an array before spreading
    const sortableCompanies = Array.isArray(filteredCompanies) ? [...filteredCompanies] : []

    if (sortConfig && sortableCompanies.length > 0) {
      sortableCompanies.sort((a, b) => {
        if (sortConfig.key === "group") {
          const aValue = a.group?.name || ""
          const bValue = b.group?.name || ""
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        } else if (sortConfig.key === "departments") {
          const aValue = a.departments?.length || 0
          const bValue = b.departments?.length || 0
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        } else if (sortConfig.key === "userCount") {
          const aValue = a.userCount || 0
          const bValue = b.userCount || 0
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        } else {
          // @ts-ignore
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1
          }
          // @ts-ignore
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1
          }
          return 0
        }
      })
    }
    return sortableCompanies
  }

  // Get sorted companies
  const sortedCompanies = getSortedCompanies()

  // Pagination logic
  const totalPages = pagination.total_pages || Math.ceil(sortedCompanies.length / itemsPerPage)

  return (
    <div className="px-4 py-8">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Management</h1>
          <p className="text-gray-500 mb-6">Create and manage companies, assign to groups</p>
        </div>

      </div>
      <div>
        <CompanySummaryReport />
        </div>
      {/* Main content area */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          {error && (
            <div className="mb-4 p-3 border border-red text-red rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-red" />
              <div className="text-sm">{error}</div>
              <button onClick={() => dispatch(clearCompanyError())} className="ml-auto text-red hover:text-red">
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 border border-green text-green rounded-md flex gap-2">
              <CheckCircle className="h-5 w-5 text-green" />
              <div className="text-sm">{successMessage}</div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => dispatch(fetchCompanies({ page: currentPage, limit: itemsPerPage }))}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Company table or loading state */}
          {loading && !isEditing ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
            </div>
          ) : !Array.isArray(filteredCompanies) || filteredCompanies.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No companies found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("name")}>
                      <div className="flex items-center">
                        Company Name
                        {sortConfig?.key === "name" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("tin")}>
                      <div className="flex items-center">
                        TIN
                        {sortConfig?.key === "tin" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("group")}>
                      <div className="flex items-center">
                        Group
                        {sortConfig?.key === "group" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort("departments")}>
                      <div className="flex items-center">
                        Departments
                        {sortConfig?.key === "departments" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
         
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCompanies.map((company, index) => (
                    <TableRow key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <div className="font-medium">{company.name}</div>
                      </TableCell>
                      <TableCell>
                        {company.tin ? (
                          <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{company.tin}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {company.group ? (
                          <div className="flex items-center">
                            <Building2 className="mr-2 h-4 w-4 text-blue" />
                            <span>{company.group.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Independent</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue text-white border-blue">
                          {company.departments?.length || 0} departments
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(company)}
                            className="h-8 w-8 p-0 hover:bg-white"
                            title="Edit Company"
                          >
                            <Edit className="h-3 w-3" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(company.id)}
                            className="h-8 w-8 p-0 text-red hover:bg-white"
                            title="Delete Company"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {Array.isArray(filteredCompanies) && filteredCompanies.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, pagination.total_items || filteredCompanies.length)} of{" "}
                {pagination.total_items || filteredCompanies.length} companies
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    dispatch(fetchCompanies({ page: newPage, limit: itemsPerPage }))
                  }}
                  disabled={currentPage === 1}
                  className="hover:bg-green"
                >
                  Previous
                </Button>
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
                      onClick={() => {
                        setCurrentPage(pageToShow)
                        dispatch(fetchCompanies({ page: pageToShow, limit: itemsPerPage }))
                      }}
                      className={currentPage === pageToShow ? "bg-green text-white" : "hover:bg-green"}
                    >
                      {pageToShow}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    dispatch(fetchCompanies({ page: newPage, limit: itemsPerPage }))
                  }}
                  disabled={currentPage === totalPages}
                  className="hover:bg-green"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Company Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedCompany && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Company</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Formik
                  initialValues={{
                    name: selectedCompany.name,
                    tin: selectedCompany.tin || "",
                    group_id: selectedCompany.group?.id || "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {
                    const companyData = {
                      name: values.name,
                      tin: values.tin || undefined,
                      group_id: values.group_id ? Number(values.group_id) : undefined,
                    }

                    try {
                      await dispatch(
                        updateCompany({
                          id: selectedCompany.id,
                          companyData,
                        }),
                      ).unwrap()
                      setIsEditModalOpen(false)
                      dispatch(clearSelectedCompany())
                      dispatch(fetchCompanies({ page: currentPage, limit: itemsPerPage }))
                    } catch (err) {
                      // Error is handled in the slice
                    }
                  }}
                >
                  {({ values, isSubmitting }) => (
                    <Form className="space-y-4">
                      {/* Company Name */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name <span className="text-red">*</span>
                        </label>
                        <Field
                          name="name"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      {/* TIN */}
                      <div>
                        <label htmlFor="tin" className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Identification Number (TIN)
                        </label>
                        <Field
                          name="tin"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        />
                        <ErrorMessage name="tin" component="div" className="mt-1 text-sm text-red" />
                      </div>

                      {/* Group Selection */}
                      <div>
                        <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
                          Parent Group
                        </label>
                        <Field
                          as="select"
                          name="group_id"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green focus:border-green"
                        >
                          <option value="">Not Assigned to Any Group</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green text-base font-medium text-white hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Updating...
                            </>
                          ) : (
                            "Update Company"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditModalOpen(false)
                            dispatch(clearSelectedCompany())
                          }}
                          className="hover:bg-white mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* View Users Modal */}
      <Dialog open={isViewUsersModalOpen} onOpenChange={setIsViewUsersModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Users in {selectedCompany?.name}</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {companyUsers && companyUsers.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyUsers.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users in this company</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsViewUsersModalOpen(false)}
                className="bg-green hover:bg-green-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this company. This action cannot be undone.
              <br />
              <br />
              <strong className="text-red">Warning:</strong> You can only delete companies that have no associated
              users or departments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)} className="hover:bg-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red  text-white">
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ManageCompaniesPage

