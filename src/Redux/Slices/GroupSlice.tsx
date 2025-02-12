import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"

interface Department {
  departmentName: string;
}

interface Subsidiary {
  subsidiaryName: string;
  tinNumber: string;
  departments: Department[];
}

interface Group {
  groupName: string;
  tinNumber: string;
  departments: Department[];
  subsidiaries: Subsidiary[];
}

interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null,
}

export const createGroup = createAsyncThunk(
  "group/createGroup",
  async (groupData: Group & { organization_id: number }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/v1/holding-company/create`,
        groupData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
        }
      );
      showSuccessToast("Group created successfully");
      return response.data.holdingCompany;
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Failed to create group");
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

const groupSlice = createSlice({
  name: "group",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false
        state.groups.push(action.payload)
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = groupSlice.actions
export default groupSlice.reducer