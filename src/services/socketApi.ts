import { privateApi } from "@/src/services/baseApi";
import { connectSocket } from "@/src/services/socketService";
import { getMessagesApi } from "./messagesApi";
import { chatsApi } from "./chatsApi";
import type { RootState } from "@/src/store/store";

import type { IUser } from "@/src/types/user";
import type { IMessage } from "@/src/types/message";

interface IMessageList {
  results: IMessage[];
  next: string | null;
}

export const socketApi = privateApi.injectEndpoints({
  overrideExisting: true,
  endpoints: builder => ({
    socketListener: builder.query<null, void>({
      queryFn: async () => ({ data: null }),

      async onCacheEntryAdded(_, { dispatch, cacheEntryRemoved, getState }) {
        const token = await fetch("/api/get-token")
          .then(r => r.json())
          .then(d => d.token);

        const ws = await connectSocket(token);
        if (!ws) return;

        ws.onmessage = event => {
          const data = JSON.parse(event.data);

          // Безопасно получаем сообщение
          const message = data.object ?? data;
          if (!message?.from_user?.uid || !message?.to_user?.uid) return;

          // Получаем мой uid из RTK Query
          const state = getState() as RootState;
          const queryCache = state.privateApi.queries["getProfile(undefined)"] as { data?: IUser };
          const myUid = queryCache?.data?.uid;

          if (!myUid) return;

          // Вычисляем UID собеседника
          const chatUserUid =
            message.from_user.uid === myUid ? message.to_user.uid : message.from_user.uid;

          // Обрабатываем только сообщения, связанные с текущим чатом
          if (data.action === "create_text_message") {
            const messagesArg = { user_uid: chatUserUid } as const;

            const messagesCache = getMessagesApi.endpoints.getMessages.select(messagesArg)(
              getState() as RootState,
            ).data as IMessageList | undefined;

            if (!messagesCache) {
              // Создаём кэш впервые
              dispatch(
                getMessagesApi.util.upsertQueryData("getMessages", messagesArg, {
                  results: [message as IMessage],
                  next: null,
                }),
              );
            } else {
              // Обновляем существующий кэш
              dispatch(
                getMessagesApi.util.updateQueryData("getMessages", messagesArg, draft => {
                  const exists = draft.results.some(m => m.uid === message.uid);
                  if (!exists) draft.results.unshift(message as IMessage);
                }),
              );
            }

            // Обновляем список чатов
            dispatch(
              chatsApi.util.updateQueryData("getChats", undefined, draft => {
                const chatItem = draft.results.find(c => c.chat?.uid === chatUserUid);

                if (!chatItem) return;

                chatItem.last_message = message;

                // если входящее — увеличиваем счётчик
                if (message.from_user.uid !== myUid) {
                  chatItem.new_message_count += 1;
                }
              }),
            );
          }

          // Меняем статус сообщения на прочитано
          if (data.action === "change_status_read_message") {
            dispatch(
              getMessagesApi.util.updateQueryData(
                "getMessages",
                { user_uid: chatUserUid },
                draft => {
                  if (!draft) return;

                  const msg = draft.results.find(m => m.uid === message.uid);
                  if (msg) {
                    msg.new = message.new;
                  }
                },
              ),
            );
          }
        };

        await cacheEntryRemoved;
      },
    }),
  }),
});

export const { useSocketListenerQuery } = socketApi;
