import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/src/services/apiSlice";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
