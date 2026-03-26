"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Checkbox from "@/src/components/ui/Checkbox";
import {
  useCreateGroupMutation,
  useCreateChannelMutation,
  chatCreationUtils,
} from "@/src/services/groupOrChannelCreationApi";
import { useDynamicHeight } from "@/src/hooks/useDynamicHeight";
import { useGetContactsQuery } from "@/src/services/contactApi";
import { useGetChatsQuery } from "@/src/services/chatsApi";
import type { IContact } from "@/src/types/contact";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

// ✅ правильный helper
const getParam = (param?: string | string[]) => (Array.isArray(param) ? param[0] : param || "");

export default function AddSubscribersPage({ searchParams }: Props) {
  const router = useRouter();

  const type = getParam(searchParams.type) || "group";
  const name = getParam(searchParams.name);
  const description = getParam(searchParams.description);
  const photo = getParam(searchParams.photo);
  const chatType = getParam(searchParams.chatType) || "private-group";
  const chatKey = getParam(searchParams.chat_key);

  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [createChannel, { isLoading: isCreatingChannel }] = useCreateChannelMutation();
  const { refetch: refetchChats } = useGetChatsQuery();

  const { data: contactsData, isLoading: isLoadingContacts } = useGetContactsQuery();
  const contacts = contactsData?.results || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [creationError, setCreationError] = useState<string | null>(null);

  const isAddingToExisting = Boolean(chatKey);
  const containerRef = useRef<HTMLDivElement>(null);

  useDynamicHeight({
    containerRef,
    hasActionButton: true,
    hasHeader: true,
    extraOffset: 72,
  });

  const handleAddToGroup = async () => {
    setCreationError(null);

    try {
      console.log("Adding members:", {
        chat_key: chatKey,
        uid_users_list: selectedContactIds,
      });

      router.push(`/chats/${chatKey}?type=group`);
    } catch (err) {
      console.error(err);
      setCreationError("Ошибка при добавлении участников");
    }
  };

  const handleCreateGroup = async () => {
    setCreationError(null);

    try {
      const avatarBase64 = photo ? chatCreationUtils.extractBase64FromDataUrl(photo) : "";

      const avatar = chatCreationUtils.createAvatarObject(avatarBase64);

      if (type === "group") {
        const result = await createGroup({
          name,
          description,
          avatar,
          chat_type: chatType as "public-group" | "private-group",
          uid_users_list: selectedContactIds,
        }).unwrap();

        if (result.status === "OK" && result.object) {
          await refetchChats();
          router.push(`/chats/${result.object.chat_key}?type=group`);
        } else {
          setCreationError(result.error || "Ошибка создания группы");
        }
      } else {
        const result = await createChannel({
          name,
          description,
          avatar,
          chat_type: chatType as "public-channel" | "private-channel",
          uid_users_list: selectedContactIds,
        }).unwrap();

        if (result.status === "OK" && result.object) {
          await refetchChats();
          router.push(`/chats/${result.object.chat_key}?type=group`);
        } else {
          setCreationError(result.error || "Ошибка создания канала");
        }
      }
    } catch (err) {
      console.error(err);
      setCreationError("Ошибка при создании чата");
    }
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const filteredContacts = contacts.filter((c: IContact) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isCreating = isCreatingGroup || isCreatingChannel;

  const title = isAddingToExisting
    ? "Добавить участников"
    : type === "channel"
      ? "Добавить подписчиков"
      : "Пригласить участников";

  const buttonText = isCreating
    ? "Загрузка..."
    : isAddingToExisting
      ? "Пригласить"
      : type === "channel"
        ? "Создать канал"
        : "Создать группу";

  if (isLoadingContacts) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1>{title}</h1>

      <Input placeholder="Поиск" onChange={e => setSearchQuery(e.target.value)} />

      {filteredContacts.map(c => (
        <div key={c.uid} onClick={() => toggleContactSelection(c.uid)}>
          {c.first_name} {c.last_name}
          {/* ✅ FIX */}
          <Checkbox
            checked={selectedContactIds.includes(c.uid)}
            onChange={() => toggleContactSelection(c.uid)}
            name="contact"
            value={c.uid}
          />
        </div>
      ))}

      {/* ✅ FIX */}
      <Button
        variant="primary"
        size="medium"
        onClick={isAddingToExisting ? handleAddToGroup : handleCreateGroup}
        disabled={isCreating}
      >
        {buttonText}
      </Button>

      {creationError && <p>{creationError}</p>}
    </div>
  );
}
