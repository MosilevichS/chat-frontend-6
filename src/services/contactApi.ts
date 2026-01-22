import { privateApi } from "@/src/services/baseApi";
import type { IContact } from "../types/contact";

export const contactApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getContacts: builder.query<{ results: IContact[] }, void>({
      query: () => "/contacts",
      providesTags: ["Contacts"],
    }),
    addContactByPhone: builder.mutation<IContact, { phone: string }>({
      query: body => ({
        url: "/contacts/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),
    deleteContact: builder.mutation<void, { contact_uids: string[] }>({
      query: body => ({
        url: "/contacts/delete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),
    getUsersList: builder.query<{ results: IContact[] }, string[]>({
      query: body => ({
        url: "/contacts/list",
        method: "POST",
        body,
      }),
      providesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useAddContactByPhoneMutation,
  useDeleteContactMutation,
  useGetUsersListQuery,
} = contactApi;
