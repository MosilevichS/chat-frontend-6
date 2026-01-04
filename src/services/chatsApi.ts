import { apiSlice } from "@/src/services/apiSlice";
import type { IUser } from "../types/user";

export const userApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<IUser, void>({
      query: () => ({
        url: "chat/list/",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        // console.log(data);

        // dispatch(setUser(data));
      },
    }),
  }),
});

export const { useGetChatsQuery } = userApi;
