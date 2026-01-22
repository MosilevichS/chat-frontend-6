import { createApi } from "@reduxjs/toolkit/query/react";

export interface CreateGroupData {
  name: string;
  description: string;
  avatar?: {
    filename: string;
    data: string;
  };
  chat_type: "public-group" | "private-group";
  uid_users_list: string[];
}

export interface CreateChannelData {
  name: string;
  description: string;
  avatar?: {
    filename: string;
    data: string;
  };
  chat_type: "public-channel" | "private-channel";
  uid_users_list: string[];
}

export interface ChatCreationResponse {
  action: string;
  request_uid: string;
  status: string;
  error?: string;
  object?: {
    created_by: string;
    owner_full_name: string;
    chat_key: string;
    chat_id: string;
    name: string;
    description: string;
    chat_type: string;
    avatar?: {
      filename: string;
      url: string;
    };
    added_users: Array<{
      uid: string;
      full_name: string;
    }>;
  };
}

export interface EditChatData {
  chat_key: string;
  name: string;
  description: string;
  avatar?: {
    filename: string;
    data: string;
  };
  chat_type: string;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const groupOrChannelCreationApi = createApi({
  reducerPath: "groupOrChannelCreationApi",
  baseQuery: async ({ action, object }) => {
    console.log("WebSocket заглушка:", { action, object });

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: {
        action,
        request_uid: generateUUID(),
        status: "OK",
        object: {
          created_by: "current-user",
          owner_full_name: "Текущий Пользователь",
          chat_key: `chat-${Date.now()}`,
          chat_id: `chat-${Date.now()}`,
          name: object.name,
          description: object.description,
          chat_type: object.chat_type,
          added_users: (object.uid_users_list || []).map((uid: string) => ({
            uid,
            full_name: `Пользователь ${uid}`,
          })),
        },
      },
    };
  },
  tagTypes: ["ChatList", "GroupOrChannelCreation"],
  endpoints: builder => ({
    createGroup: builder.mutation<ChatCreationResponse, CreateGroupData>({
      query: groupData => ({
        action: "create_chat",
        object: groupData,
      }),
      invalidatesTags: ["ChatList", "GroupOrChannelCreation"],
    }),

    createChannel: builder.mutation<ChatCreationResponse, CreateChannelData>({
      query: channelData => ({
        action: "create_chat",
        object: channelData,
      }),
      invalidatesTags: ["ChatList", "GroupOrChannelCreation"],
    }),

    editChat: builder.mutation<ChatCreationResponse, EditChatData>({
      query: chatData => ({
        action: "edit_chat",
        object: chatData,
      }),
      invalidatesTags: ["GroupOrChannelCreation"],
    }),
  }),
});

export const { useCreateGroupMutation, useCreateChannelMutation, useEditChatMutation } =
  groupOrChannelCreationApi;

export const chatCreationUtils = {
  getChatTypeFromUI: (
    type: "group" | "channel",
    uiType: "open" | "closed" | "public" | "private",
  ): "public-group" | "private-group" | "public-channel" | "private-channel" => {
    if (type === "group") {
      return uiType === "open" ? "public-group" : "private-group";
    } else {
      return uiType === "public" ? "public-channel" : "private-channel";
    }
  },

  isGroup: (chatType: string): boolean => {
    return chatType.includes("group");
  },

  isChannel: (chatType: string): boolean => {
    return chatType.includes("channel");
  },

  extractBase64FromDataUrl: (dataUrl: string): string => {
    if (!dataUrl) return "";
    const match = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    return match ? match[1] : dataUrl;
  },

  createAvatarObject: (base64Data: string, filename: string = "avatar.png") => {
    if (!base64Data || base64Data.trim() === "") return undefined;

    return {
      filename,
      data: base64Data,
    };
  },

  validateCreationData: (
    type: "group" | "channel",
    name: string,
    description: string,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push("Название обязательно");
    } else if (name.length > 100) {
      errors.push("Название должно быть не более 100 символов");
    }

    if (description && description.length > 250) {
      errors.push("Описание должно быть не более 250 символов");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  formatParticipants: (participants: any[]): string[] => {
    return participants.filter(p => p && p.id).map(p => p.id.toString());
  },

  getUITypeFromChatType: (chatType: string): { type: "group" | "channel"; uiType: string } => {
    if (chatType === "public-group") {
      return { type: "group", uiType: "open" };
    } else if (chatType === "private-group") {
      return { type: "group", uiType: "closed" };
    } else if (chatType === "public-channel") {
      return { type: "channel", uiType: "public" };
    } else if (chatType === "private-channel") {
      return { type: "channel", uiType: "private" };
    }
    return { type: "group", uiType: "closed" };
  },
};
