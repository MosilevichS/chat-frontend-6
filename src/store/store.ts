import { configureStore } from "@reduxjs/toolkit";
import { privateApi, publicApi } from "@/src/services/baseApi";
<<<<<<< HEAD
import { groupOrChannelCreationApi } from "@/src/services/groupOrChannelCreationApi";
import { chatSlice } from "./slices/chatSlice";
=======
import userReducer from "./slices/userSlice";
>>>>>>> origin/dev

export const store = configureStore({
  reducer: {
    [privateApi.reducerPath]: privateApi.reducer,
    [publicApi.reducerPath]: publicApi.reducer,
<<<<<<< HEAD
    [groupOrChannelCreationApi.reducerPath]: groupOrChannelCreationApi.reducer,
    chat: chatSlice.reducer,
=======
    user: userReducer,
>>>>>>> origin/dev
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(privateApi.middleware).concat(publicApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
