import { privateApi } from "@/src/services/baseApi";
import type { IChat } from "../types/chat";

export const chatsApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<{ results: IChat[] }, void>({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),
    updatedChats: builder.mutation<
      IChat,
      {
        id: number;
        data: {
          is_favorite?: boolean;
          notifications?: boolean;
          index?: number;
          last_seen_message?: number;
          new_message_count?: number;
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
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Создаём «патч» — временное изменение кэша
        const patchResult = dispatch(
          chatsApi.util.updateQueryData("getChats", undefined, draft => {
            // Находим чат в кэше по id
            const chat = draft.results.find(c => c.id === id);
            if (chat) {
              // Применяем обновления «на лету»
              Object.assign(chat, data);
            }
          }),
        );

        try {
          // Ждём завершения запроса на сервер
          await queryFulfilled;
        } catch {
          // Если запрос провалился — откатываем изменения в кэше
          patchResult.undo();
        }
      },
    }),

    deleteChat: builder.mutation<
      IChat,
      {
        id: number;
      }
    >({
      query: ({ id }) => ({
        url: `/chats/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chats"],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        // Создаём «патч» — временное изменение кэша
        const patchResult = dispatch(
          chatsApi.util.updateQueryData("getChats", undefined, draft => {
            // Фильтруем массив чатов, исключая чат с указанным id
            draft.results = draft.results.filter(chat => chat.id !== id);
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Удаление всех сообщений в своем чате
    clearChat: builder.mutation<
      IChat,
      {
        id: number;
      }
    >({
      query: ({ id }) => ({
        url: `/chats/clear/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Chats"],
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        // Создаём «патч» — временное изменение кэша
        const patchResult = dispatch(
          chatsApi.util.updateQueryData("getChats", undefined, draft => {
            // Находим чат в кэше по id
            const chat = draft.results.find(c => c.id === id);
            if (chat) {
              Object.assign(chat);
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetChatsQuery,
  useUpdatedChatsMutation,
  useDeleteChatMutation,
  useClearChatMutation,
} = chatsApi;
