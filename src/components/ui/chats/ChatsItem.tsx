import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { formatChatsDate } from "@/src/utils/formatChatsDate";
import type { Chat } from "@/src/types/chat";

interface ChatItemProps {
  chat: Chat;
  selectedChatId: number | null;
  handleRightClick: (e: React.MouseEvent, chat: Chat) => void;
}

const ChatsItem = ({ chat, selectedChatId, handleRightClick }: ChatItemProps) => {
  
  // Вспомогательные функции для безопасного доступа к данным
  // const getChatName = (chat: Chat): string => {
  //   // Приоритет 1: Если есть name (группы/каналы)
  //   if (chat?.name) {
  //     return chat.name;
  //   }

  //   // Приоритет 2: Если есть chat с именем (личные чаты)
  //   if (chat?.chat) {
  //     const firstName = chat.chat.first_name || "";
  //     const lastName = chat.chat.last_name || "";
  //     return `${firstName} ${lastName}`.trim() || "Чат";
  //   }

  //   // Приоритет 3: Запасной вариант
  //   return "Без названия";
  // };

  // const getChatLink = (chat: Chat): string => {
  //   if (chat?.chat?.uid) {
  //     return `/chats/${chat.chat.uid}`;
  //   }
  //   // Для групп/каналов пока нет страницы
  //   return "#";
  // };

  // const getChatAvatar = (chat: Chat): string => {
  //   if (chat?.chat?.avatar_url) {
  //     return chat.chat.avatar_url;
  //   }
  //   return "/avatar/avatar-8.png";
  // };

  // const isActiveChat = (chat: Chat): boolean => {
  //   if (chat?.chat?.uid && pathname === `/chats/${chat.chat.uid}`) {
  //     return true;
  //   }
  //   return false;
  // };

  // const getLastMessageContent = (chat: Chat): string => {
  //   if (!chat?.last_message) return "Нет сообщений";
  //   return chat.last_message.content || "";
  // };

  // const getLastMessageTime = (chat: Chat): number | null => {
  //   if (!chat?.last_message) return null;
  //   return chat.last_message.created_at || null;
  // };

  // const getNewMessageCount = (chat: Chat): number => {
  //   return chat?.new_message_count || 0;
  // };

  // const isFavorite = (chat: Chat): boolean => {
  //   return chat?.is_favorite || false;
  // };

  // const hasNotifications = (chat: Chat): boolean => {
  //   return chat?.notifications !== false;
  // };

  const pathname = usePathname();
  const isActive = pathname.startsWith(`/chats/${chat.chat?.uid}`);

  return (
    <div className={`h-[80px] px-2 py-1  ${chat.is_favorite ? "bg-white" : ""} `}>
      <Link
        href={`/chats/${chat.chat?.uid}`}
        onContextMenu={e => handleRightClick(e, chat)}
        className={`
                    flex  gap-x-2 min-w-[342px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                    rounded-lg px-2 py-1.5
                    ${selectedChatId === chat.id ? "bg-(--color-gray-2)" : ""}
                
                   ${pathname.startsWith(`/chats/${chat.chat?.uid}`) ? "bg-(--color-violet-dark-opacity) hover:bg-(--color-violet-dark-opacity)" : ""}
                   ${!isActive && chat.is_favorite ? "" : ""} `}
      >
        {chat.chat?.avatar_url ? (
          <div className="min-w-15 min-h-15 w-15! h-15!  rounded-full overflow-hidden">
            <Image
              src={chat.chat.avatar_url}
              width={60}
              height={60}
              alt="Аватар"
              className="object-fill w-full h-full"
            />
          </div>
        ) : (
          <Image
            className="h-15 w-15"
            src="/avatar/avatar-8.png"
            width={60}
            height={60}
            alt="Аватар"
          />
        )}

        <div
          className="relative after:absolute 
                    after:left-0 after:right-0 after:bottom-[-11px] after:border-b after:border-1 
                    after:border-(--color-button-disabled) after:z--1 w-full"
        >
          <div className="flex justify-between mb-1">
            <div className="flex gap-x-1 h-[22px] ">
              <p
                className={`font-medium text‑lg leading-[1.2] truncate max-w-[165px]
                             ${isActive ? "text-white" : ""}`}
              >
                {chat.chat?.first_name} {chat.chat?.last_name}
              </p>
              {!chat.notifications && (
                <div className="flex items-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M3.25672 2.20312L2.19922 3.26063L5.46922 6.53062L5.25172 6.75562H2.25172V11.2556H5.25172L9.00172 15.0056V10.0631L12.1367 13.1981C11.6492 13.5656 11.1017 13.8581 10.5017 14.0306V15.5756C11.5067 15.3506 12.4292 14.8856 13.2092 14.2631L14.7467 15.8006L15.8042 14.7431L3.25672 2.20312ZM7.50172 11.3831L5.87422 9.75562H3.75172V8.25562H5.87422L6.53422 7.59562L7.50172 8.56312V11.3831ZM14.2517 9.00562C14.2517 9.62062 14.1392 10.2131 13.9442 10.7606L15.0917 11.9081C15.5117 11.0306 15.7517 10.0481 15.7517 9.00562C15.7517 5.79562 13.5092 3.11062 10.5017 2.42812V3.97312C12.6692 4.61812 14.2517 6.62812 14.2517 9.00562ZM9.00172 3.00562L7.59172 4.41563L9.00172 5.82562V3.00562ZM12.3767 9.00562C12.3767 7.67812 11.6117 6.53813 10.5017 5.98312V7.32562L12.3617 9.18562C12.3692 9.12562 12.3767 9.06562 12.3767 9.00562Z"
                      fill={`${isActive ? "var(--color-white)" : "var(--color-gray)"}`}
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex gap-x-0.5 h-[22px]">
              {/* {chat.new_message_count < 2 && ( */}
              <div className="flex items-center">
                {chat.last_message.new ? (
                  // не прочитано
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M14.7101 3.80859L6.51915 11.9996L3.28302 8.77117L2.19141 9.86279L6.51915 14.1905L15.8095 4.90021L14.7101 3.80859Z"
                      fill={`${isActive ? "var(--color-white)" : "var(--color-gray)"}`}
                    />
                  </svg>
                ) : (
                  // прочитано
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M13.6181 4.90021L12.5265 3.80859L7.61806 8.71698L8.70968 9.80859L13.6181 4.90021ZM16.9006 3.80859L8.70968 11.9996L5.47355 8.77117L4.38194 9.86279L8.70968 14.1905L18 4.90021L16.9006 3.80859ZM0 9.86279L4.32774 14.1905L5.41935 13.0989L1.09935 8.77117L0 9.86279Z"
                      fill={`${isActive ? "var(--color-white)" : "var(--color-violet)"}`}
                    />
                  </svg>
                )}
                {/* <Image
                              className="w-4.5 h-4.5"
                              src="/assets/icons/chat/loading.svg"
                              alt="Загрузка"
                              width={18}
                              height={18}
                            /> */}
              </div>
              {/* } */}

              <div className="flex items-center">
                <p
                  className={`text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] 
                              ${isActive ? "text-white" : ""}`}
                >
                  {formatChatsDate(chat.last_message?.created_at * 1000)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full h-[34px]">
            <p
              className={`text-sm font-normal text-(--color-gray) 
                            ${chat.is_favorite || chat.new_message_count > 1 ? "w-[231px]" : "w-[260px]"}  
                             leading-[1.2] tracking-[1%] line-clamp-2
                                 ${isActive ? "text-white" : ""}`}
            >
              {chat.last_message?.content}
            </p>
            {chat.is_favorite && chat.new_message_count < 2 && (
              <div className="flex items-center">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <path
                    d="M12.25 3.5V7.875C12.25 8.855 12.5737 9.765 13.125 10.5H7.875C8.44375 9.7475 8.75 8.8375 8.75 7.875V3.5H12.25ZM14.875 1.75H6.125C5.64375 1.75 5.25 2.14375 5.25 2.625C5.25 3.10625 5.64375 3.5 6.125 3.5H7V7.875C7 9.3275 5.8275 10.5 4.375 10.5V12.25H9.59875V18.375L10.4738 19.25L11.3488 18.375V12.25H16.625V10.5C15.1725 10.5 14 9.3275 14 7.875V3.5H14.875C15.3562 3.5 15.75 3.10625 15.75 2.625C15.75 2.14375 15.3562 1.75 14.875 1.75Z"
                    fill={`  ${isActive ? "var(--color-white)" : "var(--color-gray)"}`}
                  />
                </svg>
              </div>
            )}

            {!chat.last_message.new && chat.new_message_count > 1 && (
              <div className="flex items-center">
                <span
                  className={`flex items-center px-1.5 h-[21px] rounded-[10px] bg-(--color-violet) 
                            ${isActive ? "bg-(--color-white) text-(--color-violet) font-semibold" : "text-white font-normal"}
                              `}
                >
                  {chat.new_message_count < 1000
                    ? chat.new_message_count
                    : `${(chat.new_message_count / 1000).toFixed(1).replace(".", ",")}K`}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ChatsItem;
