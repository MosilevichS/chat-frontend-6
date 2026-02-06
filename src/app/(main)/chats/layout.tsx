"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Chats from "@/src/components/ui/chats/Chats";
import NewGroupPage from "./new-group/page";
import NewChannelPage from "./new-channel/page";

export default function ContactsLayout({ chat }: { chat: React.ReactNode }) {
  const segment = useSelectedLayoutSegment("chat");
  const hasChat = Boolean(segment);

  const pathname = usePathname();

  return (
    <>
      {/* MOBILE */}
      <div className="block md:hidden h-full">{hasChat ? chat : <Chats />}</div>

      {/* DESKTOP */}
      <div className="hidden md:flex md:gap-x-6 h-full">
        {pathname === "/chats/new-group" ? (
          <NewGroupPage />
        ) : pathname === "/chats/new-channel" ? (
          <NewChannelPage />
        ) : (
          <>
            <Chats />
            {chat}
          </>
        )}
      </div>
    </>
  );
}
