import { privateApi } from "@/src/services/baseApi";

import type { IUser } from "../types/user";

export const userApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<IUser, void>({
      query: () => "/user",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<IUser, Partial<IUser>>({
      query: body => ({
        url: "/user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    deleteProfile: builder.mutation<void, string>({
      query: uid => ({
        url: `auth/messenger/profile/${uid}`, // → /api/user/{uid}
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const { useGetProfileQuery, useUpdateProfileMutation, useDeleteProfileMutation } = userApi;
