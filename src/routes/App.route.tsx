// @ts-nocheck
import { FunctionComponent } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import HomeLayout from "../Layout/Home.layout";
import Home from "../pages/Home.page";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import Aboutus from "../pages/AboutUs";
import * as React from "react";
import AdminDashbordLayout from "../components/dashboard/Admin/AdminDashbordLayout";
import AdminDashHome from "../components/dashboard/Admin/AdminDashHome";
import EmployeeDashboard from "../components/dashboard/Employee/EmployeeDashboard";
import AdminTaskTable from "../components/dashboard/Admin/Tasks/AdminTaskTable";
import ProtectedRoute from "./ProtectedRoute";
import ManageUser from "../pages/ManageUser.page";
import PasswordResetRequestForm from "../pages/PasswordResetRequestForm";
import TwoFactorAuth from "../pages/TwoFactorAuth";
import ConfirmToChangePassword from "../pages/ConfirmToChangePassword";
import GroupPage from "../components/dashboard/Admin/Group/GroupPage";
import RegisterPage from "../components/dashboard/Admin/User/RegisterPage";
import SuperVisorDashHome from "../components/dashboard/SuperVisor/SuperVisorDashHome";
import SuperVisorDashboardLayout from "../components/dashboard/SuperVisor/SuperVisorDashbordLayout";
import TeamPage from "../components/dashboard/Admin/Team/TeamPage";
import AdminLevelsPage from "../components/dashboard/Admin/Level/Page";
import ManageTeam from "../components/dashboard/Admin/Team/ManageTeam";
import TaskReviewDashboard from "../components/dashboard/SuperVisor/TaskReview/TaskReviewDashboard";
import MembersOfSupervisorPage from "../components/dashboard/SuperVisor/Team/MembersOfSupervisorPage";
import CreatePositionPage from "../components/dashboard/Admin/Position/CreatePositionPage";
import ManagePosition from "../components/dashboard/Admin/Position/ManagePosition";
import CreateTask from "../components/dashboard/SuperVisor/Task/CreateTask";
import AllDepartment from "../components/dashboard/Admin/Department/AllDepartment";
import AllCompanies from "../components/dashboard/Admin/Companies/AllCompanies";
import TeamTasksDashboard from "../components/dashboard/Admin/Team/TeamTasksDashboard";
import TaskReportDashboard from "../components/dashboard/SuperVisor/TaskReport/TaskReportDashboard";
import SystemLeaderDashboard from "../components/dashboard/system-leader/SystemLeaderDashboard";
import SystemLeaderDashboardLayout from "../components/dashboard/system-leader/SystemLeaderDashboardLayout";
import CreatePageOrganization from "../components/dashboard/system-leader/Organisation/CreatePageOrganization";
import SupervisoryManagementPage from "../components/dashboard/Admin/Level/SupervisoryManagementPage";
import ChangeSystemLeader from "../components/dashboard/system-leader/ChangeSystemLeader";
const AppRoutes: FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/about" element={<Aboutus />} />
          <Route
            path="/forgot-password"
            element={<PasswordResetRequestForm />}
          />
          <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
          <Route
            path="/change-password"
            element={<ConfirmToChangePassword />}
          />
          <Route
            path="/employeeDashboard"
            element={
              <ProtectedRoute roles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route element={<AdminDashbordLayout />}>
          <Route
            index
            path="/admin"
            element={
              <ProtectedRoute roles={["overall"]}>
                <AdminDashHome />
              </ProtectedRoute>
            }
          />
          <Route index path="admin/all-tasks" element={<AdminTaskTable />} />
          <Route index path="admin/level" element={<AdminLevelsPage />} />

          {/*  */}

          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ManageUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-position"
            element={
              <ProtectedRoute roles={["overall", "supervisor"]}>
                <CreatePositionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-position"
            element={
              <ProtectedRoute roles={["overall", "supervisor"]}>
                <ManagePosition />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/team"
            element={
              <ProtectedRoute roles={["overall"]}>
                <TeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute roles={["overall"]}>
                <ManageTeam />
              </ProtectedRoute>
            }
          />
          {/* TeamsPage */}
          <Route
            path="/admin/create-group"
            element={
              <ProtectedRoute roles={["overall"]}>
                <GroupPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/register"
            element={
              <ProtectedRoute roles={["overall"]}>
                <RegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams-tasks"
            element={
              <ProtectedRoute roles={["overall"]}>
                <TeamTasksDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute roles={["overall"]}>
                <AllDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute roles={["overall"]}>
                <AllCompanies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management-page"
            element={
              <ProtectedRoute roles={["overall", "supervisor"]}>
                <SupervisoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team-tasks"
            element={
              <ProtectedRoute roles={["overall"]}>
                <TaskReviewDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route element={<SuperVisorDashboardLayout />}>
          <Route
            index
            path="/super-visor"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <SuperVisorDashHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/task-report"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <TaskReportDashboard />
              </ProtectedRoute>
            }
          />
          {/*  */}
          <Route
            path="/supervisor/review"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <TaskReviewDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/tasks/create"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-visor/team/my-team"
            element={
              <ProtectedRoute roles={["supervisor"]}>
                <MembersOfSupervisorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/supervisor/tasks-team/"
            element={<ProtectedRoute roles={["supervisor"]}></ProtectedRoute>}
          />
        </Route>
        <Route element={<SystemLeaderDashboardLayout />}>
          <Route
            path="/system-leader"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <SystemLeaderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-leader/create-organization"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <CreatePageOrganization />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-leader/change-system-leader"
            element={
              <ProtectedRoute roles={["system_leader"]}>
                <ChangeSystemLeader />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
