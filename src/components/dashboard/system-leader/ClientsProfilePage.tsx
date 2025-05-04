
// @ts-nocheck
"use client"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks"
import { fetchOrganizations } from "../../../Redux/Slices/SystemLeaderSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Badge } from "../../ui/Badge"
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import {
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  User,
  Edit,
  RefreshCw,
} from "lucide-react"
import Loader from "../../ui/Loader"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Separator } from "../../ui/separator"
import { ScrollArea } from "../../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table"
const ClientsProfilePage = () => {
  const dispatch = useAppDispatch()
  const { organizations, loading } = useAppSelector((state) => state.systemLeader)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get the selected organization directly from the organizations array
  const selectedOrganization = organizations.find((org) => org.id === selectedOrgId) || null

  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  const handleOrganizationSelect = (orgId: number) => {
    setSelectedOrgId(orgId)
  }

  const handleRefreshData = () => {
    setIsRefreshing(true)
    dispatch(fetchOrganizations()).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500) // Add a small delay to make the refresh animation visible
    })
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.description && org.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading && organizations.length === 0) {
    return <Loader />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Organizations List Panel */}
        <Card className="w-full lg:w-1/3 h-[calc(100vh-120px)]">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Clients</CardTitle>
                <CardDescription>View and manage client organizations</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefreshData}
                      disabled={isRefreshing}
                      className="h-8 w-8"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                      <span className="sr-only">Refresh data</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh client data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search organizations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-240px)]">
              <div className="px-4 pb-4 space-y-2">
                {filteredOrganizations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No organizations found</div>
                ) : (
                  filteredOrganizations.map((org) => (
                    <div
                      key={org.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedOrgId === org.id
                          ? "bg-blue text-white"
                          : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => handleOrganizationSelect(org.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-gray-200">
                          <AvatarFallback className="bg-blue/10 text-blue">
                            {org.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{org.name}</p>
                          <p
                            className={`text-xs truncate ${selectedOrgId === org.id ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {org.description || "No description"}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            org.status === "Active"
                              ? selectedOrgId === org.id
                                ? "bg-green/20 text-white border-green/30"
                                : "bg-green/10 text-green border-green/30"
                              : selectedOrgId === org.id
                                ? "bg-red/20 text-white border-red/30"
                                : "bg-red/10 text-red border-red/30"
                          }`}
                        >
                          {org.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Organization Details Panel */}
        <div className="w-full lg:w-2/3">
          {selectedOrganization ? (
            <OrganizationDetails
              organization={selectedOrganization}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <Card className="h-[calc(100vh-120px)] flex items-center justify-center">
              <CardContent className="text-center p-6">
                <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Client Selected</h3>
                <p className="text-gray-500 max-w-md">
                  Select a client from the list to view their detailed information and statistics.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

interface OrganizationDetailsProps {
  organization: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

const OrganizationDetails = ({ organization, activeTab, setActiveTab }: OrganizationDetailsProps) => {
  return (
    <Card className="h-[calc(100vh-120px)]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{organization.name}</CardTitle>
              <Badge
                variant="outline"
                className={`${
                  organization.status === "Active"
                    ? "bg-green/10 text-green border-green/30"
                    : "bg-red/10 text-red border-red/30"
                }`}
              >
                {organization.status || "Unknown"}
              </Badge>
            </div>
            <CardDescription className="mt-1">{organization.description || "No description provided"}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="company">Company Info</TabsTrigger>
              <TabsTrigger value="contacts">Contacts Person</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(100vh-260px)]">
            <div className="px-6 pb-6">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Sector</p>
                          <p className="text-sm text-gray-500">{organization.sectorOfBusiness || "Not specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Registration Date</p>
                          <p className="text-sm text-gray-500">
                            {organization.contactPerson?.dateOfRegistration
                              ? new Date(organization.contactPerson.dateOfRegistration).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Registration Number</p>
                          <p className="text-sm text-gray-500">
                            {organization.contactPerson?.registrationNumber || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">User Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Users</span>
                        <Badge variant="outline" className="bg-blue/10 text-blue">
                          {organization.stats?.totalUsers || 0}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Admins</span>
                          <span className="font-medium">{organization.stats?.usersByRole?.admins || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Supervisors</span>
                          <span className="font-medium">{organization.stats?.usersByRole?.supervisors || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Employees</span>
                          <span className="font-medium">{organization.stats?.usersByRole?.employees || 0}</span>
                        </div>
                        {organization.stats?.usersByRole?.systemLeaders > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span>System Leaders</span>
                            <span className="font-medium">{organization.stats?.usersByRole?.systemLeaders || 0}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">System Administrator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {organization.systemAdmin?.firstName || organization.systemAdmin?.lastName ? (
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {organization.systemAdmin.firstName?.charAt(0) || "A"}
                            {organization.systemAdmin.lastName?.charAt(0) || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {organization.systemAdmin.firstName} {organization.systemAdmin.lastName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{organization.systemAdmin.email || "No email"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{organization.systemAdmin.telephone || "No phone"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No system administrator assigned</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Address</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.address || "Not specified"}
                              {organization.companyInfo?.city && `, ${organization.companyInfo.city}`}
                              {organization.companyInfo?.country && `, ${organization.companyInfo.country}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.email || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Telephone</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.telephone || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Website</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.website ? (
                                <a
                                  href={organization.companyInfo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue hover:underline"
                                >
                                  {organization.companyInfo.website}
                                </a>
                              ) : (
                                "Not specified"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">P.O. Box</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.poBox || "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Road Number</p>
                            <p className="text-sm text-gray-500">
                              {organization.companyInfo?.roadNumber || "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="mt-0">
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Contact Persons</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organization.contactPersons?.length > 0 ? (
              organization.contactPersons.map((contactPerson, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      {contactPerson.name || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      {contactPerson.position || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {contactPerson.email || "Not specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {contactPerson.telephone || "Not specified"}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : organization.contactPerson?.name ? (
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    {organization.contactPerson.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    {organization.contactPerson.position || "Not specified"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {organization.contactPerson.email || "Not specified"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {organization.contactPerson.telephone || "Not specified"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell className="text-center text-gray-500 py-4 w-[100%]">
                  No contact person information available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ClientsProfilePage