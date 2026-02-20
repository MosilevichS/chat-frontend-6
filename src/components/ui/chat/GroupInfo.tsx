"use client";

import Image from "next/image";
import type { Chat } from "@/src/types/chat";
import groupAvatar from "@/src/assets/icons/group.svg";
import channelAvatar from "@/src/assets/icons/channel.svg";
import close from "@/src/assets/icons/close.svg";

interface GroupInfoProps {
  chat: Chat;
  setProfileOpen: (open: boolean) => void;
}

export default function GroupInfo({ chat, setProfileOpen }: GroupInfoProps) {
  const isChannel = chat.chat_type === "channel";
  const chatAvatar = isChannel ? channelAvatar : groupAvatar;

  const creationDate = chat.last_activity_at 
    ? new Date(chat.last_activity_at * 1000).toLocaleDateString() 
    : "недавно";

  return (
    <div className="relative h-full p-4">
      <button 
        onClick={() => setProfileOpen(false)} 
        className="absolute top-4 right-4 z-10 hover:opacity-70 transition-opacity"
        aria-label="Закрыть"
      >
        <Image src={close} alt="Закрыть" width={24} height={24} />
      </button>
      
      <div className="flex flex-col items-center pt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-(--color-gray-2) flex items-center justify-center mb-4">
          <Image 
            src={chatAvatar} 
            alt="Аватар" 
            width={96} 
            height={96} 
            className="object-cover" 
          />
        </div>
        
        <h2 className="text-xl font-semibold mb-1 text-center break-words max-w-full px-2">
          {chat.name || (isChannel ? "Канал" : "Группа")}
        </h2>
        
        <p className="text-sm text-(--color-gray) mb-6">
          {isChannel ? "Канал" : "Группа"} • создан(а) {creationDate}
        </p>

        <div className="w-full space-y-4">
          <div className="p-4 bg-(--color-gray-light) rounded-lg">
            <p className="text-sm text-(--color-gray) mb-1">О чате</p>
            <p className="text-sm">
              {isChannel 
                ? "Канал для публикации сообщений. Подписчики могут читать и реагировать." 
                : "Группа для общения участников. Все участники могут писать сообщения."}
            </p>
          </div>

          <div className="p-4 bg-(--color-gray-light) rounded-lg">
            <p className="text-sm text-(--color-gray) mb-1">Создатель</p>
            <p className="text-sm">
              {chat.created_by ? `ID: ${chat.created_by.substring(0, 8)}...` : "Неизвестно"}
            </p>
          </div>

          <div className="p-4 bg-(--color-gray-light) rounded-lg">
            <p className="text-sm text-(--color-gray) mb-1">Участники</p>
            <p className="text-sm">
              Информация о участниках будет доступна позже
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}