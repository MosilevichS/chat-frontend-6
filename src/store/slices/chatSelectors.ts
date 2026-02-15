import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { chatSelectors } from "./chatSlice";
import type { IMessage } from "@/src/types/message";

const EMPTY_ARRAY: IMessage[] = [];
const DEFAULT_PAGINATION = { page: 1, hasMore: true };

export const selectMessagesByChat = (chatId: string) =>
  createSelector(
    (state: RootState) => state.chat.chats[chatId]?.messages,
    messagesState => {
      if (!messagesState) return EMPTY_ARRAY;

      const allMessages = chatSelectors.selectAll(messagesState);

      return allMessages.length ? [...allMessages] : EMPTY_ARRAY;
    },
  );

export const selectPaginationByChat = (chatId: string) =>
  createSelector(
    (state: RootState) => state.chat.chats[chatId]?.pagination,
    pagination => (pagination ? { ...pagination } : DEFAULT_PAGINATION),
  );
