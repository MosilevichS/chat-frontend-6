"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import microphone from "@/src/assets/icons/microphone.svg";
import sendMessageIcon from "@/src/assets/icons/send-message.svg";
import scrollDownIcon from "@/src/assets/icons/scroll-down.svg";
import groupAvatar from "@/src/assets/icons/group.svg";
import channelAvatar from "@/src/assets/icons/channel.svg";

import type { IMessage } from "@/src/types/message";
import type { IChat } from "@/src/types/chat";

import Loader from "@/src/components/ui/Loader";
import OutgoingMessage from "@/src/components/ui/chat/OutgoingMessage";
import IncomingMessage from "@/src/components/ui/chat/IncomingMessage";
import DateDivider from "@/src/components/ui/chat/DateDivider";

import formatChatDate from "@/src/utils/formatChatDate";

import { useGetProfileQuery } from "@/src/services/userApi";
import { useGetChatsQuery } from "@/src/services/chatsApi";
import React from "react";
import GroupInfo from "./GroupInfo";

export default function GroupChat() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.user_uid as string;
  const type = searchParams.get("type");

  console.log("GroupChat params:", { id, type });

  const [isProfileOpen, setProfileOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const profile = profileData;

  const { data: chatsData, isLoading } = useGetChatsQuery();

  const chat = chatsData?.results?.find((c: IChat) => c.chat_key === id || c.id.toString() === id);

  console.log("GroupChat found chat:", chat);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const readMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (wsRef.current) return;

    async function connectWebSocket() {
      try {
        const accessToken = await fetch("/api/get-token")
          .then(res => res.json())
          .then(data => data.token);

        const ws = new WebSocket(`wss://api.dev.chat.ktsf.ru/ws/chat?authorization=${accessToken}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected for group chat");
          if (reconnectIntervalRef.current) {
            clearTimeout(reconnectIntervalRef.current);
            reconnectIntervalRef.current = null;
          }
        };

        ws.onmessage = (event: MessageEvent) => {
          const data = JSON.parse(event.data);

          if (!data.object) return;

          const message: IMessage = data.object;

          if (data.action === "create_text_message") {
            if (!message || message.chat_key !== id) return;

            console.log("New group message:", message);
            setMessages(prev => [...prev, message]);
            newMessagesBottom.current = true;
          }

          if (data.action === "change_status_read_message") {
            if (!message || !message.uid) return;

            const updatedMessage = data.object;
            setMessages(prev =>
              prev.map(msg => (msg.uid === updatedMessage.uid ? { ...msg, new: false } : msg)),
            );
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected, attempting to reconnect...");
          reconnectIntervalRef.current = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = error => {
          console.error("WebSocket error:", error);
          ws.close();
        };
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: "ping" }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim() || wsRef.current?.readyState !== WebSocket.OPEN || !chat) return;

    wsRef.current.send(
      JSON.stringify({
        action: "create_text_message",
        request_uid: profile?.uid,
        object: {
          chat_key: chat.chat_key,
          content: inputValue.trim(),
        },
      }),
    );

    setInputValue("");
  };

  const markedAsRead = (message: IMessage) => {
    if (
      readMessagesRef.current.has(message.uid) ||
      wsRef.current?.readyState !== WebSocket.OPEN ||
      !chat
    )
      return;

    readMessagesRef.current.add(message.uid);

    wsRef.current.send(
      JSON.stringify({
        action: "change_status_read_message",
        request_uid: profile?.uid,
        object: {
          uid: message.uid,
          reader_uid: profile?.uid,
          new_read_status: false,
          chat_key: chat.chat_key,
        },
      }),
    );
  };

  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingHistory = useRef(false);
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);
  const newMessagesBottom = useRef(false);
  const firstLoadRef = useRef(true);
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chat) return;

      setIsLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/chat/messages/group/${chat.chat_key}?page=1&page_size=${PAGE_SIZE}&ordering=-created_at`,
        );

        if (!res.ok) {
          console.error("Failed to fetch messages:", res.status, res.statusText);
          return;
        }

        const data = await res.json();
        console.log("Group messages data:", data);

        if (data.results) {
          setMessages(data.results.reverse());
          setPage(2);
          setHasMore(data.results.length === PAGE_SIZE);
        } else if (Array.isArray(data)) {
          setMessages(data.reverse());
          setPage(2);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [chat]);

  const loadMoreMessages = async () => {
    if (isLoadingHistory.current || !hasMore || !chat) return;

    isLoadingHistory.current = true;
    const osInstance = osRef.current?.osInstance();
    const { viewport } = osInstance?.elements() || {};
    const prevScrollHeight = viewport?.scrollHeight || 0;

    try {
      const res = await fetch(
        `/api/chat/messages/group/${chat.chat_key}?page=${page}&page_size=${PAGE_SIZE}&ordering=-created_at`,
      );

      if (!res.ok) {
        console.error("Failed to load more messages:", res.status);
        return;
      }

      const data = await res.json();

      let newMessages = [];
      if (data.results) {
        newMessages = data.results;
      } else if (Array.isArray(data)) {
        newMessages = data;
      }

      if (newMessages.length < PAGE_SIZE) setHasMore(false);
      setMessages(prev => [...newMessages.reverse(), ...prev]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    }

    isLoadingHistory.current = false;
    requestAnimationFrame(() => {
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight - prevScrollHeight;
      }
    });
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const osInstance = osRef.current?.osInstance();
    if (!osInstance) return;
    const { viewport } = osInstance.elements();
    if (!viewport) return;

    requestAnimationFrame(() => {
      if (firstLoadRef.current) {
        viewport.scrollTop = viewport.scrollHeight;
        firstLoadRef.current = false;
      } else if (newMessagesBottom.current) {
        viewport.scrollTop = viewport.scrollHeight;
        newMessagesBottom.current = false;
      }
    });
  }, [messages]);

  useEffect(() => {
    const osInstance = osRef.current?.osInstance();
    if (!osInstance) return;
    const { viewport } = osInstance.elements();
    if (!viewport) return;

    const handleScroll = () => {
      if (viewport.scrollTop === 0 && hasMore && chat) {
        loadMoreMessages();
      }

      const hasScroll = viewport.scrollHeight > viewport.clientHeight;
      const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 20;
      setShowScrollDown(hasScroll && !isAtBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [hasMore, page, chat]);

  const scrollToBottom = () => {
    const osInstance = osRef.current?.osInstance();
    const viewport = osInstance?.elements().viewport;
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1) px-4">
        <Loader />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1) px-4">
        Чат не найден
      </div>
    );
  }

  const isChannel = chat.chat_type?.includes("channel");
  const chatName = chat.name || (isChannel ? "Канал" : "Группа");
  const chatAvatar = isChannel ? channelAvatar : groupAvatar;

  // Получаем последнее сообщение для отображения в шапке
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessageText = lastMessage?.content || (lastMessage?.files_list?.length ? "Файл" : "");

  return (
    <div className="md:flex w-full overflow-hidden">
      <div className="relative flex flex-col w-full h-screen md:h-[calc(100vh-88px)] max-w-[744px] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1)">
        <header
          className="px-4 w-full flex justify-between items-center min-h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3) z-30 cursor-pointer"
          onClick={() => setProfileOpen(true)}
        >
          <div className="flex gap-3">
            <div className="min-w-10 min-h-10 w-10 h-10 rounded-full overflow-hidden bg-(--color-gray-2) flex items-center justify-center">
              <Image
                src={chatAvatar}
                alt="Аватар"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col">
              <p className="font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                {chatName}
              </p>

              {/* Отображение типа чата и количества сообщений */}
              <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%]">
                {isChannel ? "Канал" : "Группа"}
                {messages.length > 0 &&
                  ` • ${messages.length} ${messages.length === 1 ? "сообщение" : messages.length < 5 ? "сообщения" : "сообщений"}`}
              </p>

              {/* Отображение последнего сообщения, если оно есть */}
              {lastMessageText && (
                <p className="text-xs text-(--color-gray) truncate max-w-[200px] mt-0.5">
                  {lastMessageText}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-x-3">
            <button aria-label="Поиск">
              <Image src={search} alt="Поиск" width={36} height={36} />
            </button>
            {!isChannel && (
              <button aria-label="Звонок">
                <Image src={call} alt="Звонок" width={36} height={36} />
              </button>
            )}
          </div>
        </header>

        <main className="relative flex flex-col flex-1 overflow-hidden">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center flex-1">
              <Loader />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <Image
                src={noMessages}
                alt="Нет сообщений"
                width={200}
                height={200}
                className="mb-6"
                loading="eager"
              />
              <p className="text-(--color-gray) text-lg leading-[130%]">Нет сообщений</p>
              <p className="text-(--color-gray) text-sm leading-[120%]">
                {isChannel
                  ? "Напишите первое сообщение в канал"
                  : "Напишите первое сообщение в группу"}
              </p>
            </div>
          ) : (
            <OverlayScrollbarsComponent
              ref={osRef}
              options={{ scrollbars: { autoHide: "scroll", autoHideDelay: 400 } }}
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
                    <React.Fragment key={message.uid || index}>
                      {showDateDivider && <DateDivider date={formatChatDate(message.created_at)} />}
                      {message.from_user?.uid === profile?.uid ? (
                        <OutgoingMessage
                          message={message}
                          className={`${prevMessage && prevMessage.from_user?.uid !== message.from_user?.uid ? "mt-3" : "mt-2"}`}
                        />
                      ) : (
                        <IncomingMessage
                          message={message}
                          markAsRead={markedAsRead}
                          className={`${prevMessage && prevMessage.from_user?.uid !== message.from_user?.uid ? "mt-3" : "mt-2"}`}
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
              flex items-center justify-center active:opacity-80 transform transition-all duration-300 ease-in-out
              ${showScrollDown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            aria-label="Прокрутить вниз"
            onClick={scrollToBottom}
          >
            <Image
              src={scrollDownIcon}
              alt="Прокрутить вниз"
              width={24}
              height={24}
              style={{ width: "auto", height: "auto" }}
            />
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
            <button type="button">
              <Image src={clip} alt="Прикрепить файл" width={36} height={36} />
            </button>
            <input
              type="text"
              placeholder={isChannel ? "Сообщение в канал" : "Сообщение в группу"}
              className="outline-none bg-white rounded-[1.25rem] py-2 pl-3 pr-10 w-full max-w-[624px]"
              onChange={e => setInputValue(e.target.value)}
              value={inputValue}
            />
            <button type="submit" aria-label="Отправить сообщение" className="active:opacity-50">
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
          ${isProfileOpen ? "w-full max-w-[360px] ml-6 opacity-100" : "w-0 opacity-0 ml-0"}`}
      >
        {isProfileOpen && <GroupInfo chat={chat} setProfileOpen={setProfileOpen} />}
      </aside>
    </div>
  );
}
