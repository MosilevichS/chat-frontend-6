"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import call from "@/src/assets/icons/call.svg";
import search from "@/src/assets/icons/search-messages.svg";
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
import NoMessagesPlaceholder from "./NoMessagesPlaceholder";
import Button from "../Button";
import ClearChat from "./ClearChat";
import ModalConfirm from "../modal/ModalConfirm";
import ProfileInfo from "./ProfileInfo";
import CopyInfo from "./CopyInfo";

import { timeFormat } from "@/src/utils/timeFormat";
import formatChatDate from "@/src/utils/formatChatDate";

import {
  useAddBlackListMutation,
  useDeleteBlackListMutation,
  useGetContactByIdQuery,
} from "@/src/services/contactApi";
import { useGetChatsQuery } from "@/src/services/chatsApi";
import type { AppDispatch } from "@/src/store/store";
import { chatsApi } from "@/src/services/chatsApi";
import { useGetContactsQuery, useAddContactByPhoneMutation } from "@/src/services/contactApi";
import { useGetProfileQuery } from "@/src/services/userApi";
import { useGetMessagesQuery } from "@/src/services/messagesApi";
import { getSocket } from "@/src/services/socketService";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();

  // Контакт и профиль
  const { user_uid } = useParams<{ user_uid: string }>();
  const [addContactByPhone] = useAddContactByPhoneMutation();

  const [isBannerHidden, setBannerHidden] = useState(false);
  const [isBannerClosing, setBannerClosing] = useState(false);

  const [isProfileOpen, setProfileOpen] = useState(false);

  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);

  const [isAddToBlacklistModalOpen, setIsAddToBlacklistModalOpen] = useState(false);
  const [isDeleteToBlacklistModalOpen, setIsDeleteToBlacklistModalOpen] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedCopyInfo, setSelectedCopyInfo] = useState({ text: "", name: "" });

  // Проверка есть ли пользователь в списке контактов
  const { data: contactsData } = useGetContactsQuery();

  const contacts = contactsData?.results;

  const isInContacts = contacts?.some(
    (contact: IContact) => contact.system_contact.uid === user_uid,
  );

  // Получение данных открытого чата
  const { data: chatsData } = useGetChatsQuery();
  const chats = chatsData?.results;
  const chat = chats?.find((chat: IChat) => chat.chat?.uid === user_uid);

  // Получение данных профиля
  const { data: profileData } = useGetProfileQuery();
  const profile = profileData;

  // Получение контакта по uid
  const { data, isLoading, isError } = useGetContactByIdQuery(user_uid);

  // Удаление и добавление в черный список
  const [addBlackList] = useAddBlackListMutation();
  const [deleteBlackList] = useDeleteBlackListMutation();

  const handleAddBlackList = async () => {
    if (!data) return;

    try {
      await addBlackList({ id: data.uid }).unwrap();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteBlackList = async () => {
    if (!data) return;

    try {
      await deleteBlackList({ id: data.uid }).unwrap();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  // Получение сообщений
  const [page, setPage] = useState(1);

  const { data: messagesData } = useGetMessagesQuery({
    user_uid,
    page,
    page_size: 50,
    ordering: "-created_at",
  });

  const messages = React.useMemo(() => {
    return messagesData?.results ? [...messagesData.results].reverse() : [];
  }, [messagesData]);

  const hasMore = messagesData?.next !== null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [user_uid]);

  // WebSocket и сообщения
  const [inputValue, setInputValue] = useState("");
  const prevLengthRef = useRef(0);

  // Отправка сообщения
  const sendMessage = () => {
    if (!inputValue.trim() || !profile) return;

    const ws = getSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
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
  const markAsRead = (message: IMessage) => {
    const ws = getSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS not ready");
      return;
    }

    ws.send(
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

    dispatch(
      chatsApi.util.updateQueryData("getChats", undefined, draft => {
        const chatItem = draft.results.find(
          c => c.chat?.uid === message.from_user.uid || c.chat?.uid === message.to_user.uid,
        );
        if (!chatItem) return;

        // Только если это входящее сообщение и оно было непрочитано
        if (message.from_user.uid !== profile?.uid && message.new) {
          chatItem.new_message_count =
            chatItem.new_message_count > 0 ? chatItem.new_message_count - 1 : 0;
        }
      }),
    );
  };

  // Обработка скролла чата
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);
  const wasAtBottomRef = useRef(true);
  const isFetchingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const didInitialPositioningRef = useRef(false);

  useEffect(() => {
    const osInstance = osRef.current?.osInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport || !profile) return;

    const scrollTop = viewport.scrollTop;
    const viewportHeight = viewport.clientHeight;

    messages.forEach(msg => {
      if (msg.from_user.uid === profile.uid || !msg.new) return;

      const el = document.getElementById(`msg-${msg.uid}`);
      if (!el) return;

      // Используем offsetTop относительно родителя (OverlayScrollbars viewport)
      const offsetTop = el.offsetTop;
      const offsetBottom = offsetTop + el.offsetHeight;

      if (offsetBottom >= scrollTop && offsetTop <= scrollTop + viewportHeight) {
        markAsRead(msg);
      }
    });
  }, [messages, user_uid]);

  useEffect(() => {
    const instance = osRef.current?.osInstance();
    const viewport = instance?.elements().viewport;
    if (!viewport) return;
    if (!messages.length) return;

    // новые сообщения вниз
    if (messages.length > prevLengthRef.current && !isFetchingMoreRef.current) {
      if (wasAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }

    // подгрузка вверх
    if (isFetchingMoreRef.current) {
      requestAnimationFrame(() => {
        const newScrollHeight = viewport.scrollHeight;
        const heightDiff = newScrollHeight - prevScrollHeightRef.current;

        viewport.scrollTop = prevScrollTopRef.current + heightDiff;

        isFetchingMoreRef.current = false;
      });
    }

    prevLengthRef.current = messages.length;
  }, [messages, user_uid]);

  useEffect(() => {
    didInitialPositioningRef.current = false;
  }, [user_uid]);

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

  // логика закрытия модалки через секунды при добавлении в друзья
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isModalSuccessOpen) {
      timeoutRef.current = setTimeout(() => {
        setModalSuccessOpen(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isModalSuccessOpen]);

  // Добавление контакта по номеру телефона
  const handleAddContact = async (phone_number: string) => {
    try {
      await addContactByPhone({ phone: phone_number }).unwrap();
      setModalSuccessOpen(true);
    } catch (error) {
      console.error("Ошибка при добавлении контакта:", error);
    }
  };

  // Динамическое изменение высоты textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim()) return;

      sendMessage();

      setInputValue("");

      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
      }
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

              <div className={`${chat?.chat?.is_blocked && isProfileOpen ? "w-[55px]" : ""}`}>
                <p className="font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                  {data.first_name} {data.last_name}
                </p>
                {data.is_online ? (
                  <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2 truncate">
                    в сети
                  </p>
                ) : (
                  <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2 truncate">
                    был(а) {timeFormat(data.was_online_at * 1000)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-x-3">
              {chat?.chat?.is_blocked && (
                <Button
                  variant="primary"
                  className="!w-[161px]"
                  size="small"
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteToBlacklistModalOpen(true);
                  }}
                >
                  Разблокировать
                </Button>
              )}
              <button aria-label="Поиск">
                <Image className="min-w-[36px]" src={search} alt="Поиск" width={36} height={36} />
              </button>
              {!chat?.chat?.is_blocked && (
                <button aria-label="Звонок">
                  <Image src={call} alt="Звонок" width={36} height={36} />
                </button>
              )}
            </div>
          </header>

          {!isInContacts && !isBannerHidden && !isProfileOpen && !chat?.chat?.is_blocked && (
            <div
              className={`h-[44px] w-full px-4 flex items-center bg-(--color-gray-light) border-b border-(--color-gray-3) 
                absolute top-[60px] left-0 right-0 z-20
                transition-transform duration-300 ease-in-out 
                ${isBannerClosing ? "translate-y-[-100%]" : "translate-y-0"}`}
            >
              <div className="flex gap-1 w-full">
                <div className="flex justify-center w-full max-w-[340px]">
                  <button
                    className="text-(--color-violet) active:text-(--color-violet-light) truncate"
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
                  <button
                    className="text-(--color-error) active:opacity-20"
                    onClick={() => setIsAddToBlacklistModalOpen(true)}
                  >
                    Заблокировать
                  </button>
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

          {showClearChatModal && chat && (
            <ClearChat setShowClearChatModal={setShowClearChatModal} chatId={chat.id!} />
          )}

          {showCopyModal && (
            <CopyInfo setShowCopyModal={setShowCopyModal} copyInfo={selectedCopyInfo} />
          )}

          <main className="relative flex flex-col flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <NoMessagesPlaceholder />
            ) : (
              <OverlayScrollbarsComponent
                key={user_uid}
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

                    if (viewport.scrollTop < 20 && hasMore && !isFetchingMoreRef.current) {
                      isFetchingMoreRef.current = true;

                      prevScrollHeightRef.current = viewport.scrollHeight;
                      prevScrollTopRef.current = viewport.scrollTop;

                      setPage(prev => prev + 1);
                    }

                    setShowScrollDown(viewport.scrollHeight > viewport.clientHeight && !isAtBottom);
                  },
                }}
                className="h-full"
              >
                <div className="flex flex-col px-4 pb-2 min-h-full justify-end">
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];

                    const showDateDivider =
                      !prevMessage ||
                      new Date(prevMessage.created_at * 1000).toDateString() !==
                        new Date(message.created_at * 1000).toDateString();

                    return (
                      <React.Fragment key={message.uid}>
                        {showDateDivider && (
                          <DateDivider date={formatChatDate(message.created_at)} />
                        )}

                        <div className="flex" id={`msg-${message.uid}`}>
                          {message.from_user.uid !== data.uid ? (
                            <OutgoingMessage
                              message={message}
                              className={`${prevMessage && prevMessage.from_user.uid !== message.from_user.uid ? "mt-3" : "mt-2"}`}
                            />
                          ) : (
                            <IncomingMessage
                              message={message}
                              markAsRead={markAsRead}
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
              className="flex justify-between items-end gap-2 w-full"
              onSubmit={e => {
                e.preventDefault();
                if (!inputValue.trim()) return;

                sendMessage();
                setInputValue("");

                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                }
              }}
            >
              <button>
                <Image src={clip} alt="Прикрепить файл" width={36} height={36} />
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Сообщение"
                className="resize-none outline-none bg-white rounded-[1.25rem] py-2 pl-3 pr-10 w-full max-w-[624px] min-h-[36px] max-h-[120px] overflow-y-auto scrollbar-hidden"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
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
            ${isProfileOpen ? "w-full max-w-[360px] ml-6 opacity-100" : "w-0 opacity-0 ml-0"}
            `}
        >
          {isProfileOpen && (
            <ProfileInfo
              data={data}
              setProfileOpen={setProfileOpen}
              chat={chat!}
              isInContacts={isInContacts!}
              handleAddContact={() => handleAddContact(data.username)}
              handleAddBlackList={handleAddBlackList}
              handleDeleteBlackList={handleDeleteBlackList}
              setIsAddToBlacklistModalOpen={setIsAddToBlacklistModalOpen}
              setIsDeleteToBlacklistModalOpen={setIsDeleteToBlacklistModalOpen}
              setShowClearChatModal={setShowClearChatModal}
              setShowCopyModal={setShowCopyModal}
              setSelectedCopyInfo={setSelectedCopyInfo}
            />
          )}
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

      {isAddToBlacklistModalOpen && (
        <ModalBase onClose={() => setIsAddToBlacklistModalOpen(false)}>
          <ModalConfirm
            onClose={() => {
              setIsAddToBlacklistModalOpen(false);
              handleAddBlackList();
            }}
            onConfirm={() => setIsAddToBlacklistModalOpen(false)}
            title={`Заблокировать ${chat?.chat?.first_name}${chat?.chat?.last_name ? ` ${chat.chat.last_name}` : ""}?`}
            message="Пользователь не сможет писать Вам личные сообщения, звонить и приглашать Вас в группы и каналы"
            confirmText="Отмена"
            cancelText="Заблокировать"
            className="text-red-500 w-50!"
          />
        </ModalBase>
      )}

      {isDeleteToBlacklistModalOpen && (
        <ModalBase onClose={() => setIsDeleteToBlacklistModalOpen(false)}>
          <ModalConfirm
            onClose={() => {
              setIsDeleteToBlacklistModalOpen(false);
            }}
            onConfirm={() => {
              setIsDeleteToBlacklistModalOpen(false);
              handleDeleteBlackList();
            }}
            title={`Разблокировать ${chat?.chat?.first_name}${chat?.chat?.last_name ? ` ${chat?.chat.last_name}` : ""}?`}
            confirmText="Да"
            cancelText="Нет"
          />
        </ModalBase>
      )}
    </>
  );
}
