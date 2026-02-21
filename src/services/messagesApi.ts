import { privateApi } from "@/src/services/baseApi";
import type { IMessage } from "@/src/types/message";

export const getMessagesApi = privateApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    getMessages: builder.query<
      { results: IMessage[]; next: string | null },
      { user_uid: string; ordering?: string; page?: number; page_size?: number }
    >({
      query: ({ user_uid, ordering = "-created_at", page = 1, page_size = 50 }) => ({
        url: `/get-messages-list/${user_uid}`,
        method: "GET",
        params: { ordering, page, page_size },
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.user_uid}`;
      },

      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }

        newItems.results.forEach(newMsg => {
          const exists = currentCache.results.some(m => m.uid === newMsg.uid);
          if (!exists) {
            currentCache.results.push(newMsg);
          }
        });
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },

      providesTags: result =>
        result
          ? [
              ...result.results.map(m => ({
                type: "Messages" as const,
                id: m.uid,
              })),
              { type: "Messages", id: "LIST" },
            ]
          : [{ type: "Messages", id: "LIST" }],
    }),
  }),
});

export const { useGetMessagesQuery } = getMessagesApi;
