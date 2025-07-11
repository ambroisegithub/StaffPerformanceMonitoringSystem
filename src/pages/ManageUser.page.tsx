// @ts-nocheck
"use client";
import React from "react";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  updateUserRole,
  deleteUser,
  deactivateUser
} from "../Redux/Slices/ManageUserSlice";
import {
  updateUser,
  clearError as clearAuthError,
  clearSuccess as clearAuthSuccess,
} from "../Redux/Slices/AuthSlice";
import {
  fetchHoldingCompanies,
  fetchSupervisoryLevels,
  fetchPositions,
  fetchOrganizationDepartments,
} from "../Redux/Slices/RegisterSlice";
import type { AppDispatch, RootState } from "../Redux/store";
import {
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  UserX,
  Shield,
  User,
  Briefcase,
  Filter,
  Settings,
  X,
  Save,
  Loader2,
  
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import Checkbox from "../components/ui/checkbox";
import { debounce } from "lodash";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";

const ManageUser: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.manageUser
  );
  const { currentUser, updateLoading, updateError, updateSuccess } =
    useSelector((state: RootState) => state.auth);
  const {
    holdingCompanies,
    supervisoryLevels,
    positions,
    organizationStructure,
  } = useSelector((state: RootState) => state.register);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isEditRoleVisible, setIsEditRoleVisible] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [activityFilter, setActivityFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>("");

const [userToDeactivate, setUserToDeactivate] = useState<number | null>(null);
const [deactivateMessage, setDeactivateMessage] = useState<string>("");

  // Update user modal states
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<any>(null);
  const [updateFormData, setUpdateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    supervisoryLevelId: "none",
    company_id: "none",
    department_id: "none",
    position_id: "none",
  });

  const { user: loggedInUser } = useSelector((state: RootState) => state.login);
  const hasSubsidiaries = loggedInUser?.organization?.hasSubsidiaries || false;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  useEffect(() => {
    if (loggedInUser?.organization?.id) {
      dispatch(fetchUsers(loggedInUser.organization.id));
      // Fetch data needed for update form
      dispatch(fetchHoldingCompanies());
      dispatch(fetchSupervisoryLevels());
      dispatch(fetchPositions());
      if (!hasSubsidiaries) {
        dispatch(fetchOrganizationDepartments());
      }
    }
  }, [dispatch, loggedInUser, hasSubsidiaries]);

  // Handle update success
  useEffect(() => {
    if (updateSuccess) {
      toast.success("User updated successfully!");
      setIsUpdateModalVisible(false);
      setUserToUpdate(null);
      resetUpdateForm();
      dispatch(clearAuthSuccess());
      // Refresh users list
      if (loggedInUser?.organization?.id) {
        dispatch(fetchUsers(loggedInUser.organization.id));
      }
    }
  }, [updateSuccess, dispatch, loggedInUser]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
      dispatch(clearAuthError());
    }
  }, [updateError, dispatch]);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    }, 300),
    []
  );

const handleDeactivateUser = async () => {
  if (userToDeactivate) {
    try {
      const resultAction = await dispatch(deactivateUser(userToDeactivate));
      if (deactivateUser.fulfilled.match(resultAction)) {
        setDeactivateMessage(resultAction.payload.message || "User deactivated successfully");
        // Refetch users after deactivation/activation
        if (loggedInUser?.organization?.id) {
          await dispatch(fetchUsers(loggedInUser.organization.id));
        }
      } else {
        setDeactivateMessage(resultAction.payload || "Failed to deactivate user");
      }
      setUserToDeactivate(null);
    } catch (error) {
      setDeactivateMessage("Failed to deactivate user");
      setUserToDeactivate(null);
    }
  }
};
  const handleBulkUpdateRole = async () => {
    if (!newRole) return;

    try {
      for (const userId of selectedUsers) {
        await dispatch(updateUserRole({ userId, newRole })).unwrap();
      }
      if (loggedInUser?.organization?.id) {
        dispatch(fetchUsers(loggedInUser.organization.id));
      }
      setSelectedUsers([]);
      setIsEditRoleVisible(false);
    } catch (error) {}
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await dispatch(deleteUser(userToDelete)).unwrap();
        setUserToDelete(null);
        setSelectedUsers((prev) => prev.filter((id) => id !== userToDelete));
      } catch (error) {}
    }
  };

  // Update user functions
  const handleUpdateUser = (user: any) => {
    setUserToUpdate(user);
    setUpdateFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      telephone: user.telephone || "",
      supervisoryLevelId: user.supervisoryLevelObj?.id?.toString() || "none",
      company_id: user.company?.id?.toString() || "none",
      department_id: user.department?.id?.toString() || "none",
      position_id: user.position?.id?.toString() || "none",
    });
    setIsUpdateModalVisible(true);
  };

  const resetUpdateForm = () => {
    setUpdateFormData({
      firstName: "",
      lastName: "",
      email: "",
      telephone: "",
      supervisoryLevelId: "none",
      company_id: "none",
      department_id: "none",
      position_id: "none",
    });
  };

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill logic for position selection
    if (field === "position_id" && value && value !== "none") {
      const selectedPosition = positions.find(
        (pos) => pos.id === Number(value)
      );
      if (selectedPosition) {
        if (selectedPosition.supervisoryLevel?.id) {
          setUpdateFormData((prev) => ({
            ...prev,
            supervisoryLevelId: selectedPosition.supervisoryLevel.id.toString(),
          }));
        }
        if (selectedPosition.department?.id) {
          setUpdateFormData((prev) => ({
            ...prev,
            department_id: selectedPosition.department.id.toString(),
          }));
        }
      }
    }

    // Clear dependent fields when company changes
    if (field === "company_id") {
      setUpdateFormData((prev) => ({
        ...prev,
        department_id: "none",
        position_id: "none",
        supervisoryLevelId: "none",
      }));
    }
  };

  const handleSubmitUpdate = async () => {
    if (!userToUpdate) return;

    const updateData: any = {};

    // Only include fields that have values and are not "none"
    if (updateFormData.firstName.trim())
      updateData.firstName = updateFormData.firstName.trim();
    if (updateFormData.lastName.trim())
      updateData.lastName = updateFormData.lastName.trim();
    if (updateFormData.email.trim())
      updateData.email = updateFormData.email.trim();
    if (updateFormData.telephone.trim())
      updateData.telephone = updateFormData.telephone.trim();

    // Handle special "none" values by converting to -1 (which will be handled in the backend)
    if (updateFormData.supervisoryLevelId !== "none") {
      updateData.supervisoryLevelId =
        updateFormData.supervisoryLevelId === "none"
          ? -1
          : Number(updateFormData.supervisoryLevelId);
    }
    if (updateFormData.company_id !== "none") {
      updateData.company_id =
        updateFormData.company_id === "none"
          ? -1
          : Number(updateFormData.company_id);
    }
    if (updateFormData.department_id !== "none") {
      updateData.department_id =
        updateFormData.department_id === "none"
          ? -1
          : Number(updateFormData.department_id);
    }
    if (updateFormData.position_id !== "none") {
      updateData.position_id =
        updateFormData.position_id === "none"
          ? -1
          : Number(updateFormData.position_id);
    }

    dispatch(updateUser({ userId: userToUpdate.id, userData: updateData }));
  };

  const getFilteredPositions = () => {
    if (!hasSubsidiaries || updateFormData.company_id === "none") {
      return positions;
    }
    return positions.filter(
      (position) =>
        position.company &&
        position.company.id === Number(updateFormData.company_id)
    );
  };

  const getDepartmentOptions = () => {
    if (!organizationStructure) return [];

    if (updateFormData.company_id !== "none") {
      const selectedSubsidiary = organizationStructure.subsidiaries?.find(
        (sub: any) => sub.id === Number(updateFormData.company_id)
      );
      return selectedSubsidiary?.departments || [];
    }

    return organizationStructure.departments || [];
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedRoles.length === 0 || selectedRoles.includes(user.role)) &&
      (activityFilter === "all" ||
        (activityFilter === "active" && user.role !== "disabled") ||
        (activityFilter === "disabled" && user.role === "disabled"))
  );

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === currentUsers.length
        ? []
        : currentUsers.map((user) => user.id)
    );
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setCurrentPage(1);
  };

  const getInitials = (username: string) => {
    return (
      username
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || username.substring(0, 2).toUpperCase()
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always show first page
    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key={1}
          onClick={() => handlePageChange(1)}
          variant="outline"
          size="sm"
          className="mx-1 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="ellipsis-start"
            className="mx-2 text-slate-400 font-medium"
          >
            ...
          </span>
        );
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
          className={`mx-1 transition-all duration-200 ${
            currentPage === i
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border-0"
              : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50"
          }`}
        >
          {i}
        </Button>
      );
    }

    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="mx-2 text-slate-400 font-medium">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <Button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          variant="outline"
          size="sm"
          className="mx-1 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
        >
          {totalPages}
        </Button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-8 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
        <Button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="mr-3 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {pageNumbers}
        </div>

        <Button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="ml-3 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-gray-700 to-slate-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-slate-600 mt-3 text-lg font-medium">
                Manage user accounts, roles, and permissions with ease
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <div className="bg-white rounded-full p-3 shadow-lg border border-slate-200">
                <Settings className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
            >
              <Card className="bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-emerald-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-emerald-700">
                    <div className="bg-emerald-100 rounded-full p-2 mr-3">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    All registered users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-purple-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-purple-700">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    Overall
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.filter((user) => user.role === "overall").length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    System administrators
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-blue-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-blue-700">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Supervisor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.filter((user) => user.role === "supervisor").length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Team supervisors
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-green-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-green-700">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Briefcase className="h-5 w-5 text-green-600" />
                    </div>
                    Employee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.filter((user) => user.role === "employee").length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Regular employees
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-red-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-red-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-red-700">
                    <div className="bg-red-100 rounded-full p-2 mr-3">
                      <UserX className="h-5 w-5 text-red-600" />
                    </div>
                    Disabled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.filter((user) => user.role === "disabled").length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Inactive accounts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-teal-50 shadow-lg hover:shadow-xl transition-all duration-300 border-0 ring-1 ring-slate-200 hover:ring-teal-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center text-teal-700">
                    <div className="bg-teal-100 rounded-full p-2 mr-3">
                      <UserCheck className="h-5 w-5 text-teal-600" />
                    </div>
                    Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-800">
                    {users.filter((user) => user.role !== "disabled").length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="mb-8 bg-gradient-to-r from-white to-slate-50 shadow-lg border-0 ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    {/* Search Bar */}
                    <div className="relative w-full xl:w-80">
                      <Search
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <Input
                        type="text"
                        placeholder="Search users by name or email..."
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl shadow-sm transition-all duration-200"
                      />
                    </div>

                    {/* Role Filters */}
                    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-600">
                          Filter by role:
                        </span>
                      </div>
                      {["overall", "supervisor", "employee", "disabled"].map(
                        (role) => (
                          <div
                            key={role}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`role-${role}`}
                              checked={selectedRoles.includes(role)}
                              onCheckedChange={() => handleRoleChange(role)}
                              className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <label
                              htmlFor={`role-${role}`}
                              className="text-sm font-medium text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors duration-200"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </label>
                          </div>
                        )
                      )}
                    </div>

                    {/* Status and Per Page Selectors */}
                    <div className="flex items-center gap-4">
                      <Select
                        value={activityFilter}
                        onValueChange={setActivityFilter}
                      >
                        <SelectTrigger className="w-48 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl shadow-sm transition-all duration-200">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="all"
                            className="hover:bg-emerald-50"
                          >
                            All Users
                          </SelectItem>
                          <SelectItem
                            value="active"
                            className="hover:bg-emerald-50"
                          >
                            Active Users
                          </SelectItem>
                          <SelectItem
                            value="disabled"
                            className="hover:bg-emerald-50"
                          >
                            Disabled Users
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={usersPerPage.toString()}
                        onValueChange={(value) =>
                          setUsersPerPage(Number(value))
                        }
                      >
                        <SelectTrigger className="w-48 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl shadow-sm transition-all duration-200">
                          <SelectValue placeholder="Results per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="10"
                            className="hover:bg-emerald-50"
                          >
                            10 per page
                          </SelectItem>
                          <SelectItem
                            value="25"
                            className="hover:bg-emerald-50"
                          >
                            25 per page
                          </SelectItem>
                          <SelectItem
                            value="50"
                            className="hover:bg-emerald-50"
                          >
                            50 per page
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Users Table */}
            {error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-red-200 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg">
                  <CardContent className="p-8">
                    <div className="text-red-600 flex flex-col items-center justify-center py-8">
                      <div className="bg-red-100 rounded-full p-4 mb-4">
                        <UserX className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="mb-4 font-semibold text-lg">{error}</p>
                      <Button
                        onClick={() =>
                          loggedInUser?.organization?.id &&
                          dispatch(fetchUsers(loggedInUser.organization.id))
                        }
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                      >
                        Try Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-white shadow-xl border-0 ring-1 ring-slate-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
<TableHeader>
  <TableRow className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
    <TableHead className="w-16 font-semibold text-slate-700 py-4">
      #
    </TableHead>
    <TableHead className="font-semibold text-slate-700 py-4">
      User Name
    </TableHead>

    <TableHead className="font-semibold text-slate-700 py-4">
      Company
    </TableHead>
    <TableHead className="font-semibold text-slate-700 py-4">
      Department
    </TableHead>
        <TableHead className="font-semibold text-slate-700 py-4">
      Position
    </TableHead>
    <TableHead className="font-semibold text-slate-700 py-4">
      Level
    </TableHead>
    {loggedInUser?.role !== "overall" && (
      <TableHead className="text-right font-semibold text-slate-700 py-4">
        Actions
      </TableHead>
    )}
  </TableRow>
</TableHeader>
<TableBody>
  <AnimatePresence>
    {currentUsers.map((tableUser, index) => (
      <motion.tr
        key={tableUser.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
        }}
        className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 border-b border-slate-100"
      >
        <TableCell className="font-medium text-slate-600 py-4">
          <div className="bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold text-slate-700">
            {indexOfFirstUser + index + 1}
          </div>
        </TableCell>

        <TableCell className="py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {getInitials(tableUser.username)}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {tableUser.username}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-4">
          <span className="text-slate-600 font-medium">
            {tableUser.company?.name ||
              loggedInUser?.organization?.name ||
              "N/A"}
          </span>
        </TableCell>

        <TableCell className="py-4">
          <span className="text-slate-600 font-medium">
            {tableUser.department?.name || "N/A"}
          </span>
        </TableCell>

                {/* Position column (instead of email) */}
        <TableCell className="py-4">
          <span className="text-slate-600 font-medium">
            {tableUser.position?.title || "N/A"}
          </span>
        </TableCell>

        <TableCell className="py-4">
          <span className="text-slate-600 font-medium">
            {tableUser.supervisoryLevel?.level || "N/A"}
          </span>
        </TableCell>

        <TableCell className="text-right py-4">
          <div className="flex justify-end space-x-2">
            {loggedInUser?.role !== "overall" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm"
                  onClick={() => handleUpdateUser(tableUser)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only md:not-sr-only md:ml-2">
                    Edit
                  </span>
                </Button>
<Button
          variant="outline"
          size="sm"
          className={`h-9 px-3 bg-white ${tableUser.isActive ? "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700" : "text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 hover:text-green-700"} transition-all duration-200 shadow-sm`}
          onClick={() => setUserToDeactivate(tableUser.id)}
        >
          {tableUser.isActive ? (
            <>
              <UserX className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Deactivate</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Inactive</span>
            </>
          )}
        </Button>
              </>
            )}
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
              </motion.div>
            )}

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Update User Modal - Fixed positioning and layout */}
        <Dialog
          open={isUpdateModalVisible}
          onOpenChange={setIsUpdateModalVisible}
        >
          <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-0 shadow-2xl rounded-3xl w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto z-50">
            <DialogHeader className="sticky top-0 bg-white z-10 pb-6 px-8  pt-0 border-b border-slate-100">
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center">
                <div className="bg-blue-50 rounded-full p-3 mr-4 border border-blue-100">
                  <Edit className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <span className="block">Update User</span>
                  <span className="text-lg font-medium text-slate-600 block mt-1">
                    {userToUpdate?.username}
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="px-8 py-6">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                      <div className="bg-slate-200 rounded-full p-3 mr-4">
                        <User className="h-6 w-6 text-slate-700" />
                      </div>
                      Personal Information
                    </h3>
                    <div className="h-1 bg-slate-300 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full w-16 transition-all duration-300"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={updateFormData.firstName}
                        onChange={(e) =>
                          handleUpdateFormChange("firstName", e.target.value)
                        }
                        placeholder="Enter first name"
                        className="bg-slate-100 border-2 border-slate-300 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={updateFormData.lastName}
                        onChange={(e) =>
                          handleUpdateFormChange("lastName", e.target.value)
                        }
                        placeholder="Enter last name"
                        className="bg-slate-100 border-2 border-slate-300 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={updateFormData.email}
                        onChange={(e) =>
                          handleUpdateFormChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        className="bg-slate-100 border-2 border-slate-300 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 cursor-not-allowed opacity-70"
                        disabled
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Telephone
                      </label>
                      <Input
                        value={updateFormData.telephone}
                        onChange={(e) =>
                          handleUpdateFormChange("telephone", e.target.value)
                        }
                        placeholder="Enter telephone number"
                        className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 hover:border-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center mb-4">
                      <div className="bg-blue-200 rounded-full p-3 mr-4">
                        <Briefcase className="h-6 w-6 text-blue-700" />
                      </div>
                      Company Information
                    </h3>
                    <div className="h-1 bg-blue-300 rounded-full">
                      <div className="h-full bg-blue-600 rounded-full w-20 transition-all duration-300"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {/* Company Selection (only if has subsidiaries) */}
                    {hasSubsidiaries && organizationStructure?.subsidiaries && (
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Company
                        </label>
                        <Select
                          value={updateFormData.company_id}
                          onValueChange={(value) =>
                            handleUpdateFormChange("company_id", value)
                          }
                        >
                          <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 hover:border-slate-400">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                            <SelectItem
                              value="none"
                              className="rounded-lg text-base py-3"
                            >
                              No Company
                            </SelectItem>
                            {organizationStructure.subsidiaries.map(
                              (company: any) => (
                                <SelectItem
                                  key={company.id}
                                  value={company.id.toString()}
                                  className="rounded-lg text-base py-3"
                                >
                                  {company.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Position Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Position
                      </label>
                      <Select
                        value={updateFormData.position_id}
                        onValueChange={(value) =>
                          handleUpdateFormChange("position_id", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 hover:border-slate-400">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="none"
                            className="rounded-lg text-base py-3"
                          >
                            No Position
                          </SelectItem>
                          {getFilteredPositions().map((position) => (
                            <SelectItem
                              key={position.id}
                              value={position.id.toString()}
                              className="rounded-lg text-base py-3"
                            >
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Department
                      </label>
                      <Select
                        value={updateFormData.department_id}
                        onValueChange={(value) =>
                          handleUpdateFormChange("department_id", value)
                        }
                        disabled={updateFormData.position_id !== "none"}
                      >
                        <SelectTrigger
                          className={`bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 ${
                            updateFormData.position_id !== "none"
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : "hover:border-slate-400"
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              updateFormData.position_id !== "none"
                                ? "Auto-filled from position"
                                : "Select department"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="none"
                            className="rounded-lg text-base py-3"
                          >
                            No Department
                          </SelectItem>
                          {getDepartmentOptions().map((dept: any) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                              className="rounded-lg text-base py-3"
                            >
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updateFormData.position_id !== "none" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <p className="text-xs text-blue-700 font-medium flex items-center">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Department is automatically filled based on selected
                            position
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Supervisory Level Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Supervisory Level
                      </label>
                      <Select
                        value={updateFormData.supervisoryLevelId}
                        onValueChange={(value) =>
                          handleUpdateFormChange("supervisoryLevelId", value)
                        }
                        disabled={updateFormData.position_id !== "none"}
                      >
                        <SelectTrigger
                          className={`bg-white border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-14 px-4 rounded-xl text-base font-medium transition-all duration-200 ${
                            updateFormData.position_id !== "none"
                              ? "opacity-60 cursor-not-allowed bg-slate-100"
                              : "hover:border-slate-400"
                          }`}
                        >
                          <SelectValue
                            placeholder={
                              updateFormData.position_id !== "none"
                                ? "Auto-filled from position"
                                : "Select supervisory level"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                          <SelectItem
                            value="none"
                            className="rounded-lg text-base py-3"
                          >
                            No Level
                          </SelectItem>
                          {supervisoryLevels.map((level) => (
                            <SelectItem
                              key={level.id}
                              value={level.id.toString()}
                              className="rounded-lg text-base py-3"
                            >
                              {level.level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updateFormData.position_id !== "none" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                          <p className="text-xs text-blue-700 font-medium flex items-center">
                            <svg
                              className="h-4 w-4 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Supervisory level is automatically filled based on
                            selected position
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white z-10 gap-6 px-8 pb-8 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUpdateModalVisible(false);
                  setUserToUpdate(null);
                  resetUpdateForm();
                }}
                className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 h-14 px-8 rounded-xl font-semibold text-base"
                disabled={updateLoading}
              >
                <X className="h-5 w-5 mr-3" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUpdate}
                disabled={updateLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 h-14 px-10 rounded-xl font-semibold text-base"
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Updating User...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    Update User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={isEditRoleVisible} onOpenChange={setIsEditRoleVisible}>
          <DialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Change Role for{" "}
                {selectedUsers.length > 1
                  ? `${selectedUsers.length} Users`
                  : "User"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select onValueChange={setNewRole}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-xl py-3">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl">
                  <SelectItem value="admin" className="hover:bg-emerald-50">
                    Admin
                  </SelectItem>
                  <SelectItem
                    value="supervisor"
                    className="hover:bg-emerald-50"
                  >
                    Supervisor
                  </SelectItem>
                  <SelectItem value="employee" className="hover:bg-emerald-50">
                    Employee
                  </SelectItem>
                  <SelectItem value="disabled" className="hover:bg-emerald-50">
                    Disabled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditRoleVisible(false)}
                className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpdateRole}
                disabled={!newRole}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={() => setUserToDelete(null)}
        >
          <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
            <AlertDialogHeader className="pb-4">
              <AlertDialogTitle className="text-xl font-bold text-slate-800 flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
                This action will permanently delete the user account and cannot
                be undone. All associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-200"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
  open={!!userToDeactivate}
  onOpenChange={() => setUserToDeactivate(null)}
>
  <AlertDialogContent className="bg-white border-0 shadow-2xl rounded-2xl max-w-md">
    <AlertDialogHeader className="pb-4">
      <AlertDialogTitle className="text-xl font-bold text-slate-800 flex items-center">
        <div className="bg-red-100 rounded-full p-2 mr-3">
          <UserX className="h-5 w-5 text-red-600" />
        </div>
        Are you absolutely sure?
      </AlertDialogTitle>
      <AlertDialogDescription className="text-slate-600 text-base leading-relaxed">
        This action will deactivate the user account and cannot be undone. All associated data will be preserved but the user will not be able to log in.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="gap-3">
      <AlertDialogCancel className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
        Cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDeactivateUser}
        className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 transition-all duration-200"
      >
        Deactivate User
      </AlertDialogAction>
    </AlertDialogFooter>
    {deactivateMessage && (
      <div className="mt-4 text-center text-sm text-red-600">{deactivateMessage}</div>
    )}
  </AlertDialogContent>
</AlertDialog>
      </div>
    </div>
  );
};

export default ManageUser;
