"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Chats from "@/src/components/ui/chats/Chats";

export default function ContactsLayout({ chat }: { chat: React.ReactNode }) {
  const segment = useSelectedLayoutSegment("chat");
  const hasChat = Boolean(segment);
  const pathname = usePathname();

  const isCreationPage =
    pathname === "/chats/new-group" ||
    pathname === "/chats/new-channel" ||
    pathname === "/chats/add-subscribers";

  const getDesktopContent = () => {
    if (isCreationPage) {
      return chat; // ← 🔥 ключевой момент
    }

    return (
      <>
        <Chats />
        {chat}
      </>
    );
  };

  const getMobileContent = () => {
    if (isCreationPage) {
      return chat;
    }

    if (hasChat) {
      return chat;
    }

    return <Chats />;
  };

  return (
    <>
      <div className="block md:hidden h-full">{getMobileContent()}</div>
      <div className="hidden md:flex md:gap-x-6 h-full">{getDesktopContent()}</div>
    </>
  );
}
