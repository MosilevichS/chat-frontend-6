import { configureStore } from "@reduxjs/toolkit";
import { privateApi, publicApi } from "@/src/services/baseApi";
import { groupOrChannelCreationApi } from "@/src/services/groupOrChannelCreationApi";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    [privateApi.reducerPath]: privateApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
    [groupOrChannelCreationApi.reducerPath]: groupOrChannelCreationApi.reducer,
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(privateApi.middleware)
      .concat(publicApi.middleware)
      .concat(groupOrChannelCreationApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
