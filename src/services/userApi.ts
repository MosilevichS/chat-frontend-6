import { apiSlice } from "@/src/services/apiSlice";
import { setUser } from "@/src/store/slices/userSlice";
import type { IUser } from "../types/user";

export const userApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.mutation<IUser, void>({
      query: () => ({
        url: "/auth/messenger/profile/",
        method: "POST",
        body: {},
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setUser(data));
      },
    }),

    updateProfile: builder.mutation<IUser, Partial<IUser>>({
      query: body => ({
        url: "/auth/messenger/profile/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetProfileMutation, useUpdateProfileMutation } = userApi;
