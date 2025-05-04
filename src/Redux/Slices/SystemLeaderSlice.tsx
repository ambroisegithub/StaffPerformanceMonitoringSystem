import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { RootState } from "../store";

// Define the Organization interface
interface Organization {
  id: number;
  name: string;
  description: string;
  // Company Information
  address?: string;
  city?: string;
  country?: string;
  roadNumber?: string;
  poBox?: string;
  telephone?: string;
  email?: string;
  website?: string;
  tinNumber?: string;
  // Contact Person Information
  contactPersons: Array<{
    name: string;
    position: string;
    telephone: string;
    email: string;
  }>;
  // System Administrator Profile
  systemAdminFirstName?: string;
  systemAdminLastName?: string;
  systemAdminEmail?: string;
  systemAdminTelephone?: string;
  hasSubsidiaries: boolean;

  stats: {
    usersByRole: any;
    totalUsers: number;
    admins: number;
    supervisors: number;
    employees: number;
  };
}

interface SystemStats {
  totalOrganizations: number;
  totalUsers: number;
}

// Define the SystemLeaderState interface
interface SystemLeaderState {
  organizations: Organization[];
  systemStats: SystemStats | null;
  selectedOrganization: Organization | null;
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
  updateError: string | null;
}

// Define the initial state
const initialState: SystemLeaderState = {
  organizations: [],
  systemStats: null,
  selectedOrganization: null,
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
};
export const assignAdmin = createAsyncThunk(
  "systemLeader/assignAdmin",
  async (
    { organizationId }: { organizationId: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/admin`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(fetchOrganizations());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to assign admin"
      );
    }
  }
);
// Create the fetchOrganizations async thunk
export const fetchOrganizations = createAsyncThunk(
  "systemLeader/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/all-organizations`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organizations"
      );
    }
  }
);

export const fetchSummaryreportOfOrganization = createAsyncThunk(
  "systemAdministrator/fetchSummaryreportOfOrganization",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/summary-report`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Summary report Of Organization"
      );
    }
  }
);

export const getTaskStatusOverview = createAsyncThunk(
  "systemAdministrator/getTaskStatusOverview",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/task-status-overview`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "get Task Status Overview"
      );
    }
  }
);
export const getEmployeePerformance = createAsyncThunk(
  "systemAdministrator/getEmployeePerformance",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem("token");
      const state = getState() as RootState;
      const organizationId = state.login.user?.organization?.id;
      if (!organizationId) {
        throw new Error("Organization ID is missing");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/employee-performance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "get Employee Performance"
      );
    }
  }
);

export const updateOrganization = createAsyncThunk(
  "systemLeader/updateOrganization",
  async (
    { id, data }: { id: number; data: any },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Organization updated successfully!");
      dispatch(fetchOrganizations());
      return response.data.data;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update organization"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update organization"
      );
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  "systemLeader/fetchSystemStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/stats`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system stats"
      );
    }
  }
);
export const deleteOrganization = createAsyncThunk(
  "systemLeader/deleteOrganization",
  async (organizationId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Organization deleted successfully!");

      dispatch(fetchOrganizations());
      dispatch(fetchSystemStats());

      return response.data;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete organization"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete organization"
      );
    }
  }
);

export const createOrganization = createAsyncThunk(
  "systemLeader/createOrganization",
  async (newOrgData: any, { dispatch, rejectWithValue }) => {
    try {
      // Format the contact persons data for the backend
      const formattedData = {
        ...newOrgData,
        contactPersons: newOrgData.contactPersons || [] // Ensure it's always an array
      };

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(fetchOrganizations());
      dispatch(fetchSystemStats());
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create organization"
      );
    }
  }
);
export const changeSystemLeader = createAsyncThunk(
  "systemLeader/changeSystemLeader",
  async (newchangeSystemLeaderData: any, { dispatch, rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/change-system-leader`,
        newchangeSystemLeaderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Fail to Change new change System Leader"
      );
    }
  }
);

export const getOrganizationById = createAsyncThunk(
  "systemLeader/getOrganizationById",
  async (organizationId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch organization details"
      );
    }
  }
);
export const activateOrganization = createAsyncThunk(
  "systemLeader/activateOrganization",
  async (organizationId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Organization activated successfully!");
      dispatch(fetchOrganizations());
      return response.data;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to activate organization"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to activate organization"
      );
    }
  }
);

export const deactivateOrganization = createAsyncThunk(
  "systemLeader/deactivateOrganization",
  async (organizationId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/v1/organizations/${organizationId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Organization deactivated successfully!");
      dispatch(fetchOrganizations());
      return response.data;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to deactivate organization"
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to deactivate organization"
      );
    }
  }
);
// Create the systemLeader slice
const systemLeaderSlice = createSlice({
  name: "systemLeader",
  initialState,
  reducers: {
    setSelectedOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter(
          (organization) => organization.id !== action.payload
        );
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrganization.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.updateLoading = false;
        // If the selected organization is the one being updated, update it
        if (
          state.selectedOrganization &&
          state.selectedOrganization.id === action.payload.id
        ) {
          state.selectedOrganization = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      .addCase(createOrganization.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        toast.success("Organization created successfully");
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrganizationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrganization = action.payload;
      })
      .addCase(assignAdmin.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(getOrganizationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(activateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateOrganization.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(activateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Deactivate Organization
      .addCase(deactivateOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateOrganization.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deactivateOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSummaryreportOfOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSummaryreportOfOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchSummaryreportOfOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getTaskStatusOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTaskStatusOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(getTaskStatusOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getEmployeePerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmployeePerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(getEmployeePerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(changeSystemLeader.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeSystemLeader.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeSystemLeader.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
      
  },
});

export const { setSelectedOrganization } = systemLeaderSlice.actions;

export default systemLeaderSlice.reducer;
