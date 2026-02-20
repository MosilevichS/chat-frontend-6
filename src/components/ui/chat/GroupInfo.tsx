"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import type { Chat } from "@/src/types/chat";
import groupAvatar from "@/src/assets/icons/group.svg";
import channelAvatar from "@/src/assets/icons/channel.svg";
import closePurple from "@/src/assets/icons/close-purple.svg";
import still from "@/src/assets/icons/still.svg";
import toShare from "@/src/assets/icons/to-share.svg";
import blocked from "@/src/assets/icons/blocked.svg";
import clearChat from "@/src/assets/icons/clear-chat.svg";
import copyIt from "@/src/assets/icons/copy-it.svg";

import { useClickOutside } from "@/src/hooks/useClickOutside";

interface GroupInfoProps {
  chat: Chat;
  setProfileOpen: (open: boolean) => void;
}

export default function GroupInfo({ chat, setProfileOpen }: GroupInfoProps) {
  const [isNotifications, setIsNotifications] = useState(true);
  const [isAdditionalMenu, setIsAdditionalMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Медиа");

  const refAdditionalMenu = useRef<HTMLDivElement>(null);
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);

  useClickOutside(refAdditionalMenu, () => setIsAdditionalMenu(false));

  const isChannel = chat.chat_type?.includes("channel");
  const chatAvatar = isChannel ? channelAvatar : groupAvatar;
  const chatName = chat.name || (isChannel ? "Канал" : "Группа");

  const creationDate = chat.last_activity_at
    ? new Date(chat.last_activity_at * 1000).toLocaleDateString()
    : "недавно";

  return (
    <div className="w-full max-w-[360px] max-h-[calc(100vh-88px)]">
      <header className="relative px-4 w-full flex items-center justify-between h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3)">
        <div className="flex">
          <button onClick={() => setProfileOpen(false)} aria-label="Закрыть">
            <Image src={closePurple} alt="Закрыть" width={24} height={24} className="mr-3" />
          </button>
          <h2 className="text-lg font-medium leading-[120%]">Информация</h2>
        </div>
        <button onClick={() => setIsAdditionalMenu(!isAdditionalMenu)}>
          <Image src={still} alt="Еще" width={24} height={24} />
        </button>
        {isAdditionalMenu && (
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
          {/* Шапка с аватаром и названием */}
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
                {isChannel ? "Канал" : "Группа"} • создан {creationDate}
              </p>
            </div>
          </div>

          {/* Уведомления */}
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

          {/* Информация о группе/канале */}
          <div className="mx-4 mb-2.5 w-[328px] bg-white rounded-lg">
            <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
              <div>
                <p className="text-(--color-gray) text-xs">Название</p>
                <p className="text-(--color-violet)">{chatName}</p>
              </div>
              <button>
                <Image src={copyIt} alt="Скопировать" width={24} height={24} />
              </button>
            </div>

            {chat.description && (
              <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
                <div>
                  <p className="text-(--color-gray) text-xs">Описание</p>
                  <p className="line-clamp-1">{chat.description}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
              <div>
                <p className="text-(--color-gray) text-xs">Тип</p>
                <p className="">
                  {isChannel
                    ? chat.chat_type === "public-channel"
                      ? "Публичный канал"
                      : "Приватный канал"
                    : chat.chat_type === "public-group"
                      ? "Открытая группа"
                      : "Закрытая группа"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
              <div>
                <p className="text-(--color-gray) text-xs">Создатель</p>
                <p className="">ID: {chat.created_by?.substring(0, 8)}...</p>
              </div>
            </div>

            <div className="flex items-center justify-between h-[57px] px-2.5">
              <div>
                <p className="text-(--color-gray) text-xs">Дата создания</p>
                <p className="">{creationDate}</p>
              </div>
            </div>
          </div>

          {/* Табы с контентом */}
          <div>
            <nav className="flex border-b-[0.5px] border-(--color-button-disabled) h-[45px] w-full px-5 mb-4">
              {["Медиа", "Файлы", "Голосовые", "Ссылки"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-2.5 ${activeTab === tab ? "text-(--color-violet)" : ""}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div
                      className={`absolute bottom-0 bg-(--color-violet) h-[4px] rounded-t-lg 
                        ${activeTab === "Медиа" && "w-[51px]"}
                        ${activeTab === "Файлы" && "w-[52px]"}
                        ${activeTab === "Голосовые" && "w-[83px]"}
                        ${activeTab === "Ссылки" && "w-[60px]"}`}
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="h-[360px] overflow-y-auto">
              {activeTab === "Медиа" && (
                <div className="flex flex-wrap justify-center gap-0.5">
                  {/* Здесь будут медиа-файлы чата */}
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
              {activeTab === "Ссылки" && (
                <p className="text-(--color-gray) text-sm text-center py-4">Ссылки пока нет</p>
              )}
            </div>
          </div>
        </main>
      </OverlayScrollbarsComponent>
    </div>
  );
}
