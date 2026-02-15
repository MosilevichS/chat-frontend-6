import { createEntityAdapter, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IMessage } from "@/src/types/message";

const chatAdapter = createEntityAdapter<IMessage, string>({
  selectId: message => message.uid,
  sortComparer: (a, b) => a.created_at - b.created_at,
});

interface ChatEntry {
  messages: ReturnType<typeof chatAdapter.getInitialState>;
  pagination: {
    page: number;
    hasMore: boolean;
  };
}

interface ChatState {
  currentChatId: string | null;
  chats: Record<string, ChatEntry>;
}

const initialState: ChatState = {
  currentChatId: null,
  chats: {},
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentChatId(state, action: PayloadAction<string | null>) {
      state.currentChatId = action.payload;
    },

    initializeChat(state, action: PayloadAction<{ chatId: string }>) {
      const { chatId } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          messages: chatAdapter.getInitialState(),
          pagination: { page: 1, hasMore: true },
        };
      }
    },

    addMessages(state, action: PayloadAction<{ chatId: string; messages: IMessage[] }>) {
      const { chatId, messages } = action.payload;

      // Инициализируем чат, если его нет
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          messages: chatAdapter.getInitialState(),
          pagination: { page: 1, hasMore: true },
        };
      }

      chatAdapter.upsertMany(state.chats[chatId].messages, messages);
    },

    addMessage(state, action: PayloadAction<{ chatId: string; message: IMessage }>) {
      const { chatId, message } = action.payload;

      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          messages: chatAdapter.getInitialState(),
          pagination: { page: 1, hasMore: true },
        };
      }

      chatAdapter.upsertOne(state.chats[chatId].messages, message);
    },

    updateMessage(state, action: PayloadAction<{ chatId: string; message: IMessage }>) {
      const { chatId, message } = action.payload;

      const chat = state.chats[chatId];
      if (!chat) return;

      chatAdapter.upsertOne(chat.messages, message);
    },

    setPagination(
      state,
      action: PayloadAction<{
        chatId: string;
        page: number;
        hasMore: boolean;
      }>,
    ) {
      const { chatId, page, hasMore } = action.payload;

      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          messages: chatAdapter.getInitialState(),
          pagination: { page: page, hasMore },
        };
        return;
      }

      state.chats[chatId].pagination.page = page;
      state.chats[chatId].pagination.hasMore = hasMore;
    },
  },
});

export const {
  setCurrentChatId,
  initializeChat,
  addMessages,
  addMessage,
  updateMessage,
  setPagination,
} = chatSlice.actions;

export default chatSlice.reducer;
export const chatSelectors = chatAdapter.getSelectors();
