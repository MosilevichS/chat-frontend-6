import { createSlice } from "@reduxjs/toolkit";
import type { IUser } from "../../types/user";

type UserState = {
  user: IUser | null;
};

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: { payload: IUser }) => {
      state.user = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
