// @ts-nocheck

"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  fetchAllDepartments,
  deleteDepartment,
  updateDepartment,
  setSelectedDepartment,
  clearSelectedDepartment,
  filterDepartments,
  clearDepartmentError,
  clearDepartmentSuccess,
  type Department,
} from "../../../../Redux/Slices/manageDepartmentSlice";
import type { AppDispatch, RootState } from "../../../../Redux/store";
import { Card, CardContent, CardHeader } from "../../../ui/Card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import {
  AlertCircle,
  CheckCircle,
  Search,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Building,
  ChevronUp,
  ChevronDown,
  Loader,
  ListChecks,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Dialog, DialogContent } from "../../../ui/dialog";
import Loader2 from "../../../ui/Loader"; // Import Loader
import { fetchUsers } from "../../../../Redux/Slices/ManageUserSlice";
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
  company_id: Yup.number().nullable(),
});

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ICompany {
  id: number;
  name: string;
}

const ManageDepartment: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    departments,
    filteredDepartments,
    selectedDepartment,
    loading,
    error,
    success,
    successMessage,
    isEditing,
  } = useSelector((state: RootState) => state.departments);
  const { user } = useSelector((state: RootState) => state.login);
  const { user: loggedInUser } = useSelector((state: RootState) => state.login);

  const [activeTab, setActiveTab] = useState("levels");
  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
    }
  }, [dispatch, loggedInUser]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [isViewUsersModalOpen, setIsViewUsersModalOpen] = useState(false);

  const [departmentStats, setDepartmentStats] = useState({
    total: 0,
    withCompany: 0,
    withoutCompany: 0,
    byCompany: {} as Record<string, number>,
  });

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from local storage
    if (!token) {
      // Redirect to login or handle unauthorized access
      return;
    }

    dispatch(fetchAllDepartments());
    const organizationId = user?.organization?.id;

    if (!organizationId) {
      return;
    }
    // Fetch companies
    axios
      .get<APIResponse<{ companies: ICompany[] }>>(
        `${import.meta.env.VITE_BASE_URL}/v1/${organizationId}/companies`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      )
      .then((response) => {
        if (response.data.success && response.data.data.companies) {
          setCompanies(response.data.data.companies);
        } else {
          setCompanies([]);
        }
      })
      .catch((err) => {
        setCompanies([]);
      });
  }, [dispatch]);

  // Calculate department statistics when departments change
  useEffect(() => {
    if (Array.isArray(departments)) {
      const withCompany = departments.filter(
        (dept) => dept.company !== null
      ).length;
      const withoutCompany = departments.length - withCompany;

      // Count departments by company
      const byCompany: Record<string, number> = {};
      departments.forEach((dept) => {
        if (dept.company) {
          const companyName = dept.company.name;
          byCompany[companyName] = (byCompany[companyName] || 0) + 1;
        }
      });

      setDepartmentStats({
        total: departments.length,
        withCompany,
        withoutCompany,
        byCompany,
      });
    }
  }, [departments]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearDepartmentSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(filterDepartments(value));
    setCurrentPage(1);
  };

  // Handle edit department
  const handleEditClick = (department: Department) => {
    dispatch(setSelectedDepartment(department));
    setIsEditModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setDepartmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (departmentToDelete) {
      try {
        await dispatch(deleteDepartment(departmentToDelete)).unwrap();
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
      } catch (err) {
        // Error is handled in the slice
      }
    }
  };

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const getSortedDepartments = () => {
    // Ensure filteredDepartments is an array before spreading
    const sortableDepartments = Array.isArray(filteredDepartments)
      ? [...filteredDepartments]
      : [];

    if (sortConfig && sortableDepartments.length > 0) {
      sortableDepartments.sort((a, b) => {
        if (sortConfig.key === "company") {
          const aValue = a.company?.name || "";
          const bValue = b.company?.name || "";
          if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        } else {
          // @ts-ignore
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? -1 : 1;
          }
          // @ts-ignore
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "ascending" ? 1 : -1;
          }
          return 0;
        }
      });
    }
    return sortableDepartments;
  };

  // Get sorted departments
  const sortedDepartments = getSortedDepartments();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartments = sortedDepartments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedDepartments.length / itemsPerPage);

  return (
    <div className="px-4 py-8">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Department Management
          </h1>
          <p className="text-gray-500 mb-6">
            Manage departments, assign to companies
          </p>
        </div>
      </div>

      {/* Department Statistics Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="h-28 flex flex-row">
          <CardContent className="flex flex-row justify-around w-full items-center">
            <ListChecks className="h-6 w-6 text-primary  mb-2" />

            <p className="text-sm font-medium text-gray-600 mr-2">
              Total Departments
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {departmentStats.total}
            </h3>
          </CardContent>
        </Card>

        <Card className="h-28 flex flex-row">
          <CardContent className="flex flex-row justify-around w-full items-center">
            <Building className="h-6 w-6 text-green  mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Departments with Company
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              {departmentStats.withCompany}
            </h3>
          </CardContent>
        </Card>

        <Card className="h-28 flex flex-row">
          <CardContent className="flex flex-row justify-around w-full items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Companies</p>

              <Building className="h-6 w-6 text-primary mx-auto mb-2" />
            </div>

            <div>
              {Object.keys(departmentStats.byCompany).length > 0 ? (
                Object.entries(departmentStats.byCompany)
                  .slice(0, 2)
                  .map(([company, count]) => (
                    <div
                      key={company}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="truncate max-w-[100px]" title={company}>
                        {company}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-gray-500">No company data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          {error && (
            <div className="mb-4 p-3 border border-red text-red rounded-md flex gap-2">
              <AlertCircle className="h-5 w-5 text-red" />
              <div className="text-sm">{error}</div>
              <button
                onClick={() => dispatch(clearDepartmentError())}
                className="ml-auto text-red hover:text-red"
              >
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
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search departments..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => dispatch(fetchAllDepartments())}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Department table or loading state */}
          {loading && !isEditing ? (
            <Loader2 /> // Use Loader component
          ) : !Array.isArray(filteredDepartments) ||
            filteredDepartments.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-gray-500">No departments found</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center">
                        Department Name
                        {sortConfig?.key === "name" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => requestSort("company")}
                    >
                      <div className="flex items-center">
                        Company
                        {sortConfig?.key === "company" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    {loggedInUser?.role !== "overall" && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDepartments.map((department, index) => (
                    <TableRow
                      key={department.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{department.name}</div>
                      </TableCell>
                      <TableCell>
                        {department.company ? (
                          <div className="flex items-center">
                            <Building className="mr-2 h-4 w-4 text-gray-500" />
                            <span>{department.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      {loggedInUser?.role !== "overall" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(department)}
                              className="h-8 w-8 p-0 hover:bg-white"
                              title="Edit Department"
                            >
                              <Edit className="h-3 w-3" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(department.id)}
                              className="h-8 w-8 p-0 text-red hover:bg-white"
                              title="Delete Department"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {Array.isArray(filteredDepartments) &&
            filteredDepartments.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredDepartments.length)} of{" "}
                  {filteredDepartments.length} departments
                </div>
                <div className="flex gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="hover:bg-blue"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, and pages around current page
                    let pageToShow = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 2 + i;
                      }
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={
                          currentPage === pageToShow ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageToShow)}
                        className={
                          currentPage === pageToShow
                            ? "bg-green text-white"
                            : "hover:bg-blue"
                        }
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="hover:bg-blue"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Edit Department Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedDepartment && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-md">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Edit Department</h3>
                <Formik
                  initialValues={{
                    name: selectedDepartment.name,
                    company_id: selectedDepartment.company?.id || "",
                  }}
                  validationSchema={validationSchema}
                  onSubmit={async (values) => {
                    const departmentData = {
                      name: values.name,
                      company_id: values.company_id
                        ? Number(values.company_id)
                        : null,
                    };

                    try {
                      await dispatch(
                        updateDepartment({
                          id: selectedDepartment.id,
                          departmentData,
                        })
                      ).unwrap();
                      setIsEditModalOpen(false);
                      dispatch(clearSelectedDepartment());
                      dispatch(fetchAllDepartments()); // Refresh table after edit
                    } catch (err) {
                      // Error is handled in the slice
                    }
                  }}
                >
                  {({ values, isSubmitting }) => (
                    <Form className="space-y-4">
                      {/* Department Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Department Name <span className="text-red">*</span>
                        </label>
                        <Field
                          name="name"
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="mt-1 text-sm text-red"
                        />
                      </div>

                      {/* Company Selection */}
                      <div>
                        <label
                          htmlFor="company_id"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Company
                        </label>
                        <Field
                          as="select"
                          name="company_id"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Not Assigned to Any Company</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </Field>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green text-base font-medium text-white hover:bg-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Department"
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditModalOpen(false);
                            dispatch(clearSelectedDepartment());
                          }}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green  sm:mt-0 sm:w-auto sm:text-sm"
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
      <Dialog
        open={isViewUsersModalOpen}
        onOpenChange={setIsViewUsersModalOpen}
      >
        <DialogContent className="sm:max-w-lg">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Users in {selectedDepartment?.name}
            </h3>
            {selectedDepartment?.users &&
            selectedDepartment.users.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDepartment.users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No users in this department</p>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setIsViewUsersModalOpen(false)}
                className="bg-green hover:bg-blue text-white"
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
              This action will permanently delete this department. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDepartmentToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red hover:bg-red-600 text-white"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
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
  );
};

export default ManageDepartment;
