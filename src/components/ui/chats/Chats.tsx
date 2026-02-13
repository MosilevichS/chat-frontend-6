"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import {
  useDeleteChatMutation,
  useGetChatsQuery,
  useUpdatedChatsMutation,
} from "@/src/services/chatsApi";
import { useAddContactByPhoneMutation } from "@/src/services/contactApi";
import type { Chat } from "@/src/types/chat";
import { useClickOutside } from "@/src/hooks/useClickOutside";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

import Input from "@/src/components/ui/Input";
import ContextMenu from "./ContextMenu";
import NotFound from "@/src/components/ui/NotFound";
import ModalDropdown from "@/src/components/ui/modal/ModalDropdown";
import Loader from "@/src/components/ui/Loader";
import Button from "../Button";
import ModalBase from "../modal/ModalBase";
import ModalSuccess from "../modal/ModalSuccess";
import ModalConfirm from "../modal/ModalConfirm";

import search from "../../../assets/icons/search.svg";
import createDesktop from "../../../assets/icons/create.svg";
import create2Desktop from "../../../assets/icons/create2.svg";
import createMobile from "../../../assets/icons/create-mobile.svg";
import channel from "../../../assets/icons/channel.svg";
import group from "../../../assets/icons/group.svg";
import close from "../../../assets/icons/close.svg";
import noChats from "../../../assets/icons/no-chats.svg";
import ChatsItem from "./ChatsItem";

const Chats = () => {
  const POPUP_HEIGHT = 238;
  const MENU_WIDTH = 250;
  const MENU_OFFSET = 20;

<<<<<<< HEAD
  const isMobile = useMediaQuery();
=======
  const pathname = usePathname();
  const router = useRouter();
>>>>>>> origin/dev

  const [searchQuery, setSearchQuery] = useState("");
  const [openContextMenu, setOpenContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    placement: "bottom" as "top" | "bottom",
  });
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showDeleleContactModal, setShowDeleleContactModal] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const [isCreateButtonActive, setIsCreateButtonActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
<<<<<<< HEAD

  const router = useRouter();
  const pathname = usePathname();
=======
>>>>>>> origin/dev

  const {
    data,
    isLoading,
    error,
  }: {
    data?: { results: Chat[] };
    isLoading: boolean;
    error?: unknown;
  } = useGetChatsQuery(undefined, {
    skip: !pathname,
    refetchOnMountOrArgChange: true,
  });

  const [updatedChats] = useUpdatedChatsMutation();
  const [addContactByPhone] = useAddContactByPhoneMutation();
  const [deleteChat] = useDeleteChatMutation();

  // Вспомогательные функции для безопасного доступа к данным
  const getChatName = (chat: Chat): string => {
    // Приоритет 1: Если есть name (группы/каналы)
    if (chat?.name) {
      return chat.name;
    }

    // Приоритет 2: Если есть chat с именем (личные чаты)
    if (chat?.chat) {
      const firstName = chat.chat.first_name || "";
      const lastName = chat.chat.last_name || "";
      return `${firstName} ${lastName}`.trim() || "Чат";
    }

    // Приоритет 3: Запасной вариант
    return "Без названия";
  };

  const getChatLink = (chat: Chat): string => {
    if (chat?.chat?.uid) {
      return `/chats/${chat.chat.uid}`;
    }
    // Для групп/каналов пока нет страницы
    return "#";
  };

  const getChatAvatar = (chat: Chat): string => {
    if (chat?.chat?.avatar_url) {
      return chat.chat.avatar_url;
    }
    return "/avatar/avatar-8.png";
  };

  const isActiveChat = (chat: Chat): boolean => {
    if (chat?.chat?.uid && pathname === `/chats/${chat.chat.uid}`) {
      return true;
    }
    return false;
  };

  const getLastMessageContent = (chat: Chat): string => {
    if (!chat?.last_message) return "Нет сообщений";
    return chat.last_message.content || "";
  };

  const getLastMessageTime = (chat: Chat): number | null => {
    if (!chat?.last_message) return null;
    return chat.last_message.created_at || null;
  };

  const getNewMessageCount = (chat: Chat): number => {
    return chat?.new_message_count || 0;
  };

  const isFavorite = (chat: Chat): boolean => {
    return chat?.is_favorite || false;
  };

  const hasNotifications = (chat: Chat): boolean => {
    return chat?.notifications !== false;
  };

  useEffect(() => {
    if (showAddContactModal) {
      timeoutRef.current = setTimeout(() => {
        setShowAddContactModal(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
<<<<<<< HEAD
  }, [showAddContactModal]);
=======

    const onMouseLeave = () => {
      container.style.paddingRight = "6px";
    };

    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);
>>>>>>> origin/dev

  const handleRightClick = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    const chatId = chat.id;

    const { clientY, clientX } = e;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Вертикаль: достаточно места снизу?
    let hasSpaceBelow = clientY + POPUP_HEIGHT + MENU_OFFSET <= windowHeight;

    let menuX = clientX;

    if (isMobile) {
      // На мобильных — центрируем строго по середине экрана
      menuX = (windowWidth - MENU_WIDTH) / 2;
      hasSpaceBelow = clientY + POPUP_HEIGHT + MENU_OFFSET + 84 <= windowHeight;
    }

    setMenuPosition({
      x: menuX,
      y: clientY,
      placement: hasSpaceBelow ? "bottom" : "top",
    });

    setOpenContextMenu(true);
    setSelectedChatId(chatId);
  };

  const handleOutsideClick = () => {
    setOpenContextMenu(false);
    setSelectedChatId(null);
  };

  useClickOutside(popupRef, handleOutsideClick);

  const toggleNotifications = async () => {
    if (!selectedChatId) return;

    const chat = data?.results.find(item => item.id === selectedChatId);
    if (!chat) return;

    const currentNotifications = chat.notifications;

    try {
      await updatedChats({
        id: selectedChatId,
        data: { notifications: !currentNotifications },
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }
    setOpenContextMenu(false);
    setSelectedChatId(null);
  };

  const toggleFavorite = async () => {
    if (!selectedChatId) return;

    const chat = data?.results.find(item => item.id === selectedChatId);
    if (!chat) return;

    const currentIsFavorite = chat.is_favorite;

    try {
      await updatedChats({
        id: selectedChatId,
        data: { is_favorite: !currentIsFavorite },
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }
    setOpenContextMenu(false);
    setSelectedChatId(null);
  };

  const setAllMessagesRead = async () => {
    if (!selectedChatId) return;

    const chat = data?.results.find(item => item.id === selectedChatId);
    if (!chat) return;

    try {
      await updatedChats({
        id: selectedChatId,
<<<<<<< HEAD
        data: { last_seen_message: chat.last_message.id, new_message_count: 0 },
=======
        data: { last_seen_message: chat.last_message?.id },
>>>>>>> origin/dev
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }
    setOpenContextMenu(false);
    setSelectedChatId(null);
  };

  const addContacts = async () => {
    if (!selectedChatId) return;
    setOpenContextMenu(false);
    setShowAddContactModal(true);

    const chat = data?.results.find(item => item.id === selectedChatId);
    if (!chat) return;

    if (chat.chat?.username) {
      try {
        await addContactByPhone({ phone: chat.chat.username }).unwrap();
      } catch (error) {
        console.error("Ошибка при добавлении контакта:", error);
      }
    }
  };

  const handleDeleteChat = async () => {
<<<<<<< HEAD
    if (!selectedChatId) return;
    setShowDeleleContactModal(true);
    setOpenContextMenu(false);
  };

  const handleConfirmDeleteChat = async () => {
    // удаление чата только у себя, у собеседника чат остается
=======
>>>>>>> origin/dev
    if (!selectedChatId) return;

    try {
      await deleteChat({
        id: selectedChatId,
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }
    setSelectedChatId(null);
    setShowDeleleContactModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateClick = () => {
    setIsCreateButtonActive(true);
    setIsModalOpen(true);
  };

  const handleCreateGroup = () => {
    setIsModalOpen(false);
    setIsCreateButtonActive(false);
    router.push("/chats/new-group");
  };

  const handleCreateChannel = () => {
    setIsModalOpen(false);
    setIsCreateButtonActive(false);
    router.push("/chats/new-channel");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsCreateButtonActive(false), 150);
  };

  const filteredChats = useMemo(() => {
    const allChats = data?.results || [];

    if (!searchQuery) return allChats;

    return allChats.filter(chat => {
      const searchLower = searchQuery.toLowerCase();

      // Для групп/каналов ищем по name
      if (chat.name) {
        return chat.name.toLowerCase().includes(searchLower);
      }

      // Для личных чатов - имя и фамилия
      if (chat.chat) {
        const firstName = chat.chat.first_name || "";
        const lastName = chat.chat.last_name || "";
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        return fullName.includes(searchLower);
      }

      return false;
    });
  }, [data, searchQuery]);

  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);

  return (
    <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
      <div className="relative w-full p-4">
        <div className="flex gap-x-2 w-full relative">
          <div className="relative h-[48px] flex-1">
            <Input
              onChange={handleChange}
              value={searchQuery}
              placeholder="Поиск"
              type="text"
              className="placeholder:text-base placeholder:height-1.3 placeholder:font-normal border border-(--color-gray-1) 
                pr-11 pl-11 pt-2.5 pb-2.5 md:pr-11 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px] w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <Image
                  src={close}
                  alt="Очистить"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 w-[20px] md:w-[24px]"
                />
              </button>
            )}
            <Image
              src={search}
              alt="Поиск"
              className="absolute left-3 top-4 w-[20px] md:w-[24px]"
            />
          </div>

          <button
            className="flex-shrink-0 w-[44px] h-[44px] bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200"
            aria-label="Создать чат"
            onClick={handleCreateClick}
          >
            <div className="md:hidden flex items-center justify-center mt-[2px]">
              <Image
                src={createMobile}
                alt="Создать"
                width={26}
                height={26}
                className="mr-[2px]"
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="hidden md:flex items-center justify-center">
              <Image
                src={isCreateButtonActive ? create2Desktop : createDesktop}
                alt="Создать"
                width={24}
                height={24}
              />
            </div>
          </button>

          {isModalOpen && (
            <ModalDropdown onClose={handleCloseModal} className="md:right-0 right-4 top-full">
              <div className="w-[192px] h-[128px] md:w-[220px] md:h-[88px] bg-white rounded-lg border border-(--color-gray-1) shadow-lg overflow-hidden">
                <button
                  onClick={handleCreateGroup}
                  className="w-full h-1/2 md:h-[44px] bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between px-4 transition-colors"
                >
                  <span className="text-base font-normal text-gray-900">Создать группу</span>
                  <Image src={group} alt="Группа" width={24} height={24} className="w-6 h-6" />
                </button>

                <div className="w-full h-px bg-(--color-gray-1)" />

                <button
                  onClick={handleCreateChannel}
                  className="w-full h-1/2 md:h-[44px] bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between px-4 transition-colors"
                >
                  <span className="text-base font-normal text-gray-900">Создать канал</span>
                  <Image src={channel} alt="Канал" width={24} height={24} className="w-6 h-6" />
                </button>
              </div>
            </ModalDropdown>
          )}
        </div>
      </div>

      <OverlayScrollbarsComponent
        ref={osRef}
        options={{
          scrollbars: {
            autoHide: "leave",
            autoHideDelay: 200,
          },
        }}
        className="h-[calc(100vh-165px)] md:h-[calc(100vh-170px)]"
      >
<<<<<<< HEAD
        <div>
          {isLoading ? (
            <Loader className="pt-40" />
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat, id) => (
              <ChatsItem
                key={id}
                chat={chat}
                selectedChatId={selectedChatId}
                handleRightClick={handleRightClick}
              />
            ))
          ) : filteredChats.length === 0 && !searchQuery ? (
            <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
              <Image
                className="w-50 h-50 mb-6"
                src={noChats}
                alt="нет чатов"
                width={200}
                height={200}
                loading="eager"
              />
              <p className="font-semibold mb-2">У вас пока нет чатов</p>
              <p className="text-[14px] font-normal mb-10">Начните общение и здесь всё появится</p>
              <Button
                href="/contacts"
                variant="primary"
                size="medium"
                className="md:mt-auto !max-w-[330px] text-white"
              >
                Начать чат
              </Button>
            </div>
          ) : (
            <NotFound />
          )}
        </div>
      </OverlayScrollbarsComponent>

=======
        {isLoading ? (
          <Loader text="сообщений" className="pt-40" />
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat, id) => (
            <Link
              href={getChatLink(chat)}
              onContextMenu={e => handleRightClick(e, chat)}
              key={chat.id || id}
              className={`
                flex py-1.5 gap-x-2 min-w-[344px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                rounded-lg px-2 mt-2 mb-1
                ${selectedChatId === chat.id ? "bg-(--color-gray-2)" : ""}
                ${isActiveChat(chat) ? "bg-(--color-violet-dark-opacity) hover:bg-(--color-violet-dark-opacity)" : ""}
              `}
            >
              <div className="min-w-15 min-h-15 w-15! h-15! rounded-full overflow-hidden">
                <Image
                  src={getChatAvatar(chat)}
                  width={60}
                  height={60}
                  alt="Аватар"
                  className="object-fill w-full h-full"
                />
              </div>

              <div
                className="relative after:absolute 
                after:left-0 after:right-0 after:bottom-[-11px] after:border-b after:border-1 
                after:border-(--color-button-disabled) after:z--1 w-full"
              >
                <div className="flex justify-between mb-1">
                  <div className="flex gap-x-1 h-[22px]">
                    <p
                      className={`font-medium text‑lg leading-[1.2] truncate max-w-[165px]
                        ${isActiveChat(chat) ? "text-white" : ""}`}
                      title={getChatName(chat)}
                    >
                      {getChatName(chat)}
                    </p>
                    {!hasNotifications(chat) && (
                      <div className="flex items-center">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path
                            d="M3.25672 2.20312L2.19922 3.26063L5.46922 6.53062L5.25172 6.75562H2.25172V11.2556H5.25172L9.00172 15.0056V10.0631L12.1367 13.1981C11.6492 13.5656 11.1017 13.8581 10.5017 14.0306V15.5756C11.5067 15.3506 12.4292 14.8856 13.2092 14.2631L14.7467 15.8006L15.8042 14.7431L3.25672 2.20312ZM7.50172 11.3831L5.87422 9.75562H3.75172V8.25562H5.87422L6.53422 7.59562L7.50172 8.56312V11.3831ZM14.2517 9.00562C14.2517 9.62062 14.1392 10.2131 13.9442 10.7606L15.0917 11.9081C15.5117 11.0306 15.7517 10.0481 15.7517 9.00562C15.7517 5.79562 13.5092 3.11062 10.5017 2.42812V3.97312C12.6692 4.61812 14.2517 6.62812 14.2517 9.00562ZM9.00172 3.00562L7.59172 4.41563L9.00172 5.82562V3.00562ZM12.3767 9.00562C12.3767 7.67812 11.6117 6.53813 10.5017 5.98312V7.32562L12.3617 9.18562C12.3692 9.12562 12.3767 9.06562 12.3767 9.00562Z"
                            fill={`${isActiveChat(chat) ? "var(--color-white)" : "var(--color-gray)"}`}
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-x-0.5 h-[22px]">
                    {getNewMessageCount(chat) < 2 && (
                      <div className="flex items-center">
                        {getNewMessageCount(chat) === 1 ? (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                              d="M14.7101 3.80859L6.51915 11.9996L3.28302 8.77117L2.19141 9.86279L6.51915 14.1905L15.8095 4.90021L14.7101 3.80859Z"
                              fill={`${isActiveChat(chat) ? "var(--color-white)" : "var(--color-gray)"}`}
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path
                              d="M13.6181 4.90021L12.5265 3.80859L7.61806 8.71698L8.70968 9.80859L13.6181 4.90021ZM16.9006 3.80859L8.70968 11.9996L5.47355 8.77117L4.38194 9.86279L8.70968 14.1905L18 4.90021L16.9006 3.80859ZM0 9.86279L4.32774 14.1905L5.41935 13.0989L1.09935 8.77117L0 9.86279Z"
                              fill={`${isActiveChat(chat) ? "var(--color-white)" : "var(--color-violet)"}`}
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    <div className="flex items-center">
                      <p
                        className={`text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] 
                          ${isActiveChat(chat) ? "text-white" : ""}`}
                      >
                        {getLastMessageTime(chat)
                          ? formatChatsDate(getLastMessageTime(chat)! * 1000)
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between w-full h-[34px]">
                  <p
                    className={`text-sm font-normal text-(--color-gray) 
                        ${isFavorite(chat) || getNewMessageCount(chat) > 1 ? "w-[231px]" : "w-[260px]"}  
                         leading-[1.2] tracking-[1%] line-clamp-2
                        ${isActiveChat(chat) ? "text-white" : ""}`}
                  >
                    {getLastMessageContent(chat)}
                  </p>
                  {isFavorite(chat) && getNewMessageCount(chat) < 2 && (
                    <div className="flex items-center">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                        <path
                          d="M12.25 3.5V7.875C12.25 8.855 12.5737 9.765 13.125 10.5H7.875C8.44375 9.7475 8.75 8.8375 8.75 7.875V3.5H12.25ZM14.875 1.75H6.125C5.64375 1.75 5.25 2.14375 5.25 2.625C5.25 3.10625 5.64375 3.5 6.125 3.5H7V7.875C7 9.3275 5.8275 10.5 4.375 10.5V12.25H9.59875V18.375L10.4738 19.25L11.3488 18.375V12.25H16.625V10.5C15.1725 10.5 14 9.3275 14 7.875V3.5H14.875C15.3562 3.5 15.75 3.10625 15.75 2.625C15.75 2.14375 15.3562 1.75 14.875 1.75Z"
                          fill={`${isActiveChat(chat) ? "var(--color-white)" : "var(--color-gray)"}`}
                        />
                      </svg>
                    </div>
                  )}

                  {getNewMessageCount(chat) > 1 && (
                    <div className="flex items-center">
                      <span
                        className={`flex items-center px-1.5 h-[21px] rounded-[10px] bg-(--color-violet) 
                        ${isActiveChat(chat) ? "bg-(--color-white) text-(--color-violet) font-semibold" : "text-white font-normal"}`}
                      >
                        {getNewMessageCount(chat) < 1000
                          ? getNewMessageCount(chat)
                          : `${(getNewMessageCount(chat) / 1000).toFixed(1).replace(".", ",")}K`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : filteredChats.length === 0 && !searchQuery ? (
          <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
            <Image
              className="w-50 h-50 mb-6"
              src={noChats}
              alt="нет чатов"
              width={200}
              height={200}
              loading="eager"
            />
            <p className="font-semibold mb-2">У вас пока нет чатов</p>
            <p className="text-[14px] font-normal mb-10">Начните общение и здесь всё появится</p>
            <Button
              href="/contacts"
              variant="primary"
              size="medium"
              className="md:mt-auto !max-w-[330px] text-white"
            >
              Начать чат
            </Button>
          </div>
        ) : (
          <NotFound />
        )}
      </div>
>>>>>>> origin/dev
      <ContextMenu
        isOpen={openContextMenu}
        ref={popupRef}
        chats={data?.results}
        chatId={selectedChatId}
        position={menuPosition}
        addContacts={addContacts}
        onToggleNotifications={toggleNotifications}
        toggleFavorite={toggleFavorite}
        setAllMessagesRead={setAllMessagesRead}
        handleDeleteChat={handleDeleteChat}
        menuOffset={MENU_OFFSET}
      />

      {showAddContactModal && (
        <ModalBase onClose={() => setShowAddContactModal(false)}>
          <ModalSuccess
            name={
              data?.results.find(chat => chat.id === selectedChatId)?.chat.first_name +
              " " +
              data?.results.find(chat => chat.id === selectedChatId)?.chat.last_name
            }
            text="теперь в списке ваших контактов"
          />
        </ModalBase>
      )}

      {showDeleleContactModal && (
        <ModalBase onClose={handleCloseModal}>
          <ModalConfirm
            onClose={() => setShowDeleleContactModal(false)}
            onConfirm={handleConfirmDeleteChat}
            title="Удалить чат"
            message={`Удалить чат с ${
              data?.results.find(chat => chat.id === selectedChatId)?.chat.first_name +
              " " +
              data?.results.find(chat => chat.id === selectedChatId)?.chat.last_name
            } без возможности восстановления?`}
            confirmText="Удалить"
            cancelText="Отмена"
          />
        </ModalBase>
      )}
    </div>
  );
};

export default Chats;
