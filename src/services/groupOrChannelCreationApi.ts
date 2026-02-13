import { privateApi } from "./baseApi";

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

// Глобальный менеджер WebSocket соединений
class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private pendingPromises: Map<string, { resolve: Function; reject: Function }> = new Map();
  private messageListeners: Array<(data: any) => void> = [];
  private connectionPromise: Promise<WebSocket> | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  async getConnection(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.ws;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      fetch("/api/get-token")
        .then(res => res.json())
        .then(data => {
          if (!data.token) {
            reject(new Error("No token available"));
            return;
          }

          const ws = new WebSocket(
            `wss://api.dev.chat.ktsf.ru/ws/chat?authorization=${data.token}`,
          );

          ws.onopen = () => {
            this.ws = ws;
            this.connectionPromise = null;
            resolve(ws);
          };

          ws.onmessage = event => {
            const data = JSON.parse(event.data);

            // Уведомляем всех слушателей
            this.messageListeners.forEach(listener => listener(data));

            // Если это ответ на наш запрос
            if (data.request_uid && this.pendingPromises.has(data.request_uid)) {
              const { resolve, reject } = this.pendingPromises.get(data.request_uid)!;
              if (data.status === "OK") {
                resolve(data);
              } else {
                reject(new Error(data.error || "Unknown error"));
              }
              this.pendingPromises.delete(data.request_uid);
            }
          };

          ws.onerror = error => {
            this.connectionPromise = null;
            reject(error);
          };

          ws.onclose = () => {
            this.ws = null;
            this.connectionPromise = null;
          };
        })
        .catch(err => {
          this.connectionPromise = null;
          reject(err);
        });
    });

    return this.connectionPromise;
  }

  async sendRequest(action: string, object: any): Promise<any> {
    const ws = await this.getConnection();
    const requestUid = generateUUID();

    return new Promise((resolve, reject) => {
      this.pendingPromises.set(requestUid, { resolve, reject });

      const request = {
        action,
        request_uid: requestUid,
        object,
      };

      ws.send(JSON.stringify(request));

      // Таймаут
      setTimeout(() => {
        if (this.pendingPromises.has(requestUid)) {
          this.pendingPromises.delete(requestUid);
          reject(new Error("Request timeout"));
        }
      }, 10000);
    });
  }

  addMessageListener(listener: (data: any) => void) {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: (data: any) => void) {
    const index = this.messageListeners.indexOf(listener);
    if (index > -1) {
      this.messageListeners.splice(index, 1);
    }
  }
}

const wsManager = WebSocketManager.getInstance();

export const groupOrChannelCreationApi = privateApi.injectEndpoints({
  endpoints: builder => ({
    createGroup: builder.mutation<ChatCreationResponse, CreateGroupData>({
      queryFn: async groupData => {
        try {
          const response = await wsManager.sendRequest("create_chat", groupData);
          return { data: response };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Chats"],
    }),

    createChannel: builder.mutation<ChatCreationResponse, CreateChannelData>({
      queryFn: async channelData => {
        try {
          const response = await wsManager.sendRequest("create_chat", channelData);
          return { data: response };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Chats"],
    }),

    editChat: builder.mutation<ChatCreationResponse, EditChatData>({
      queryFn: async chatData => {
        try {
          const response = await wsManager.sendRequest("edit_chat", chatData);
          return { data: response };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: String(error) } };
        }
      },
      invalidatesTags: ["Chats"],
    }),
  }),
  overrideExisting: false,
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
