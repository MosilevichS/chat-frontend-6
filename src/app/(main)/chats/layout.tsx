"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import Chats from "@/src/components/ui/chats/Chats";
import NewGroupPage from "./new-group/page";
import NewChannelPage from "./new-channel/page";

export default function ContactsLayout({ chat }: { chat: React.ReactNode }) {
  const segment = useSelectedLayoutSegment("chat");
  const hasChat = Boolean(segment);

  const pathname = usePathname();

  const renderMobileContent = () => {
    if (pathname === "/chats/new-group") {
      return <NewGroupPage />;
    }
    if (pathname === "/chats/new-channel") {
      return <NewChannelPage />;
    }
    return <>{hasChat ? chat : <Chats />}</>;
  };

  const renderDesktopContent = () => {
    if (pathname === "/chats/new-group") {
      return <NewGroupPage />;
    }
    if (pathname === "/chats/new-channel") {
      return <NewChannelPage />;
    }
    return (
      <>
        <Chats />
        {chat}
      </>
    );
  };

  return (
    <>
      {/* MOBILE */}
      <div className="block md:hidden h-full">{renderMobileContent()}</div>

      {/* DESKTOP */}
      <div className="hidden md:flex md:gap-x-6 h-full">{renderDesktopContent()}</div>
    </>
  );
}
