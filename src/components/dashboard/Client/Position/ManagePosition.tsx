
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  fetchPositions,
  deletePosition,
  updatePosition,
  setSelectedPosition,
  clearSelectedPosition,
} from "../../../../Redux/Slices/PositionSlices"
import type { AppDispatch, RootState } from "../../../../Redux/store"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Filter,
  Building,
  Award,
  UserCheck,
} from "lucide-react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import Pagination from "./Pagination"
import Loader from "../../../ui/Loader"
import PositionReportCard from "./PositionReportCard"

// Interfaces for API responses
interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface IDepartment {
  id: number
  name: string
  company: {
    id: number
    name: string
    tin: string | null
  } | null
  organization: {
    id: number
    name: string
    description: string
  }
}

interface ISupervisoryLevel {
  id: number
  level: string
  isActive: boolean
  created_at: string
  updated_at: string
}

interface ICompany {
  id: number
  name: string
  departments: {
    id: number
    name: string
  }[]
}

// Validation schema for edit form
const validationSchema = Yup.object().shape({
  title: Yup.string().required("Position title is required"),
  supervisory_level_id: Yup.string().required("Supervisory level is required"),
  direct_supervisor_id: Yup.string().optional(),
})

const ManagePosition: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { positions, selectedPosition, loading, error } = useSelector((state: RootState) => state.positions)
  const { user } = useSelector((state: RootState) => state.login)

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [positionToDelete, setPositionToDelete] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all")
  const [companies, setCompanies] = useState<ICompany[]>([])
  const [departments, setDepartments] = useState<IDepartment[]>([])
  const [supervisoryLevels, setSupervisoryLevels] = useState<ISupervisoryLevel[]>([])
  const [submissionAttempts, setSubmissionAttempts] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Fetch positions, companies, departments, and supervisory levels on component mount
  useEffect(() => {
    setIsDataLoading(true)

    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token")
        const organizationId = user?.organization?.id

        if (!organizationId) {
          throw new Error("Organization ID is missing")
        }

        // Fetch positions
        await dispatch(fetchPositions()).unwrap()

        // Fetch departments
        const departmentsResponse = await axios.get<APIResponse<{ departments: IDepartment[] }>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/departments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (departmentsResponse.data.success && departmentsResponse.data.data.departments) {
          setDepartments(departmentsResponse.data.data.departments)
        }

        // Fetch supervisory levels
        const supervisoryLevelsResponse = await axios.get<APIResponse<ISupervisoryLevel[]>>(
          `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/supervisory-levels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (supervisoryLevelsResponse.data.success && supervisoryLevelsResponse.data.data) {
          setSupervisoryLevels(supervisoryLevelsResponse.data.data)
        }

        // Fetch companies (optional for backward compatibility)
        try {
          const companiesResponse = await axios.get<APIResponse<{ companies: ICompany[] }>>(
            `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          if (companiesResponse.data.success && companiesResponse.data.data.companies) {
            setCompanies(companiesResponse.data.data.companies)
          }
        } catch (companyError) {
          console.log("Companies endpoint not available, continuing without company data")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsDataLoading(false)
      }
    }

    if (user?.organization?.id) {
      fetchAllData()
    }
  }, [dispatch, user?.organization?.id])

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilter])

  // Rate limiting effect
  useEffect(() => {
    if (submissionAttempts >= 5) {
      setIsRateLimited(true)
      const timer = setTimeout(() => {
        setIsRateLimited(false)
        setSubmissionAttempts(0)
      }, 300000) // 5 minutes cooldown
      return () => clearTimeout(timer)
    }
  }, [submissionAttempts])

  // Filter departments based on selected company
  const getFilteredDepartments = (departments: IDepartment[], selectedCompanyId: string | number | null) => {
    if (!selectedCompanyId) return departments
    return departments.filter((dept) => dept.company && dept.company.id === Number(selectedCompanyId))
  }

  // Handle edit position
  const handleEditClick = (position: any) => {
    dispatch(setSelectedPosition(position))
    setIsEditModalOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setPositionToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (positionToDelete) {
      try {
        await dispatch(deletePosition(positionToDelete)).unwrap()
        setIsDeleteModalOpen(false)
        setPositionToDelete(null)
      } catch (err) {
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

  // Apply sorting and filtering
  const getSortedAndFilteredPositions = () => {
    // First filter by search term and active status
    const filteredPositions = [...positions].filter((position) => {
      const matchesSearch =
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (position.department?.name && position.department.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (position.supervisoryLevel?.level &&
          position.supervisoryLevel.level.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesActiveFilter =
        activeFilter === "all" ? true : activeFilter === "active" ? position.isActive : !position.isActive

      return matchesSearch && matchesActiveFilter
    })

    // Then sort if needed
    if (sortConfig) {
      filteredPositions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return filteredPositions
  }

  // Get sorted and filtered positions
  const sortedAndFilteredPositions = getSortedAndFilteredPositions()

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndFilteredPositions.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedAndFilteredPositions.slice(indexOfFirstItem, indexOfLastItem)

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Refresh data
  const handleRefresh = () => {
    setIsDataLoading(true)
    dispatch(fetchPositions())
      .then(() => setIsDataLoading(false))
      .catch(() => setIsDataLoading(false))
  }
  const [availableSupervisors, setAvailableSupervisors] = useState<AvailableSupervisor[]>([])

  // Add this useEffect to fetch supervisors when modal opens
  useEffect(() => {
    if (isEditModalOpen && user?.organization?.id) {
      const fetchSupervisors = async () => {
        try {
          const token = localStorage.getItem("token")
          const response = await axios.get<APIResponse<AvailableSupervisor[]>>(
            `${import.meta.env.VITE_BASE_URL}/v1/position/${user.organization.id}/supervisors`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          if (response.data.success) {
            setAvailableSupervisors(response.data.data)
          }
        } catch (error) {
          console.error("Error fetching supervisors:", error)
        }
      }
      fetchSupervisors()
    }
  }, [isEditModalOpen, user?.organization?.id])
  // Render edit modal
  const renderEditModal = () => (
    <AnimatePresence>
      {isEditModalOpen && selectedPosition && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setIsEditModalOpen(false)
              dispatch(clearSelectedPosition())
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full m-4 z-10"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Position</h3>
                  <div className="mt-4">
                    <Formik
                      initialValues={{
                        title: selectedPosition.title,
                        isActive: selectedPosition.isActive,
                        company_id: selectedPosition.company?.id || "",
                        department_id: selectedPosition.department?.id || "",
                        supervisory_level_id: selectedPosition.supervisoryLevel?.id || "",
                        direct_supervisor_id: selectedPosition.directSupervisor?.id || "",
                      }}

                      validationSchema={validationSchema}
                      onSubmit={async (values) => {
                        if (isRateLimited) {
                          alert("You've reached the submission limit. Please try again later.")
                          return
                        }

                        setSubmissionAttempts((prev) => prev + 1)

                        const positionData = {
                          title: values.title,
                          isActive: values.isActive,
                          department_id: Number(values.department_id),
                          supervisory_level_id: Number(values.supervisory_level_id),
                          direct_supervisor_id: values.direct_supervisor_id ? Number(values.direct_supervisor_id) : null,
                          company_id: values.company_id ? Number(values.company_id) : null,
                        }

                        try {
                          await dispatch(
                            updatePosition({
                              id: selectedPosition.id,
                              positionData,
                            }),
                          ).unwrap()
                          setIsEditModalOpen(false)
                        } catch (err) {
                          // Error is handled in the slice
                        }
                      }}
                    >
                      {({ values, setFieldValue, isSubmitting }) => {
                        // Filter departments based on selected company
                        const filteredDepartments = values.company_id
                          ? departments.filter((dept) => dept.company && dept.company.id === Number(values.company_id))
                          : departments

                        // Get selected department details
                        const selectedDepartment = departments.find((dept) => dept.id === Number(values.department_id))

                        return (
                          <Form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Position Title */}
                              <div className="md:col-span-2">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                  Position Title <span className="text-red">*</span>
                                </label>
                                <Field
                                  name="title"
                                  type="text"
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                />
                                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red" />
                              </div>

                              {/* Department Selection */}
                              <div>
                                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">
                                  <Building className="inline h-4 w-4 mr-1" />
                                  Department <span className="text-red">*</span>
                                </label>
                                <Field
                                  as="select"
                                  name="department_id"
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setFieldValue("department_id", e.target.value)
                                  }}
                                >
                                  <option value="">Select a department</option>
                                  {filteredDepartments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                      {department.name}
                                    </option>
                                  ))}
                                </Field>
                                <ErrorMessage name="department_id" component="div" className="mt-1 text-sm text-red" />

                              </div>

                              {/* Supervisory Level Selection */}
                              <div>
                                <label
                                  htmlFor="supervisory_level_id"
                                  className="block text-sm font-medium text-gray-700"
                                >
                                  <Award className="inline h-4 w-4 mr-1" />
                                  Supervisory Level <span className="text-red">*</span>
                                </label>
                                <Field
                                  as="select"
                                  name="supervisory_level_id"
                                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                  <option value="">Select supervisory level</option>
                                  {supervisoryLevels
                                    .filter((level) => level.isActive)
                                    .map((level) => (
                                      <option key={level.id} value={level.id}>
                                        {level.level}
                                      </option>
                                    ))}
                                </Field>
                                <ErrorMessage
                                  name="supervisory_level_id"
                                  component="div"
                                  className="mt-1 text-sm text-red"
                                />
                              </div>

                              {/* Company Selection (Optional - for backward compatibility) */}
                              {companies.length > 0 && (
                                <div className="md:col-span-2">
                                  <label htmlFor="company_id" className="block text-sm font-medium text-gray-700">
                                    Company (Optional)
                                  </label>
                                  <Field
                                    as="select"
                                    name="company_id"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                      setFieldValue("company_id", e.target.value)
                                      setFieldValue("department_id", "") // Reset department when company changes
                                    }}
                                  >
                                    <option value="">Select a company (optional)</option>
                                    {companies.map((company) => (
                                      <option key={company.id} value={company.id}>
                                        {company.name}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage name="company_id" component="div" className="mt-1 text-sm text-red" />
                                </div>
                              )}



                              {/* Active Status */}
                              <div className="md:col-span-2 flex items-center">
                                <Field
                                  type="checkbox"
                                  name="isActive"
                                  id="isActive"
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                  Active
                                </label>
                              </div>
                            </div>
                            {/* Direct Supervisor Selection */}
                            <div className="md:col-span-2">
                              <label htmlFor="direct_supervisor_id" className="block text-sm font-medium text-gray-700">
                                <UserCheck className="inline h-4 w-4 mr-1" />
                                Direct Supervisor (Optional)
                              </label>
                              <Field
                                as="select"
                                name="direct_supervisor_id"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="">None (Top Level Position)</option>
                                {availableSupervisors
                                  .filter(supervisor => supervisor.id !== selectedPosition.id) // Exclude current position
                                  .map((supervisor) => (
                                    <option key={supervisor.id} value={supervisor.id}>
                                      {supervisor.title}
                                    </option>
                                  ))}
                              </Field>
                              <ErrorMessage name="direct_supervisor_id" component="div" className="mt-1 text-sm text-red" />
                              <p className="mt-1 text-sm text-gray-500">
                                Select an existing position that will serve as the direct supervisor for this position.
                                Leave empty if this is a top-level position with no supervisor.
                              </p>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                              <button
                                type="submit"
                                disabled={isSubmitting || isRateLimited}
                                className="w-full inline-flex justify-center bg-green rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  "Update Position"
                                )}
                              </button>
                              <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:mt-0 sm:w-auto sm:text-sm"
                                onClick={() => {
                                  setIsEditModalOpen(false)
                                  dispatch(clearSelectedPosition())
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </Form>
                        )
                      }}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Manage Positions</h1>
          <Link
            to="/admin/create-position"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Position
          </Link>
        </div>
        <PositionReportCard />
        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Search positions, departments, or supervisory levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setSearchTerm("")}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative inline-block text-left">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
                >
                  <option value="all">All Positions</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Use the Loader component when data is loading */}
          {isDataLoading ? (
            <Loader />
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red mx-auto mb-4" />
              <p className="text-red">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : sortedAndFilteredPositions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No positions found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("title")}
                    >
                      <div className="flex items-center">
                        Title
                        {sortConfig?.key === "title" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisory Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Direct Supervisor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("isActive")}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig?.key === "isActive" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("created_at")}
                    >
                      <div className="flex items-center">
                        Created
                        {sortConfig?.key === "created_at" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((position, index) => (
                    <tr key={position.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{position.title}</div>
                        {position.company && <div className="text-xs text-gray-500">{position.company.name}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {position.department?.name || "Not assigned"}
                            </div>
                            {position.department?.company && (
                              <div className="text-xs text-gray-500">{position.department.company.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {position.supervisoryLevel?.level || "Not assigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {position.directSupervisor?.title || "None (Top Level)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${position.isActive ? "bg-green text-white" : "bg-red text-white"
                            }`}
                        >
                          {position.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(position.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(position)}
                          className="text-gray-500 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-3 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(position.id)} className="text-red hover:text-red-900">
                          <Trash2 className="h-3 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Component */}
        {!isDataLoading && sortedAndFilteredPositions.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </div>

      {renderEditModal()}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4 z-10"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Position</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this position? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full bg-red inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                >
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
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManagePosition
