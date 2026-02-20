import Image from "next/image";
import { useRef, useState } from "react";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import { timeFormat } from "@/src/utils/timeFormat";
import type { IContact } from "@/src/types/contact";
import type { IChat } from "@/src/types/chat";

import { useUpdatedChatsMutation } from "@/src/services/chatsApi";
import { useClickOutside } from "@/src/hooks/useClickOutside";
import formatChatDate from "@/src/utils/formatChatDate";

import closePurple from "@/src/assets/icons/close-purple.svg";
import still from "@/src/assets/icons/still.svg";
import toShare from "@/src/assets/icons/to-share.svg";
import blocked from "@/src/assets/icons/blocked.svg";
import isClearChat from "@/src/assets/icons/clear-chat.svg";
import copyIt from "@/src/assets/icons/copy-it.svg";
import plusViolet from "@/src/assets/icons/plus-violet.svg";
import ModalConfirm from "../modal/ModalConfirm";
import ModalBase from "../modal/ModalBase";

interface ProfileInfoProps {
  data: IContact;
  setProfileOpen: (isProfileOpen: boolean) => void;
  chat: IChat;
  isInContacts: boolean;
  handleAddContact: () => void;
  handleAddBlackList: () => void;
  handleDeleteBlackList: () => void;
  setIsAddToBlacklistModalOpen: (isAddToBlacklistModalOpen: boolean) => void;
  setIsDeleteToBlacklistModalOpen: (isDeleteToBlacklistModalOpen: boolean) => void;
  setShowClearChatModal: (showClearChatModal: boolean) => void;
  setShowCopyModal: (showCopyModal: boolean) => void;
  setSelectedCopyInfo: (info: { text: string; name: string }) => void;
}

const ProfileInfo = ({
  data,
  setProfileOpen,
  chat,
  isInContacts,
  handleAddContact,
  setIsAddToBlacklistModalOpen,
  setIsDeleteToBlacklistModalOpen,
  setShowClearChatModal,
  setShowCopyModal,
  setSelectedCopyInfo,
}: ProfileInfoProps) => {
  const [isAdditionalMenu, setIsAdditionalMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("Медиа");
  const [isClearChatModalOpen, setIsClearChatModalOpen] = useState(false);

  const [updatedChats] = useUpdatedChatsMutation();

  // console.log("ProfileInfo:", data);
  // console.log("chat:", chat);

  const toggleNotifications = async () => {
    try {
      await updatedChats({
        id: chat.id,
        data: { notifications: !chat.notifications },
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  const refAdditionalMenu = useRef<HTMLDivElement>(null);

  const birthdayCheck = (data: number) => {
    if (data < 10000) return null;

    const result = formatChatDate(data)
      .replace(/\s*г\./i, "")
      .trim();

    return result;
  };

  useClickOutside(refAdditionalMenu, () => setIsAdditionalMenu(false));

  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);

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
            className="absolute top-14 right-4 z-1 w-[240px] bg-white font-normal rounded-lg"
            ref={refAdditionalMenu}
          >
            <button
              className="w-full flex items-center justify-between h-[44px] pl-2 pr-4 border-b border-(--color-button-disabled)
          hover:bg-(--color-gray-3) hover:rounded-t-lg transition-all duration-300"
              onClick={() => setIsAdditionalMenu(false)}
            >
              <p>Поделиться профилем</p>
              <Image src={toShare} alt="Поделиться профилем" width={24} height={24} />
            </button>
            <button
              className={`w-full flex items-center justify-between h-[44px] pl-2 pr-4 
          hover:bg-(--color-gray-3) transition-all duration-300
          ${chat.chat?.is_blocked ? "rounded-b-lg hover:rounded-b-lg" : "border-b border-(--color-button-disabled)"}
          `}
              onClick={() => {
                setIsClearChatModalOpen(true);
                setIsAdditionalMenu(false);
              }}
            >
              <p>Очистить чат</p>
              <Image src={isClearChat} alt="Очистить чат" width={24} height={24} />
            </button>
            {!chat.chat?.is_blocked && (
              <button
                className="w-full flex items-center justify-between h-[44px] pl-2 pr-4 
          hover:bg-(--color-gray-3) hover:rounded-b-lg transition-all duration-300"
                onClick={() => {
                  setIsAddToBlacklistModalOpen(true);
                  setIsAdditionalMenu(false);
                }}
              >
                <p className="text-(--color-error)">Заблокировать</p>
                <Image
                  src={blocked}
                  alt="Заблокировать"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </button>
            )}
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
          <div className="my-2 relative">
            {data.avatar_url ? (
              <Image src={data.avatar_url} alt="Аватар" width={358} height={358} />
            ) : (
              <Image src="/avatar/big-avatar.jpg" alt="Аватар" width={358} height={358} />
            )}
            <div className="absolute bottom-3 left-4 text-white">
              <p className="text-2xl font-medium">
                {data.first_name} {data.last_name}
              </p>
              <p className="text-lg font-normal">
                {data.is_online ? "в сети" : `был(а) ${timeFormat(data.was_online_at * 1000)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 h-[52px]">
            <p>Уведомления</p>
            <div
              className={`relative w-[52px] h-[32px]  p-1 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
        ${chat.notifications ? "bg-(--color-violet)" : "bg-(--color-violet-2)"}`}
              onClick={() => toggleNotifications()}
            >
              <div
                className={`absolute w-[24px] h-[24px] bg-white rounded-full transition-all duration-300 ease-in-out
               ${chat.notifications ? "translate-x-4.75" : "translate-x-px"}`}
              ></div>
            </div>
          </div>
          <div className="mx-4 mb-2.5 w-[328px] bg-white rounded-lg">
            <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
              <div>
                <p className="text-(--color-gray) text-xs">Никнейм</p>
                <p className="text-(--color-violet)">{data.nickname}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCopyInfo({ text: data.nickname, name: "Никнейм" });
                  setShowCopyModal(true);
                }}
              >
                <Image src={copyIt} alt="Скопировать" width={24} height={24} />
              </button>
            </div>
            <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
              <div>
                <p className="text-(--color-gray) text-xs">Номер телефона</p>
                <p className="text-(--color-violet)">{data.username}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedCopyInfo({ text: data.username, name: "Телефон" });
                  setShowCopyModal(true);
                }}
              >
                <Image src={copyIt} alt="Скопировать" width={24} height={24} />
              </button>
            </div>
            {(() => {
              const formattedBirthday = birthdayCheck(data.birthday);
              return formattedBirthday ? (
                <div className="flex items-center justify-between h-[57px] px-2.5 border-b border-(--color-button-disabled)">
                  <div>
                    <p className="text-(--color-gray) text-xs">День рождения</p>
                    <p className="">{formattedBirthday}</p>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex items-center justify-between h-[81px] px-2.5">
              <div>
                <p className="text-(--color-gray) text-xs">О себе</p>
                <p className="">Художник из Санкт-Петербурга, пишу картины на заказ</p>
              </div>
            </div>
          </div>
          {!isInContacts && (
            <button
              className="flex items-center gap-x-1 h-[44px] px-4 mb-2"
              onClick={handleAddContact}
            >
              <Image src={plusViolet} alt="Добавить в контакты" width={16} height={16} />
              <p className="text-(--color-violet) font-normal">Добавить в контакты</p>
            </button>
          )}
          {chat.chat?.is_blocked && (
            <button
              className="flex items-center gap-x-1 h-[44px] px-4 mb-2"
              onClick={() => setIsDeleteToBlacklistModalOpen(true)}
            >
              <Image src={plusViolet} alt="Заблокировать" width={16} height={16} />
              <p className="text-(--color-violet) font-normal">Разблокировать</p>
            </button>
          )}

          <div>
            <nav className="flex border-b-[0.5px] border-(--color-button-disabled) h-[45px] w-full px-5 mb-4">
              {["Медиа", "Файлы", "Голосовые", "Ссылки"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-2.5 ${activeTab === tab ? "text-(--color-violet)" : ""}`}
                >
                  {tab}
                  {activeTab === tab ? (
                    <div
                      className={`absolute bottom-0 bg-(--color-violet) h-[4px] rounded-t-lg 
                        ${activeTab === "Медиа" && "w-[51px]"}
                        ${activeTab === "Файлы" && "w-[52px]"}
                        ${activeTab === "Голосовые" && "w-[83px]"}
                        ${activeTab === "Ссылки" && "w-[60px]"}`}
                    ></div>
                  ) : (
                    ""
                  )}
                </button>
              ))}
            </nav>
            <div className="h-[360px]">
              {activeTab === "Медиа" && (
                <div className="flex flex-wrap justify-center gap-0.5">
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-1.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-2.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-3.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-4.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-5.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-6.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-7.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-8.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative  h-[117px] w-[117px]">
                    <Image
                      src="/foto/foto-9.jpg"
                      alt="Фото"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
              {activeTab === "Файлы" && <p>Файлы</p>}
              {activeTab === "Голосовые" && <p>Голосовые</p>}
              {activeTab === "Ссылки" && <p>Ссылки</p>}
            </div>
          </div>
        </main>
      </OverlayScrollbarsComponent>
      {isClearChatModalOpen && (
        <ModalBase onClose={() => setIsClearChatModalOpen(false)}>
          <ModalConfirm
            onClose={() => {
              setIsClearChatModalOpen(false);
              setShowClearChatModal(true);
            }}
            onConfirm={() => setIsClearChatModalOpen(false)}
            title={`Очистить чат с ${chat?.chat?.first_name}${chat?.chat?.last_name ? ` ${chat.chat.last_name}` : ""}?`}
            message="Все сообщения в этом чате будут удалены только для вас. Собеседник по-прежнему сможет их видеть"
            confirmText="Отмена"
            cancelText="Очистить"
            className="text-red-500"
          />
        </ModalBase>
      )}
    </div>
  );
};

export default ProfileInfo;
