import { privateApi } from "@/src/services/baseApi";
import type { Chat } from "../types/chat";

export const chatsApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<{ results: Chat[] }, void>({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),
    updatedChats: builder.mutation<
      Chat,
      {
        id: number;
        data: {
          is_favorite?: boolean;
          notifications?: boolean;
          index?: number;
          last_seen_message?: number;
          last_seen_message_uid?: string;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/chats/updated/${id}`,
        method: "POST",
        body: { data },
      }),
      invalidatesTags: ["Chats"],
    }),

    deleteChat: builder.mutation<
      Chat,
      {
        id: number;
      }
    >({
      query: ({ id }) => ({
        url: `/chats/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chats"],
    }),
  }),
});

export const { useGetChatsQuery, useUpdatedChatsMutation, useDeleteChatMutation } = chatsApi;
