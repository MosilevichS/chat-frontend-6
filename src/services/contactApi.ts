import { privateApi } from "@/src/services/baseApi";
import type { IContact } from "../types/contact";
import type { PaginatedResponse, IBlackListContact } from "../types/blackList";

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
      invalidatesTags: ["Contacts", "Chats"],
    }),
    getBlackList: builder.query<
      PaginatedResponse<IBlackListContact>,
      { page?: number; page_size?: number }
    >({
      query: params => ({
        url: "/contacts/black-list/",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 20,
        },
      }),

      providesTags: result =>
        result
          ? [
              ...result.results.map(({ blocked_user }) => ({
                type: "BlackList" as const,
                id: blocked_user.uid,
              })),
              { type: "BlackList", id: "LIST" },
            ]
          : [{ type: "BlackList", id: "LIST" }],
    }),

    addBlackList: builder.mutation<IContact, { id: string }>({
      query: ({ id }) => ({
        url: `/contacts/add-blacklist/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Chats"],
    }),
    deleteBlackList: builder.mutation<IContact, { id: string }>({
      query: ({ id }) => ({
        url: `/contacts/delete-blacklist/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: ["Chats"],
    }),
    deleteBlackListSettings: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/contacts/delete-blacklist/${id}/`,
        method: "DELETE",
      }),

      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          contactApi.util.updateQueryData("getBlackList", { page: 1, page_size: 20 }, draft => {
            draft.results = draft.results.filter(item => item.blocked_user.uid !== id);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteContact: builder.mutation<void, { contact_uids: string[] }>({
      query: body => ({
        url: "/contacts/delete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Contacts"],
    }),
    getUsersList: builder.query<IContact[], { phone_or_nickname: string }[]>({
      query: body => ({
        url: "/contacts/list",
        method: "POST",
        body,
      }),
      providesTags: ["Contacts"],
    }),
    getContactById: builder.query<IContact, string>({
      query: user_uid => `/contacts/${user_uid}`,
      providesTags: ["Contacts"],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useAddContactByPhoneMutation,
  useGetBlackListQuery,
  useAddBlackListMutation,
  useDeleteBlackListMutation,
  useDeleteContactMutation,
  useGetUsersListQuery,
  useGetContactByIdQuery,
  useDeleteBlackListSettingsMutation,
} = contactApi;
