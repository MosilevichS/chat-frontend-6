import { configureStore } from "@reduxjs/toolkit";
import { privateApi, publicApi } from "@/src/services/baseApi";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    [privateApi.reducerPath]: privateApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(privateApi.middleware).concat(publicApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
