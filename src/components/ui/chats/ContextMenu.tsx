import Image from "next/image";

type Chat = {
  name: string;
  notifications: boolean;
  // другие поля
};

type ContextMenuProps = {
  isOpen: boolean;
  ref: React.RefObject<HTMLDivElement | null>;
  chats: Chat[];
  chatId: string | null;
  position: { x: number; y: number; placement: "top" | "bottom" };
  onToggleNotifications: () => void;
  menuOffset: number;
};

const ContextMenu = ({
  isOpen,
  ref,
  chats,
  chatId,
  position,
  onToggleNotifications,
  menuOffset,
}: ContextMenuProps) => {
  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute h-[238px] w-[250px] bg-(--color-white) rounded-[10px]`}
      style={{
        left: `${position.x}px`,
        ...(position.placement === "bottom"
          ? { top: `${position.y + menuOffset}px` }
          : { bottom: `${window.innerHeight - position.y + menuOffset}px` }),
      }}
    >
      <button className="w-full flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)">
        <p>Добавить в контакты</p>
        <Image
          className="w-6 h-6"
          src="/assets/icons/chat/plus-contact.svg"
          alt="Добавить в контакты"
          width={24}
          height={24}
        />
      </button>
      <button
        className="w-full flex justify-between items-center gap-x-[15px] h-[62px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)"
        onClick={onToggleNotifications}
      >
        <p className="text-left">
          {chats.find(c => c.name === chatId)?.notifications
            ? "Выключить уведомления"
            : "Включить уведомления"}
        </p>
        <Image
          className="w-6 h-6"
          src="/assets/icons/chat/no-sound.svg"
          alt="Выключить уведомления"
          width={24}
          height={24}
        />
      </button>
      <div className="flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)">
        <p>Закрепить</p>
        <Image
          className="w-6 h-6"
          src="/assets/icons/chat/to-fix.svg"
          alt="Закрепить"
          width={24}
          height={24}
        />
      </div>
      <div className="flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)">
        <p>Пометить прочитанным</p>
        <Image
          className="w-6 h-6"
          src="/assets/icons/chat/read-ok.svg"
          alt="Пометить прочитанным"
          width={24}
          height={24}
        />
      </div>
      <div className="flex justify-between items-center h-[44px] px-4 border-b border-(--color-button-disabled) cursor-pointer hover:bg-(--color-gray-light)">
        <p className="text-(--color-error)">Удалить чат</p>
        <Image
          className="w-6 h-6"
          src="/assets/icons/chat/delete.svg"
          alt="Удалить чат"
          width={24}
          height={24}
        />
      </div>
    </div>
  );
};

export default ContextMenu;
