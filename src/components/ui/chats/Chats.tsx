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

  const isMobile = useMediaQuery();
  const router = useRouter();
  const pathname = usePathname();

  const {
    data,
    isLoading,
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
  }, [showAddContactModal]);

  const handleRightClick = (e: React.MouseEvent, chat: Chat) => {
    e.preventDefault();
    const chatId = chat.id;

    const { clientY, clientX } = e;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let hasSpaceBelow = clientY + POPUP_HEIGHT + MENU_OFFSET <= windowHeight;
    let menuX = clientX;

    if (isMobile) {
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
        data: { last_seen_message: chat.last_message.id, new_message_count: 0 },
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
    if (!selectedChatId) return;
    setShowDeleleContactModal(true);
    setOpenContextMenu(false);
  };

  const handleConfirmDeleteChat = async () => {
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

      if (chat.name) {
        return chat.name.toLowerCase().includes(searchLower);
      }

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
        <div>
          {isLoading ? (
            <Loader className="pt-40" />
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => (
              <ChatsItem
                key={chat.id}
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
            name={`
              ${data?.results.find(chat => chat.id === selectedChatId)?.chat?.first_name ?? ""}
              ${data?.results.find(chat => chat.id === selectedChatId)?.chat?.last_name ?? ""}`}
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
            message={`Удалить чат с ${`${data?.results.find(chat => chat.id === selectedChatId)?.chat?.first_name ?? ""}
              ${data?.results.find(chat => chat.id === selectedChatId)?.chat?.last_name ?? ""}`} без возможности восстановления?`}
            confirmText="Удалить"
            cancelText="Отмена"
          />
        </ModalBase>
      )}
    </div>
  );
};

export default Chats;
