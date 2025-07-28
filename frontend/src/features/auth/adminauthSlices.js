import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import adminauthService from "./adminauthServices";

// ✅ Load admin from token if available
function adminAuthStatus() {
  const token = localStorage.getItem("admin-token");
  if (token === null) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      _id: decoded._id,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

const initialState = {
  adminData: adminAuthStatus(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// ✅ Admin login thunk
export const adminLogin = createAsyncThunk("admin/login", async (user, thunkAPI) => {
  try {
    return await adminauthService.adminLogin(user);
  } catch (error) {
    const message =
      (error.response?.data?.message) || error.message || "Login error";
    return thunkAPI.rejectWithValue(message);
  }
});

// ✅ Admin logout thunk
export const adminLogout = createAsyncThunk("admin/logout", async () => {
  await adminauthService.adminLogout();
});

export const adminauthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isLoading = false;
      state.isSuccess = false;
      state.message = "";
    },
    // ✅ Add this to allow manual setting from token or form
    setAdmin: (state, action) => {
      state.adminData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminLogout.fulfilled, (state) => {
        state.isError = false;
        state.isLoading = false;
        state.isSuccess = false;
        state.message = "";
        state.adminData = null;
      })
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.adminData = action.payload.data;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.adminData = null;
      });
  },
});

// ✅ Export actions
export const { reset, setAdmin } = adminauthSlice.actions;

// ✅ Export reducer
export default adminauthSlice.reducer;
