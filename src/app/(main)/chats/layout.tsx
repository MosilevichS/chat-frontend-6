"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Chats from "@/src/components/ui/chats/Chats";
import NewGroupPage from "./new-group/page";
import NewChannelPage from "./new-channel/page";
import AddSubscribersPage from "./add-subscribers/page";

export default function ContactsLayout({ chat }: { chat: React.ReactNode }) {
  const segment = useSelectedLayoutSegment("chat");
  const hasChat = Boolean(segment);
  const pathname = usePathname();

  // Функция для определения контента на десктопе
  const getDesktopContent = () => {
    // Страницы создания
    if (pathname === "/chats/new-group") {
      return <NewGroupPage />;
    }

    if (pathname === "/chats/new-channel") {
      return <NewChannelPage />;
    }

    if (pathname === "/chats/add-subscribers") {
      return <AddSubscribersPage />;
    }

    // Для всех остальных страниц показываем список чатов и параллельный маршрут

    return (
      <>
        <Chats />
        {chat}
      </>
    );
  };

  // Функция для определения контента на мобильных устройствах
  const getMobileContent = () => {
    // На мобильных устройствах страницы создания занимают весь экран
    if (pathname === "/chats/new-group") {
      return <NewGroupPage />;
    }

    if (pathname === "/chats/new-channel") {
      return <NewChannelPage />;
    }

    if (pathname === "/chats/add-subscribers") {
      return <AddSubscribersPage />;
    }

    // Если есть открытый чат, показываем его
    if (hasChat) {
      return chat;
    }

    // Иначе показываем список чатов
    return <Chats />;
  };

  return (
    <>
      {/* MOBILE */}
      <div className="block md:hidden h-full">{getMobileContent()}</div>

      {/* DESKTOP */}
      <div className="hidden md:flex md:gap-x-6 h-full">{getDesktopContent()}</div>
    </>
  );
}
