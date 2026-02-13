import { privateApi } from "@/src/services/baseApi";

import type { IUser } from "../types/user";
import type { IAvatarResponse } from "../types/avatar";


export const userApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<IUser, void>({
      query: () => "/user",
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<IUser, Partial<IUser>>({
      query: formData => ({
        url: "/user",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    updateAvatar: builder.mutation<IAvatarResponse, FormData>({
      query: body => ({
        url: "auth/messenger/profile/avatar/download",
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

export const createAvatarFormData = (file: File): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

export const {useUpdateAvatarMutation, useGetProfileQuery, useUpdateProfileMutation, useDeleteProfileMutation } = userApi;
