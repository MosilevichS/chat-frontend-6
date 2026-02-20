"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useGetChatsQuery } from "@/src/services/chatsApi";
import Chat from "@/src/components/ui/chat/Chat";
import GroupChat from "@/src/components/ui/chat/GroupChat";
import Loader from "@/src/components/ui/Loader";

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  const id = params?.user_uid as string;
  
  console.log("Page params:", { id, type });
  
  const { data: chatsData, isLoading } = useGetChatsQuery();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1) px-4">
        <Loader />
      </div>
    );
  }
  
  // Если есть параметр type=group - показываем GroupChat
  if (type === "group") {
    console.log("Rendering GroupChat with id:", id);
    return <GroupChat />;
  }
  
  // Иначе показываем личный чат
  console.log("Rendering Chat with id:", id);
  return <Chat />;
}