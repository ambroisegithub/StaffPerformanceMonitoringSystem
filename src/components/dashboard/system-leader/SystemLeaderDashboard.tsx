// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../Redux/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import {
  Building,
  Users,
  BarChart2,
  Plus,
  RefreshCw,
  Search,
  Briefcase,
  Loader2,
} from "lucide-react";
import Loader from "../../ui/Loader";
import {
  fetchOrganizations,
  fetchSystemStats,
  createOrganization,
  assignAdmin,
  deleteOrganization,
  deactivateOrganization,
  activateOrganization,
} from "../../../Redux/Slices/SystemLeaderSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Link } from "react-router-dom";

const SystemLeaderDashboard = () => {
  const dispatch = useAppDispatch();
  const { organizations, systemStats, loading } = useAppSelector(
    (state) => state.systemLeader
  );
  const user = useAppSelector((state) => state.login.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isAssignAdminModalOpen, setIsAssignAdminModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  interface Organization {
    id: number;
    name: string;
    description?: string;
    admin?: {
      name: string;
      email: string;
    };
    stats?: {
      totalUsers: number;
    };
    status?: string;
  }

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [deletingOrgId, setDeletingOrgId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newOrgData, setNewOrgData] = useState({
    name: "",
    description: "",
    adminDetails: {
      firstName: "",
      lastName: "",
      email: "",
      telephone: "",
    },
  });
  const [newAdminData, setNewAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrganizations());
      dispatch(fetchSystemStats());
    }
  }, [user, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchOrganizations());
    dispatch(fetchSystemStats());
  };

  const handleCreateOrganization = async () => {
    await dispatch(createOrganization(newOrgData));
    setIsCreateOrgModalOpen(false);
    setCurrentStep(1);
    setNewOrgData({
      name: "",
      description: "",
      adminDetails: {
        firstName: "",
        lastName: "",
        email: "",
        telephone: "",
      },
    });
  };

  const handleAssignAdmin = async () => {
    if (!selectedOrganization) return;
    await dispatch(
      assignAdmin({
        organizationId: selectedOrganization.id,
        adminDetails: newAdminData,
      })
    );
    setIsAssignAdminModalOpen(false);
    setNewAdminData({
      firstName: "",
      lastName: "",
      email: "",
      telephone: "",
    });
  };

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description &&
        org.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const paginatedOrganizations = filteredOrganizations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOrganizations.length / itemsPerPage);
  const NavigatetoTeamCreateOrganization = [
    { path: "/system-leader/create-organization" },
  ];
  if (loading && organizations.length === 0) {
    return <Loader />;
  }

  const handleNavigateToCreateOrganization = () => {
    navigate("/system-leader/create-organization");
  };

  const handleDeleteClick = (id: number) => {
    setOrganizationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (organizationToDelete) {
      try {
        setIsDeleting(true);
        setDeletingOrgId(organizationToDelete);
        await dispatch(deleteOrganization(organizationToDelete)).unwrap();
        dispatch(fetchOrganizations());
      } catch (error) {
      } finally {
        setIsDeleting(false);
        setDeletingOrgId(null);
        setIsDeleteModalOpen(false);
        setOrganizationToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 sm:px-4">
      {/* Compact Header Section */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Account Manager Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            {NavigatetoTeamCreateOrganization.map(({ path }) => (
              <Link
                key={path}
                to={path}
                className="bg-green outline-none text-white px-5 py-2 rounded-md flex flex-row items-center justify-between gap-2"
                onClick={handleNavigateToCreateOrganization}
              >
                <Plus className="text-white font-bold" size={20} />
                Create Organization
              </Link>
            ))}
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setIsCreateOrgModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Compact Statistics Bar */}
      {systemStats && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <div className="grid grid-cols-4 gap-2 divide-x divide-gray-200">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center p-2">
                  <Building className="h-5 w-5 text-blue mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Organizations</p>
                    <p className="text-lg font-bold">
                      {systemStats.totalOrganizations}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of organizations in the system</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center p-2 pl-4">
                  <Users className="h-5 w-5 text-green mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Users</p>
                    <p className="text-lg font-bold">
                      {systemStats.totalUsers}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total users: {systemStats.totalUsers}</p>
                  <p>Admins: {systemStats.usersByRole.admins}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center p-2 pl-4">
                  <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Supervisors</p>
                    <p className="text-lg font-bold">
                      {systemStats.usersByRole.supervisors}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total supervisors across all organizations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center p-2 pl-4">
                  <BarChart2 className="h-5 w-5 text-orange-500 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Employees</p>
                    <p className="text-lg font-bold">
                      {systemStats.usersByRole.employees}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total employees across all organizations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Optimized Tab Layout */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="w-full flex bg-gray-100 p-1 rounded-lg h-9">
          <TabsTrigger value="overview" className="flex-1 py-1 text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex-1 py-1 text-sm">
            Organizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-2">
          {systemStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">
                    Top Organizations by User Count
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {systemStats.topOrganizationsByUsers
                      .slice(
                        0,
                        showAll ? systemStats.topOrganizationsByUsers.length : 3
                      )
                      .map((org) => (
                        <div
                          key={org.id}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <div className="text-sm font-medium">{org.name}</div>
                          <Badge className="bg-blue text-white text-xs">
                            {org.userCount} users
                          </Badge>
                        </div>
                      ))}
                    {systemStats.topOrganizationsByUsers.length > 3 && (
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue text-sm mt-2"
                      >
                        {showAll ? "View Less" : "View All"}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">
                    User Distribution by Role
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>System Leaders</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{
                              width: `${
                                (systemStats.usersByRole.systemLeaders /
                                  systemStats.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>{systemStats.usersByRole.systemLeaders}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Admins</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-blue h-1.5 rounded-full"
                            style={{
                              width: `${
                                (systemStats.usersByRole.admins /
                                  systemStats.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>{systemStats.usersByRole.admins}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Supervisors</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-green h-1.5 rounded-full"
                            style={{
                              width: `${
                                (systemStats.usersByRole.supervisors /
                                  systemStats.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>{systemStats.usersByRole.supervisors}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Employees</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div
                            className="bg-orange h-1.5 rounded-full"
                            style={{
                              width: `${
                                (systemStats.usersByRole.employees /
                                  systemStats.totalUsers) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span>{systemStats.usersByRole.employees}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Organizations Tab Content */}
        <TabsContent value="organizations" className="space-y-4 mt-2">
          {/* Search and Filters Bar */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <div className="relative flex-1">
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
              <Input
                placeholder="Search organizations..."
                className="pl-8 h-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Organizations Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Users</TableHead>
                  <TableHead className="hidden lg:table-cell">Admin</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrganizations.map((org) => (
                 <TableRow key={org.id} className={org.status !== "Active" ? "bg-gray-50" : ""}>
                    <TableCell>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-gray-500">
                        {org.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{org.stats.totalUsers}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {org.admin ? (
                        <div>
                          <p>{org.admin.name}</p>
                          <p className="text-xs text-gray-500">
                            {org.admin.email}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-red">
                          No admin
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {org.status === "Active" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red border-red hover:bg-red hover:text-white transition-colors"
                            onClick={() => {
                              // Add loading state management
                              setActionInProgress(org.id);
                              dispatch(deactivateOrganization(org.id)).finally(
                                () => setActionInProgress(null)
                              );
                            }}
                            disabled={actionInProgress === org.id}
                          >
                            {actionInProgress === org.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Deactivating...
                              </>
                            ) : (
                              "Deactivate"
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green border-green hover:bg-green hover:text-white transition-colors"
                            onClick={() => {
                              setActionInProgress(org.id);
                              dispatch(activateOrganization(org.id)).finally(
                                () => setActionInProgress(null)
                              );
                            }}
                            disabled={actionInProgress === org.id}
                          >
                            {actionInProgress === org.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Activating...
                              </>
                            ) : (
                              "Activate"
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2 border-t">
                <p className="text-xs text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredOrganizations.length
                  )}{" "}
                  of {filteredOrganizations.length}
                </p>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    &lt;
                  </Button>
                  {[...Array(totalPages)].map((_, i) => {
                    // Show only current ±1 pages for simplicity
                    if (
                      i + 1 === 1 ||
                      i + 1 === totalPages ||
                      (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={i}
                          variant={
                            currentPage === i + 1 ? "default" : "outline"
                          }
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      );
                    }
                    // Add ellipsis for skipped pages
                    if (
                      i + 1 === currentPage - 2 ||
                      i + 1 === currentPage + 2
                    ) {
                      return (
                        <span key={i} className="px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    &gt;
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Multi-step Create Organization Modal */}
      <Dialog
        open={isCreateOrgModalOpen}
        onOpenChange={(open) => {
          setIsCreateOrgModalOpen(open);
          if (!open) setCurrentStep(1);
        }}
      >
        <DialogContent className="sm:max-w-[450px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Create New Organization</DialogTitle>
            <div className="flex mt-2">
              <div
                className={`flex-1 h-1 ${
                  currentStep >= 1 ? "bg-green" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`flex-1 h-1 ml-1 ${
                  currentStep >= 2 ? "bg-green" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </DialogHeader>

          {currentStep === 1 && (
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">
                    Organization Name <span className="text-red">*</span>
                  </label>
                  <Input
                    id="name"
                    className="mt-1"
                    value={newOrgData.name}
                    onChange={(e) =>
                      setNewOrgData({ ...newOrgData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    className="mt-1"
                    rows={3}
                    value={newOrgData.description}
                    onChange={(e) =>
                      setNewOrgData({
                        ...newOrgData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-4 px-0">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOrgModalOpen(false)}
                  className="hover:bg-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!newOrgData.name}
                  className="bg-green text-white"
                >
                  Next
                </Button>
              </DialogFooter>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-4">
              <h4 className="text-sm font-medium mb-3">Admin Details</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="adminFirstName"
                      className="text-sm font-medium"
                    >
                      First Name
                    </label>
                    <Input
                      id="adminFirstName"
                      className="mt-1"
                      value={newOrgData.adminDetails.firstName}
                      onChange={(e) =>
                        setNewOrgData({
                          ...newOrgData,
                          adminDetails: {
                            ...newOrgData.adminDetails,
                            firstName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="adminLastName"
                      className="text-sm font-medium"
                    >
                      Last Name
                    </label>
                    <Input
                      id="adminLastName"
                      className="mt-1"
                      value={newOrgData.adminDetails.lastName}
                      onChange={(e) =>
                        setNewOrgData({
                          ...newOrgData,
                          adminDetails: {
                            ...newOrgData.adminDetails,
                            lastName: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="adminEmail" className="text-sm font-medium">
                    Email <span className="text-red">*</span>
                  </label>
                  <Input
                    id="adminEmail"
                    type="email"
                    className="mt-1"
                    value={newOrgData.adminDetails.email}
                    onChange={(e) =>
                      setNewOrgData({
                        ...newOrgData,
                        adminDetails: {
                          ...newOrgData.adminDetails,
                          email: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="adminTelephone"
                    className="text-sm font-medium"
                  >
                    Telephone
                  </label>
                  <Input
                    id="adminTelephone"
                    className="mt-1"
                    value={newOrgData.adminDetails.telephone}
                    onChange={(e) =>
                      setNewOrgData({
                        ...newOrgData,
                        adminDetails: {
                          ...newOrgData.adminDetails,
                          telephone: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-4 px-0">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateOrganization}
                  disabled={!newOrgData.adminDetails.email}
                  className="bg-green text-white"
                >
                  Create
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setIsDeleteModalOpen(false);
            setOrganizationToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this Organization. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setOrganizationToDelete(null);
              }}
              disabled={isDeleting}
              className="hover:bg-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Admin Modal */}
      <Dialog
        open={isAssignAdminModalOpen}
        onOpenChange={setIsAssignAdminModalOpen}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Assign Admin to Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <Input
                  id="firstName"
                  className="mt-1"
                  value={newAdminData.firstName}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  className="mt-1"
                  value={newAdminData.lastName}
                  onChange={(e) =>
                    setNewAdminData({
                      ...newAdminData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red">*</span>
              </label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={newAdminData.email}
                onChange={(e) =>
                  setNewAdminData({
                    ...newAdminData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="telephone" className="text-sm font-medium">
                Telephone
              </label>
              <Input
                id="telephone"
                className="mt-1"
                value={newAdminData.telephone}
                onChange={(e) =>
                  setNewAdminData({
                    ...newAdminData,
                    telephone: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignAdminModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignAdmin}
              disabled={!newAdminData.email}
              className="bg-green text-white"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemLeaderDashboard;
