"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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
import React from "react";
import ProfileInfo from "./ProfileInfo";

export default function Chat() {
  // Контакт и профиль
  const { user_uid } = useParams<{ user_uid: string }>();
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
  const [messages, setMessages] = useState<IMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const readMessagesRef = useRef<Set<string>>(new Set());

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
          setMessages(prevMessages => [...prevMessages, message]);
          newMessagesBottom.current = true;
        }

        if (data.action === "change_status_read_message") {
          const updatedMessage = data.object;

          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.uid === updatedMessage.uid ? { ...msg, new: false } : msg,
            ),
          );
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected , attempting to reconnect...");
        reconnectIntervalRef.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = error => {
        console.error("WebSocket error:", error);
        ws?.close();
      };
    }

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

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
  };

  // Загрузка истории сообщений
  const PAGE_SIZE = 50;

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [, setLoadingMore] = useState(false);
  const isLoadingHistory = useRef(false);

  // Начальная загрузка сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/get-messages-list/${user_uid}?page=1&page_size=${PAGE_SIZE}`);
      const data = await res.json();

      setMessages(data.results.reverse());
      setPage(2);
      setHasMore(data.results.length === PAGE_SIZE);
    };

    fetchMessages();
  }, [user_uid]);

  // Загрузка дополнительных сообщений при скролле вверх
  const loadMoreMessages = async () => {
    if (isLoadingHistory.current || !hasMore) return;

    isLoadingHistory.current = true;
    setLoadingMore(true);

    const osInstance = osRef.current?.osInstance();
    const { viewport } = osInstance?.elements() || {};
    const prevScrollHeight = viewport?.scrollHeight || 0;

    const res = await fetch(
      `/api/get-messages-list/${user_uid}?page=${page}&page_size=${PAGE_SIZE}`,
    );
    const data = await res.json();

    if (data.results.length < PAGE_SIZE) setHasMore(false);

    setMessages(prev => [...data.results.reverse(), ...prev]);
    setPage(prev => prev + 1);
    setLoadingMore(false);
    isLoadingHistory.current = false;

    requestAnimationFrame(() => {
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight - prevScrollHeight;
      }
    });
  };

  // Обработка скролла чата
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);
  const wasAtBottom = useRef(true);
  const newMessagesBottom = useRef(false);
  const firstLoadRef = useRef(true);

  // Скролл вниз при первом рендере и при добавлении новых сообщений
  useEffect(() => {
    if (messages.length === 0) return;

    const osInstance = osRef.current?.osInstance();
    if (!osInstance) return;
    const { viewport } = osInstance.elements();
    if (!viewport) return;

    requestAnimationFrame(() => {
      // При первой загрузке всегда скроллим вниз
      if (firstLoadRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
        firstLoadRef.current = false;
        return;
      }

      // Дальше скроллим вниз только при новых сообщениях WebSocket
      if (newMessagesBottom.current) {
        viewport.scrollTop = viewport.scrollHeight;
        newMessagesBottom.current = false;
      }
    });
  }, [messages]);

  // Обработчик скролла вверх для загрузки истории
  useEffect(() => {
    const osInstance = osRef.current?.osInstance();
    if (!osInstance) return;

    const { viewport } = osInstance.elements();
    if (!viewport) return;

    const handleScroll = () => {
      const isBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
      wasAtBottom.current = isBottom;

      if (viewport.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [hasMore, page]);

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
            {messages.length === 0 && !isLoadingHistory ? (
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
                    const { viewport } = instance.elements();
                    if (!viewport) return;

                    const hasScroll = viewport.scrollHeight > viewport.clientHeight;
                    const isAtBottom =
                      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 20;

                    setShowScrollDown(hasScroll && !isAtBottom);
                  },
                }}
                className="h-full"
              >
                <div className="flex flex-col justify-end px-4 pb-2 min-h-full">
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];

                    const showDateDivider =
                      !prevMessage ||
                      new Date(prevMessage.created_at * 1000).toDateString() !==
                        new Date(message.created_at * 1000).toDateString();

                    return (
                      <React.Fragment key={index}>
                        {showDateDivider && (
                          <DateDivider date={formatChatDate(message.created_at)} />
                        )}

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
              <Image src={scrollDownIcon} alt="Прокрутить вниз" width={24} height={24} />
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
