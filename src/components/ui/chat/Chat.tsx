"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";

import { useTypedSelector } from "@/src/hooks/useTypedSelector";
import type { AppDispatch } from "@/src/store/store";
import {
  setCurrentChatId,
  initializeChat,
  addMessages,
  addMessage,
  setPagination,
  updateMessage,
} from "@/src/store/slices/chatSlice";
import { selectMessagesByChat, selectPaginationByChat } from "@/src/store/slices/chatSelectors";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import call from "@/src/assets/icons/call.svg";
import search from "@/src/assets/icons/search-messages.svg";
import noMessages from "@/src/assets/icons/no-messages.svg";
import clip from "@/src/assets/icons/clip.svg";
import close from "@/src/assets/icons/close.svg";

import microphone from "@/src/assets/icons/microphone.svg";
import sendMessageIcon from "@/src/assets/icons/send-message.svg";
import scrollDownIcon from "@/src/assets/icons/scroll-down.svg";

import type { IContact } from "@/src/types/contact";
import type { IMessage } from "@/src/types/message";
import type { IChat } from "@/src/types/chat";

import Loader from "@/src/components/ui/Loader";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalSuccess from "@/src/components/ui/modal/ModalSuccess";
import OutgoingMessage from "@/src/components/ui/chat/OutgoingMessage";
import IncomingMessage from "@/src/components/ui/chat/IncomingMessage";
import DateDivider from "@/src/components/ui/chat/DateDivider";

import { timeFormat } from "@/src/utils/timeFormat";
import formatChatDate from "@/src/utils/formatChatDate";

import { useGetContactByIdQuery } from "@/src/services/contactApi";
import { useGetContactsQuery, useAddContactByPhoneMutation } from "@/src/services/contactApi";
import { useGetProfileQuery } from "@/src/services/userApi";
import { useGetChatsQuery, useUpdatedChatsMutation } from "@/src/services/chatsApi";
import React from "react";
import ProfileInfo from "./ProfileInfo";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();

  // Контакт и профиль
  const { user_uid } = useParams<{ user_uid: string }>();
  const [updatedChats] = useUpdatedChatsMutation();
  const [addContactByPhone] = useAddContactByPhoneMutation();

  const [isBannerHidden, setBannerHidden] = useState(false);
  const [isBannerClosing, setBannerClosing] = useState(false);

  const [isProfileOpen, setProfileOpen] = useState(false);

  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);

  // Проверка есть ли пользователь в списке контактов
  const { data: contactsData } = useGetContactsQuery();

  const contacts = contactsData?.results;

  const isInContacts = contacts?.some(
    (contact: IContact) => contact.system_contact.uid === user_uid,
  );

  // Получение данных профиля
  const { data: profileData } = useGetProfileQuery();
  const profile = profileData;

  console.log("profile:", profile);

  // Получение контакта по uid
  const { data, isLoading, isError } = useGetContactByIdQuery(user_uid);

  console.log(data);

  // WebSocket и сообщения
  const [inputValue, setInputValue] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const readMessagesRef = useRef<Set<string>>(new Set());

  const messagesSelector = React.useMemo(() => selectMessagesByChat(user_uid), [user_uid]);
  const messages = useTypedSelector(messagesSelector);

  const paginationSelector = React.useMemo(() => selectPaginationByChat(user_uid), [user_uid]);
  const pagination = useTypedSelector(paginationSelector);

  const prevLengthRef = useRef(0);

  // Получение текущего чата и последнего просмотренного сообщения
  const { data: chatsList }: { data?: { results: IChat[] } } = useGetChatsQuery();
  const currentChat = chatsList?.results.find(c => c.chat.uid === user_uid);

  const lastSeenMessageUid = currentChat?.last_seen_message?.uid ?? null;
  const chatId = currentChat?.id;

  // Находим индекс первого непрочитанного сообщения

  const firstUnreadIndex = React.useMemo(() => {
    if (!messages.length || !lastSeenMessageUid) return -1;

    const index = messages.findIndex(m => m.uid === lastSeenMessageUid);
    if (index === -1) return -1;

    return index + 1 < messages.length ? index + 1 : -1;
  }, [messages, lastSeenMessageUid]);

  // Инициализация текущего чата в Redux
  useEffect(() => {
    if (!data) return;

    dispatch(initializeChat({ chatId: user_uid }));
    dispatch(setCurrentChatId(user_uid));
  }, [user_uid, data, dispatch]);

  // Загрузка истории сообщений
  const PAGE_SIZE = 100;

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/get-messages-list/${user_uid}?page=1&page_size=${PAGE_SIZE}`);
      const data = await res.json();

      dispatch(addMessages({ chatId: user_uid, messages: data.results }));
      dispatch(
        setPagination({
          chatId: user_uid,
          page: 1,
          hasMore: data.next !== null,
        }),
      );
    };

    fetchMessages();
  }, [dispatch, user_uid]);

  // Загрузка дополнительных сообщений при скролле вверх

  const loadMoreMessages = async () => {
    const instance = osRef.current?.osInstance();
    const viewport = instance?.elements().viewport;
    if (!viewport) return;

    isFetchingMoreRef.current = true;

    // сохраняем высоту ДО запроса
    prevScrollHeightRef.current = viewport.scrollHeight;

    const nextPage = pagination.page + 1;

    const res = await fetch(`/api/get-messages-list/${user_uid}?page=${nextPage}&page_size=50`);
    const data = await res.json();

    dispatch(addMessages({ chatId: user_uid, messages: data.results }));
    dispatch(
      setPagination({
        chatId: user_uid,
        page: nextPage,
        hasMore: data.next !== null,
      }),
    );
  };

  // Инициализация WebSocket
  useEffect(() => {
    if (wsRef.current) return;

    let ws: WebSocket | null = null;

    async function connectWebSocket() {
      const accessToken = await fetch("/api/get-token")
        .then(res => res.json())
        .then(data => data.token);

      ws = new WebSocket(`wss://api.dev.chat.ktsf.ru/ws/chat?authorization=${accessToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectIntervalRef.current) {
          clearTimeout(reconnectIntervalRef.current);
          reconnectIntervalRef.current = null;
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        const message: IMessage = data.object;

        if (data.action === "create_text_message") {
          const isThisChat = message.from_user.uid === user_uid || message.to_user.uid === user_uid;

          if (!isThisChat) return;

          dispatch(addMessage({ chatId: user_uid, message }));
        }

        if (data.action === "change_status_read_message") {
          const updatedMessage = data.object;

          dispatch(updateMessage({ chatId: user_uid, message: updatedMessage }));
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected , attempting to reconnect...");
        reconnectIntervalRef.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = error => {
        console.log("WebSocket error:", error);
        ws?.close();
      };
    }

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [dispatch, user_uid]);

  // Пинг WebSocket каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            action: "ping",
          }),
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Отправка сообщения
  const sendMessage = () => {
    if (!inputValue.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current?.send(
      JSON.stringify({
        action: "create_text_message",
        request_uid: profile?.uid,
        object: {
          to_user_uid: user_uid,
          content: inputValue.trim(),
        },
      }),
    );

    setInputValue("");
  };

  // Отметка сообщения как прочитанного
  const markedAsRead = (message: IMessage) => {
    if (readMessagesRef.current.has(message.uid)) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    readMessagesRef.current.add(message.uid);

    wsRef.current?.send(
      JSON.stringify({
        action: "change_status_read_message",
        request_uid: profile?.uid,
        object: {
          uid: message.uid,
          reader_uid: profile?.uid,
          new_read_status: false,
          chat_key: message.chat_key,
        },
      }),
    );

    updatedChats({
      id: chatId!,
      data: { last_seen_message: message.id },
    });
  };

  // Обработка скролла чата
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);
  const wasAtBottomRef = useRef(true);
  const isFetchingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    const instance = osRef.current?.osInstance();
    const viewport = instance?.elements().viewport;
    if (!viewport) return;

    const currentLength = messages.length;
    const prevLength = prevLengthRef.current;

    // новые сообщения вниз
    if (currentLength > prevLength && !isFetchingMoreRef.current) {
      if (wasAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }

    // подгрузка старых вверх
    if (isFetchingMoreRef.current) {
      requestAnimationFrame(() => {
        const newScrollHeight = viewport.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;

        viewport.scrollTop = diff;

        isFetchingMoreRef.current = false;
      });
    }

    prevLengthRef.current = currentLength;
  }, [messages.length]);

  const firstUnreadRef = useRef<HTMLDivElement | null>(null);
  const didInitialScrollRef = useRef(false);

  useEffect(() => {
    if (didInitialScrollRef.current || firstUnreadIndex === -1 || !firstUnreadRef.current) return;

    const instance = osRef.current?.osInstance();
    const viewport = instance?.elements().viewport;
    if (!viewport) return;

    requestAnimationFrame(() => {
      firstUnreadRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });

    didInitialScrollRef.current = true;
  }, [firstUnreadIndex]);

  // Кнопка для скролла вниз
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = () => {
    const osInstance = osRef.current?.osInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  // Добавление контакта по номеру телефона
  const handleAddContact = async (phone_number: string) => {
    try {
      await addContactByPhone({ phone: phone_number }).unwrap();
      setModalSuccessOpen(true);
    } catch (error) {
      console.error("Ошибка при добавлении контакта:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        <Loader />
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        Ошибка загрузки пользователя.
      </div>
    );

  return (
    <>
      <div className="md:flex w-full overflow-hidden">
        <div className="relative flex flex-col w-full h-screen md:h-[calc(100vh-88px)] max-w-[744px] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1)">
          <header
            className="px-4 w-full flex justify-between items-center min-h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3) z-30 cursor-pointer"
            onClick={() => setProfileOpen(true)}
          >
            <div className="flex gap-3">
              {data.avatar_url ? (
                <Image
                  src={data.avatar_url}
                  alt="Аватар"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <Image
                  className="h-10 w-10"
                  src="/avatar/avatar-8.png"
                  width={40}
                  height={40}
                  alt="Аватар"
                />
              )}

              <div>
                <p className="font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                  {data.first_name} {data.last_name}
                </p>
                {data.is_online ? (
                  <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2">
                    в сети
                  </p>
                ) : (
                  <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2">
                    был(а) {timeFormat(data.was_online_at * 1000)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-x-3">
              <button aria-label="Поиск">
                <Image src={search} alt="Поиск" width={36} height={36} />
              </button>
              <button aria-label="Звонок">
                <Image src={call} alt="Звонок" width={36} height={36} />
              </button>
            </div>
          </header>

          {!isInContacts && !isBannerHidden && (
            <div
              className={`h-[44px] w-full px-4 flex items-center bg-(--color-gray-light) border-b border-(--color-gray-3) 
                absolute top-[60px] left-0 right-0 z-20
                transition-transform duration-300 ease-in-out ${isBannerClosing ? "translate-y-[-100%]" : "translate-y-0"}`}
            >
              <div className="flex gap-1 w-full">
                <div className="flex justify-center w-full max-w-[340px]">
                  <button
                    className="text-(--color-violet) active:text-(--color-violet-light)"
                    onClick={() => {
                      setBannerClosing(true);
                      setTimeout(() => setBannerHidden(true), 300);
                      handleAddContact(data.username);
                    }}
                  >
                    Добавить в контакты
                  </button>
                </div>
                <div className="flex justify-center w-full max-w-[340px]">
                  <button className="text-(--color-error) active:opacity-20">Заблокировать</button>
                </div>
              </div>
              <button
                onClick={() => {
                  setBannerClosing(true);
                  setTimeout(() => setBannerHidden(true), 300);
                }}
                aria-label="Закрыть"
              >
                <Image src={close} alt="Закрыть" width={24} height={24} />
              </button>
            </div>
          )}

          <main className="relative flex flex-col flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <Image
                  src={noMessages}
                  alt="Нет сообщений"
                  width={200}
                  height={200}
                  className="mb-6"
                  loading="eager"
                />
                <p className="text-(--color-gray) text-lg leading-[130%]">Сообщений пока нет</p>
                <p className="text-(--color-gray) text-sm leading-[120%]">Напишите первым :)</p>
              </div>
            ) : (
              <OverlayScrollbarsComponent
                ref={osRef}
                options={{
                  scrollbars: {
                    autoHide: "scroll",
                    autoHideDelay: 400,
                  },
                }}
                events={{
                  scroll: instance => {
                    const viewport = instance.elements().viewport;
                    if (!viewport) return;

                    const isAtBottom =
                      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 40;
                    wasAtBottomRef.current = isAtBottom;

                    if (viewport.scrollTop < 20 && pagination.hasMore) loadMoreMessages();
                    setShowScrollDown(viewport.scrollHeight > viewport.clientHeight && !isAtBottom);
                  },
                }}
                className="h-full"
              >
                <div className="flex flex-col justify-end px-4 pb-2 min-h-full">
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isFirstUnread = index === firstUnreadIndex;

                    const showDateDivider =
                      !prevMessage ||
                      new Date(prevMessage.created_at * 1000).toDateString() !==
                        new Date(message.created_at * 1000).toDateString();

                    return (
                      <React.Fragment key={message.uid}>
                        {showDateDivider && (
                          <DateDivider date={formatChatDate(message.created_at)} />
                        )}

                        <div className="flex" ref={isFirstUnread ? firstUnreadRef : null}>
                          {message.from_user.uid !== data.uid ? (
                            <OutgoingMessage
                              message={message}
                              className={`${prevMessage && prevMessage.from_user.uid !== message.from_user.uid ? "mt-3" : "mt-2"}`}
                            />
                          ) : (
                            <IncomingMessage
                              message={message}
                              markAsRead={markedAsRead}
                              className={`${prevMessage && prevMessage.from_user.uid !== message.from_user.uid ? "mt-3" : "mt-2"}`}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </OverlayScrollbarsComponent>
            )}

            <button
              className={`absolute bottom-2 right-2 z-50 w-[44px] h-[44px] bg-white rounded-full border-[0.33px] border-(--color-gray-3) 
                            flex items-center justify-center active:opacity-80
                            transform transition-all duration-300 ease-in-out
                            ${showScrollDown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              aria-label="Прокрутить вниз"
              onClick={scrollToBottom}
            >
              <Image src={scrollDownIcon} alt="Прокрутить вниз" />
            </button>
          </main>

          <footer className="flex items-center px-4 w-full min-h-[60px] bg-(--color-gray-light) rounded-b-lg border-t border-(--color-gray-3)">
            <form
              className="flex justify-between items-center gap-2 w-full"
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <button>
                <Image src={clip} alt="Прикрепить файл" width={36} height={36} />
              </button>
              <input
                type="text"
                placeholder="Сообщение"
                className="outline-none bg-white rounded-[1.25rem] py-2 pl-3 pr-10 w-full max-w-[624px]"
                onChange={e => setInputValue(e.target.value)}
                value={inputValue}
              />
              <button
                type="submit"
                onClick={sendMessage}
                aria-label="Отправить сообщение"
                className="active:opacity-50"
              >
                {inputValue.trim() ? (
                  <Image src={sendMessageIcon} alt="Отправить сообщение" width={36} height={36} />
                ) : (
                  <Image src={microphone} alt="Микрофон" width={36} height={36} />
                )}
              </button>
            </form>
          </footer>
        </div>

        <aside
          className={`h-full bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1) transition-all duration-500 ease-in-out overflow-hidden
            ${isProfileOpen ? "w-full max-w-[360px] ml-6 opacity-100" : "w-0 opacity-0 ml-0"}
            `}
        >
          {isProfileOpen && <ProfileInfo data={data} setProfileOpen={setProfileOpen} />}
        </aside>
      </div>

      {isModalSuccessOpen && (
        <ModalBase onClose={() => setModalSuccessOpen(false)}>
          <ModalSuccess
            name={`${data.first_name} ${data.last_name}`}
            text="теперь в списке ваших контактов"
          />
        </ModalBase>
      )}
    </>
  );
}
