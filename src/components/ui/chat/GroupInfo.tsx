"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import type { IChat } from "@/src/types/chat";
import type { IContact } from "@/src/types/contact";
import groupAvatar from "@/src/assets/icons/group.svg";
import channelAvatar from "@/src/assets/icons/channel.svg";
import closePurple from "@/src/assets/icons/close-purple.svg";
import still from "@/src/assets/icons/still.svg";
import toShare from "@/src/assets/icons/to-share.svg";
import blocked from "@/src/assets/icons/blocked.svg";
import clearChat from "@/src/assets/icons/clear-chat.svg";
import copyIt from "@/src/assets/icons/copy-it.svg";
import plus from "@/src/assets/icons/plus.svg";
import search from "@/src/assets/icons/search.svg";
import Checkbox from "@/src/components/ui/Checkbox";
import Button from "@/src/components/ui/Button";

import { useClickOutside } from "@/src/hooks/useClickOutside";
import { useGetProfileQuery } from "@/src/services/userApi";
import { useGetContactsQuery } from "@/src/services/contactApi";
import { wsManager } from "@/src/services/groupOrChannelCreationApi";

// Интерфейс участника группы
interface GroupParticipant {
  uid: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  avatar_webp_url: string | null;
  is_owner: boolean;
  is_online: boolean;
  was_online_at: number | null;
  is_in_contacts: boolean;
}

interface GroupInfoProps {
  chat: IChat;
  setProfileOpen: (open: boolean) => void;
}

export default function GroupInfo({ chat, setProfileOpen }: GroupInfoProps) {
  const router = useRouter();
  const [isNotifications, setIsNotifications] = useState(true);
  const [isAdditionalMenu, setIsAdditionalMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Участники");
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<GroupParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Состояния для пригласительной ссылки
  const [inviteLink, setInviteLink] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkExpiresAt, setLinkExpiresAt] = useState<number | null>(null);

  // Состояние для режима добавления участников
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const refAdditionalMenu = useRef<HTMLDivElement>(null);
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);

  const { data: profileData } = useGetProfileQuery();
  const { data: contactsData, isLoading: isLoadingContacts } = useGetContactsQuery();
  const contacts = contactsData?.results || [];

  useClickOutside(refAdditionalMenu, () => setIsAdditionalMenu(false));

  const isChannel = chat.chat_type?.includes("channel");
  const chatAvatar = chat.chat?.avatar_url || (isChannel ? channelAvatar : groupAvatar);
  const chatName = chat.name || (isChannel ? "Канал" : "Группа");
  const isOwner = chat.created_by === profileData?.uid;

  // Функция загрузки участников
  const fetchParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      const response = await fetch(`/api/chat/group/${chat.chat_key}/participants/`);
      const data = await response.json();

      if (data.results) {
        setParticipants(data.results);
        setFilteredParticipants(data.results);
      } else if (Array.isArray(data)) {
        setParticipants(data);
        setFilteredParticipants(data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Загрузка информации о группе
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await fetch(`/api/chat/group/${chat.chat_key}`);
        const data = await response.json();
        console.log("Group info details:", data);
        setGroupInfo(data);
      } catch (error) {
        console.error("Error fetching group info:", error);
      }
    };

    fetchGroupInfo();
  }, [chat.chat_key]);

  // Загрузка участников при монтировании
  useEffect(() => {
    if (chat?.chat_key) {
      fetchParticipants();
    }
  }, [chat.chat_key]);

  // Фильтрация участников по поиску
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredParticipants(participants);
    } else {
      const filtered = participants.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredParticipants(filtered);
    }
  }, [searchQuery, participants]);

  // Фильтрация контактов для добавления (исключаем уже существующих участников)
  const filteredContacts = contacts.filter((contact: IContact) => {
    const isAlreadyMember = participants.some(p => p.uid === contact.uid);
    if (isAlreadyMember) return false;

    return `${contact.first_name} ${contact.last_name}`
      .toLowerCase()
      .includes(memberSearchQuery.trim().toLowerCase());
  });

  // Функция генерации пригласительной ссылки
  const generateInviteLink = async () => {
    if (!isOwner) {
      alert("Только владелец может создавать пригласительные ссылки");
      return;
    }

    setIsGeneratingLink(true);
    try {
      const response = await fetch(`/api/chat/generate-invite/${chat.chat_key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expires_in: 604800 }), // 7 дней
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate link");
      }

      const data = await response.json();

      // Бэкенд возвращает относительный путь
      const relativePath = data.invite_link;

      // Добавляем базовый URL и убеждаемся, что есть слэш
      const baseUrl = window.location.origin;
      // Убираем возможный лишний слэш в начале relativePath
      const cleanPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
      const fullInviteLink = `${baseUrl}${cleanPath}`;

      setInviteLink(fullInviteLink);
      setLinkExpiresAt(data.expires_at);

      console.log("Invite link generated:", fullInviteLink);

      await navigator.clipboard.writeText(fullInviteLink);
      alert("Ссылка скопирована в буфер обмена");
    } catch (error) {
      console.error("Error generating invite link:", error);
      alert("Не удалось создать пригласительную ссылку");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Функция копирования ссылки
  const handleCopyInviteLink = () => {
    if (!inviteLink) {
      generateInviteLink();
    } else {
      navigator.clipboard.writeText(inviteLink);
      alert("Ссылка скопирована");
    }
  };

  // Форматирование времени истечения
  const formatExpiryDate = (timestamp: number | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return ` (до ${date.toLocaleDateString("ru-RU")})`;
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
  };

  const handleAddMembers = async () => {
    if (selectedContactIds.length === 0) return;

    setIsAdding(true);
    try {
      console.log("Adding members:", {
        chat_key: chat.chat_key,
        uid_users_list: selectedContactIds,
      });

      const result = await wsManager.sendRequest("add_members_to_chat", {
        chat_key: chat.chat_key,
        uid_users_list: selectedContactIds,
      });

      console.log("Add members result:", result);

      if (result.status === "OK") {
        setIsAddingMembers(false);
        setSelectedContactIds([]);
        setMemberSearchQuery("");
        await fetchParticipants();
        alert("Участники успешно добавлены");
      } else {
        console.error("Failed to add members:", result.error);
        alert(`Ошибка: ${result.error || "Не удалось добавить участников"}`);
      }
    } catch (error) {
      console.error("Error adding members:", error);
      alert("Произошла ошибка при добавлении участников");
    } finally {
      setIsAdding(false);
    }
  };

  const formatLastSeen = (timestamp: number | null): string => {
    if (!timestamp) return "никогда";

    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays === 1) return "вчера";
    if (diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString("ru-RU");
  };

  // Находим владельца
  const owner = participants.find(p => p.is_owner);
  // Остальные участники (без владельца)
  const otherParticipants = participants.filter(p => !p.is_owner);
  const onlineCount = participants.filter(p => p.is_online).length;

  return (
    <div className="w-full max-w-[360px] max-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg border border-(--color-gray-1)">
      <header className="relative px-4 w-full flex items-center justify-between h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3)">
        <div className="flex">
          <button
            onClick={() => {
              if (isAddingMembers) {
                setIsAddingMembers(false);
                setSelectedContactIds([]);
                setMemberSearchQuery("");
              } else {
                setProfileOpen(false);
              }
            }}
            aria-label="Назад"
          >
            <Image src={closePurple} alt="Закрыть" width={24} height={24} className="mr-3" />
          </button>
          <h2 className="text-lg font-medium leading-[120%]">
            {isAddingMembers ? "Добавить участников" : "Информация"}
          </h2>
        </div>
        {!isAddingMembers && (
          <button onClick={() => setIsAdditionalMenu(!isAdditionalMenu)}>
            <Image src={still} alt="Еще" width={24} height={24} />
          </button>
        )}

        {isAdditionalMenu && !isAddingMembers && (
          <div
            className="absolute top-14 right-4 z-10 w-[240px] h-[132px] bg-white font-normal rounded-lg shadow-lg"
            ref={refAdditionalMenu}
          >
            <button
              className="w-full flex items-center justify-between h-[44px] pl-2 pr-4 border-b border-(--color-button-disabled)
                hover:bg-(--color-gray-3) hover:rounded-t-lg transition-all duration-300"
            >
              <p>Поделиться {isChannel ? "каналом" : "группой"}</p>
              <Image src={toShare} alt="Поделиться" width={24} height={24} />
            </button>
            <button
              className="w-full flex items-center justify-between h-[44px] pl-2 pr-4 border-b border-(--color-button-disabled)
                hover:bg-(--color-gray-3) transition-all duration-300"
            >
              <p>Очистить чат</p>
              <Image src={clearChat} alt="Очистить чат" width={24} height={24} />
            </button>
            <button
              className="w-full flex items-center justify-between h-[44px] pl-2 pr-4 
                hover:bg-(--color-gray-3) hover:rounded-b-lg transition-all duration-300"
            >
              <p className="text-(--color-error)">Покинуть {isChannel ? "канал" : "группу"}</p>
              <Image
                src={blocked}
                alt="Покинуть"
                width={24}
                height={24}
                className="w-[24px] h-[24px]"
              />
            </button>
          </div>
        )}
      </header>

      <OverlayScrollbarsComponent
        ref={osRef}
        options={{
          scrollbars: {
            autoHide: "scroll",
            autoHideDelay: 200,
          },
        }}
        className="h-[calc(100vh-160px)]"
      >
        <main>
          {isAddingMembers ? (
            /* Режим добавления участников */
            <div className="p-4">
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  placeholder="Поиск"
                  value={memberSearchQuery}
                  onChange={e => setMemberSearchQuery(e.target.value)}
                  className="w-full h-[36px] pl-9 pr-3 text-sm bg-white rounded-lg outline-none focus:ring-1 focus:ring-(--color-violet)"
                />
                <Image
                  src={search}
                  alt="Поиск"
                  width={16}
                  height={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isLoadingContacts ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-(--color-violet) border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact: IContact) => (
                    <div
                      key={contact.uid}
                      className={`flex items-center py-1.5 gap-x-2.5 h-[72px] rounded-lg px-2 cursor-pointer
                        ${
                          selectedContactIds.includes(contact.uid)
                            ? "bg-(--color-overlay)"
                            : "hover:bg-(--color-gray-2)"
                        }`}
                    >
                      <div className="relative" onClick={() => toggleContactSelection(contact.uid)}>
                        {contact.avatar_url ? (
                          <Image
                            className="h-10 w-10 rounded-full"
                            src={contact.avatar_url}
                            width={40}
                            height={40}
                            alt="Аватар"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {contact.first_name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div
                        className="flex-1 min-w-0"
                        onClick={() => toggleContactSelection(contact.uid)}
                      >
                        <p className="font-medium text‑lg leading-[1.2] truncate mb-0.5">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.is_online ? (
                          <p className="text-sm font-normal text-(--color-violet) leading-[1.2]">
                            в сети
                          </p>
                        ) : (
                          contact.was_online_at && (
                            <p className="text-sm font-normal text-(--color-gray) leading-[1.2]">
                              был(а) {new Date(contact.was_online_at * 1000).toLocaleString()}
                            </p>
                          )
                        )}
                      </div>

                      <Checkbox
                        checked={selectedContactIds.includes(contact.uid)}
                        onChange={() => toggleContactSelection(contact.uid)}
                        name="contact-selection"
                        value={contact.uid}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-(--color-gray) text-sm text-center py-4">
                    {memberSearchQuery ? "Ничего не найдено" : "Нет доступных контактов"}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-(--color-gray-1)">
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleAddMembers}
                  disabled={selectedContactIds.length === 0 || isAdding}
                  className="w-full"
                >
                  {isAdding
                    ? "Добавление..."
                    : selectedContactIds.length > 0
                      ? `Пригласить (${selectedContactIds.length})`
                      : "Пригласить в группу"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="my-2 relative">
                <div className="w-full h-[358px] bg-(--color-gray-2) flex items-center justify-center">
                  <div className="relative w-[200px] h-[200px]">
                    <Image
                      src={chatAvatar}
                      alt={isChannel ? "Канал" : "Группа"}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-2xl font-medium">{chatName}</p>
                  <p className="text-lg font-normal">
                    {isChannel ? "Канал" : "Группа"} • {participants.length} участников
                  </p>
                  {onlineCount > 0 && (
                    <p className="text-sm font-normal text-(--color-violet)">
                      {onlineCount} {onlineCount === 1 ? "онлайн" : "онлайн"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between px-4 h-[52px]">
                <p>Уведомления</p>
                <div
                  className={`relative w-[52px] h-[32px] p-1 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
                    ${isNotifications ? "bg-(--color-violet)" : "bg-(--color-violet-2)"}`}
                  onClick={() => setIsNotifications(!isNotifications)}
                >
                  <div
                    className={`absolute w-[24px] h-[24px] bg-white rounded-full transition-all duration-300 ease-in-out
                      ${isNotifications ? "translate-x-4.75" : "translate-x-px"}`}
                  ></div>
                </div>
              </div>

              {chat.description && (
                <div className="px-4 py-3 border-t border-(--color-button-disabled)">
                  <p className="text-(--color-gray) text-xs mb-1">Описание</p>
                  <p className="text-sm">{chat.description}</p>
                </div>
              )}

              <div className="px-4 py-3 border-t border-(--color-button-disabled)">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-(--color-gray) text-xs">Ссылка-приглашение</p>
                  {isOwner && !inviteLink && (
                    <button
                      onClick={generateInviteLink}
                      disabled={isGeneratingLink}
                      className="text-xs text-(--color-violet) hover:underline"
                    >
                      {isGeneratingLink ? "Создание..." : "Создать"}
                    </button>
                  )}
                </div>

                {inviteLink ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-(--color-violet) truncate max-w-[240px]">
                      {inviteLink}
                    </p>
                    <button onClick={handleCopyInviteLink} className="flex items-center gap-1">
                      <Image src={copyIt} alt="Скопировать" width={20} height={20} />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-(--color-gray)">
                    {isOwner
                      ? "Нажмите «Создать», чтобы получить ссылку-приглашение"
                      : "Ссылка-приглашение доступна только владельцу"}
                  </p>
                )}

                {linkExpiresAt && (
                  <p className="text-xs text-(--color-gray) mt-1">
                    Действует до {new Date(linkExpiresAt * 1000).toLocaleDateString("ru-RU")}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <nav className="flex border-b-[0.5px] border-(--color-button-disabled) h-[45px] w-full px-5">
                  {["Участники", "Медиа", "Файлы", "Голосовые"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-2.5 ${activeTab === tab ? "text-(--color-violet)" : ""}`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div
                          className={`absolute bottom-0 bg-(--color-violet) h-[4px] rounded-t-lg 
                            ${activeTab === "Участники" && "w-[70px]"}
                            ${activeTab === "Медиа" && "w-[51px]"}
                            ${activeTab === "Файлы" && "w-[52px]"}
                            ${activeTab === "Голосовые" && "w-[83px]"}`}
                        />
                      )}
                    </button>
                  ))}
                </nav>

                <div className="h-[360px] overflow-y-auto px-4">
                  {activeTab === "Участники" && (
                    <div>
                      <button
                        onClick={() => setIsAddingMembers(true)}
                        className="flex items-center gap-2 w-full py-3 px-2 mb-3 bg-(--color-gray-light) rounded-lg hover:bg-(--color-gray-2) transition-colors"
                      >
                        <Image src={plus} alt="Пригласить" width={16} height={16} />
                        <span className="text-sm font-medium">Пригласить в группу</span>
                      </button>

                      <div className="relative w-full mb-4">
                        <input
                          type="text"
                          placeholder="Поиск"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full h-[36px] pl-9 pr-3 text-sm bg-(--color-gray-light) rounded-lg outline-none focus:ring-1 focus:ring-(--color-violet)"
                        />
                        <Image
                          src={search}
                          alt="Поиск"
                          width={16}
                          height={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                        />
                      </div>

                      {isLoadingParticipants ? (
                        <div className="flex justify-center py-4">
                          <div className="w-6 h-6 border-2 border-(--color-violet) border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <>
                          {owner && (
                            <div className="mb-4">
                              <p className="text-xs text-(--color-gray) mb-2">Владелец</p>
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--color-gray-2) transition-colors">
                                <div className="relative">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-(--color-gray-2)">
                                    {owner.avatar_url ? (
                                      <Image
                                        src={owner.avatar_url}
                                        alt="Аватар"
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-(--color-gray-3) flex items-center justify-center">
                                        <span className="text-white font-medium">
                                          {owner.first_name?.charAt(0) || "?"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  {owner.is_online && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {owner.first_name} {owner.last_name}
                                  </p>
                                  {owner.is_online ? (
                                    <p className="text-xs text-(--color-violet)">в сети</p>
                                  ) : owner.was_online_at ? (
                                    <p className="text-xs text-(--color-gray)">
                                      был(а) {formatLastSeen(owner.was_online_at)}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-(--color-gray)">не в сети</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {otherParticipants.length > 0 && (
                            <div>
                              <p className="text-xs text-(--color-gray) mb-2">Участники</p>
                              <div className="space-y-1">
                                {filteredParticipants
                                  .filter(p => !p.is_owner)
                                  .map(participant => (
                                    <div
                                      key={participant.uid}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-(--color-gray-2) transition-colors"
                                    >
                                      <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-(--color-gray-2)">
                                          {participant.avatar_url ? (
                                            <Image
                                              src={participant.avatar_url}
                                              alt="Аватар"
                                              width={40}
                                              height={40}
                                              className="object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-(--color-gray-3) flex items-center justify-center">
                                              <span className="text-white font-medium">
                                                {participant.first_name?.charAt(0) || "?"}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        {participant.is_online && (
                                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium">
                                          {participant.first_name} {participant.last_name}
                                        </p>
                                        {participant.is_online ? (
                                          <p className="text-xs text-(--color-violet)">в сети</p>
                                        ) : participant.was_online_at ? (
                                          <p className="text-xs text-(--color-gray)">
                                            был(а) {formatLastSeen(participant.was_online_at)}
                                          </p>
                                        ) : (
                                          <p className="text-xs text-(--color-gray)">не в сети</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {filteredParticipants.length === 0 && (
                            <p className="text-(--color-gray) text-sm text-center py-4">
                              {searchQuery ? "Участники не найдены" : "Нет участников"}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === "Медиа" && (
                    <div className="flex flex-wrap justify-center gap-0.5">
                      <p className="text-(--color-gray) text-sm py-4">Медиа пока нет</p>
                    </div>
                  )}

                  {activeTab === "Файлы" && (
                    <p className="text-(--color-gray) text-sm text-center py-4">Файлы пока нет</p>
                  )}

                  {activeTab === "Голосовые" && (
                    <p className="text-(--color-gray) text-sm text-center py-4">
                      Голосовые сообщения пока нет
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </OverlayScrollbarsComponent>
    </div>
  );
}
