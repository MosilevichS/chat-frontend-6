import Image from "next/image";
import { type IChat } from "@/src/types/chat";

import notifications from "../../../assets/icons/notifications.svg";
import addContact from "../../../assets/icons/add-contact.svg";
import toFix from "../../../assets/icons/to-fix.svg";
import deleteChat from "../../../assets/icons/delete_outline.svg";
import readOk from "../../../assets/icons/read-ok.svg";

type ContextMenuProps = {
  isOpen: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  chats: IChat[] | undefined;
  chatId: number | null;
  position: { x: number; y: number; placement: "top" | "bottom" };
  onToggleNotifications: () => void;
  toggleFavorite: () => void;
  addContacts: () => void;
  setAllMessagesRead: () => void;
  handleDeleteChat: () => void;
  menuOffset: number;
};

const ContextMenu = ({
  isOpen,
  ref,
  chats,
  chatId,
  position,
  onToggleNotifications,
  toggleFavorite,
  addContacts,
  setAllMessagesRead,
  handleDeleteChat,
  menuOffset,
}: ContextMenuProps) => {
  if (!isOpen || !chats) return null;

  const chat = chats.find(c => c.id === chatId);
  if (!chat) return null;

  // Проверяем, можно ли добавить в контакты (только для личных чатов)
  const canAddToContacts = chat.chat && "is_in_contacts" in chat.chat;

  return (
    <div
      ref={ref}
      className={`absolute z-10 max-h-[238px] w-[250px] bg-(--color-white) rounded-[10px]`}
      style={{
        left: `${position.x}px`,
        ...(position.placement === "bottom"
          ? { top: `${position.y + menuOffset}px` }
          : { bottom: `${window.innerHeight - position.y + menuOffset}px` }),
      }}
    >
      {canAddToContacts && !chat.chat?.is_in_contacts && (
        <button
          className="w-full flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer 
          hover:bg-(--color-gray-light) hover:rounded-t-[10px]"
          onClick={addContacts}
        >
          <p>Добавить в контакты</p>
          <Image
            className="w-6 h-6"
            src={addContact}
            alt="Добавить в контакты"
            width={24}
            height={24}
          />
        </button>
      )}
      <button
        className={`w-full flex justify-between items-center gap-x-[15px] h-[62px] px-4 border-b border-(--color-button-disabled) cursor-pointer 
        hover:bg-(--color-gray-light)  
        ${canAddToContacts && !chat.chat?.is_in_contacts ? "" : "hover:rounded-t-[10px]"}`}
        onClick={onToggleNotifications}
      >
        <p className="text-left">
          {chat.notifications ? "Выключить уведомления" : "Включить уведомления"}
        </p>
        <Image
          className="w-6 h-6"
          src={notifications}
          alt={chat.notifications ? "Выключить уведомления" : "Включить уведомления"}
          width={24}
          height={24}
        />
      </button>
      <button
        className="w-full flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)"
        onClick={toggleFavorite}
      >
        <p className="text-left">{chat.is_favorite ? "Открепить" : "Закрепить"}</p>
        <Image
          className="w-6 h-6"
          src={toFix}
          alt={chat.is_favorite ? "Открепить" : "Закрепить"}
          width={24}
          height={24}
        />
      </button>
      <button
        className="w-full flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)"
        onClick={setAllMessagesRead}
      >
        <p>Пометить прочитанным</p>
        <Image className="w-6 h-6" src={readOk} alt="Пометить прочитанным" width={24} height={24} />
      </button>
      <button
        className="w-full flex justify-between items-center h-[44px] px-4 cursor-pointer 
      hover:bg-(--color-gray-light) hover:rounded-b-[10px]"
        onClick={handleDeleteChat}
      >
        <p className="text-(--color-error)">Удалить чат</p>
        <Image className="w-6 h-6" src={deleteChat} alt="Удалить чат" width={24} height={24} />
      </button>
    </div>
  );
};

export default ContextMenu;
