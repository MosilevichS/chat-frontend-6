import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  phone: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isProfileFilled: boolean;
};

const initialState: AuthState = {
  phone: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isProfileFilled: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ access: string; refresh: string; is_filled: boolean }>,
    ) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.isAuthenticated = true;
      state.isProfileFilled = action.payload.is_filled;
    },
    logout: () => initialState,
  },
});

export const { setPhone, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
