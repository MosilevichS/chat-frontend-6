"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Contacts from "@/src/components/ui/contacts/Contacts";

export default function ContactsLayout({ chat }: { chat: React.ReactNode }) {
  const segment = useSelectedLayoutSegment("chat");
  const hasChat = Boolean(segment);

  return (
    <>
      {/* MOBILE */}
      <div className="block md:hidden h-full">{hasChat ? chat : <Contacts />}</div>

      {/* DESKTOP */}
      <div className="hidden md:flex md:gap-x-6 h-full">
        <Contacts />
        {chat}
      </div>
    </>
  );
}
