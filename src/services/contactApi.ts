import { privateApi } from "@/src/services/baseApi";

import type { IUser } from "../types/user";

export const contactApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getContacts: builder.query<IUser, void>({
      query: () => "/contacts",
      providesTags: ["Contacts"],
    }),
    addContactByPhone: builder.mutation<IUser, Partial<IUser>>({
      query: body => ({
        url: "/contacts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const { useGetContactsQuery, useAddContactByPhoneMutation } = contactApi;
