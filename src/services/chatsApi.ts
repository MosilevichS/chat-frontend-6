import { privateApi } from "@/src/services/baseApi";
import type { IContact } from "../types/contact";

export const chatsApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    getChats: builder.query<{ results: IContact[] }, void>({
      query: () => "/chats",
      providesTags: ["Chats"],
    }),
  }),
});

export const { useGetChatsQuery } = chatsApi;
