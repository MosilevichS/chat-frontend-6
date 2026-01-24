"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Image from "next/image";
import backDesktop from "../../../../assets/icons/back-desktop.svg";
import backMobile from "../../../../assets/icons/back-icon.svg";
import search from "../../../../assets/icons/search.svg";
import { chatsList } from "@/src/data/chats";
import Checkbox from "@/src/components/ui/Checkbox";
import {
  useCreateGroupMutation,
  useCreateChannelMutation,
  chatCreationUtils,
} from "@/src/services/groupOrChannelCreationApi";
import { useDynamicHeight } from "@/src/hooks/useDynamicHeight";

const AddSubscribersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "group";
  const name = searchParams.get("name") || "";
  const description = searchParams.get("description") || "";
  const photo = searchParams.get("photo") || "";
  const chatType = searchParams.get("chatType") || "private-group";

  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [createChannel, { isLoading: isCreatingChannel }] = useCreateChannelMutation();

  const [contacts] = useState(chatsList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [creationError, setCreationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useDynamicHeight({
    containerRef,
    hasActionButton: true,
    hasHeader: true,
    extraOffset: 72,
  });

  const handleCreate = async () => {
    setCreationError(null);

    try {
      const avatarBase64 = photo ? chatCreationUtils.extractBase64FromDataUrl(photo) : "";
      const avatar = chatCreationUtils.createAvatarObject(avatarBase64);

      const decodedName = decodeURIComponent(name);
      const decodedDescription = decodeURIComponent(description);

      if (type === "group") {
        const groupData = {
          name: decodedName,
          description: decodedDescription,
          avatar,
          chat_type: chatType as "public-group" | "private-group",
          uid_users_list: selectedContactIds,
        };

        console.log("Создание группы с данными:", groupData);

        const result = await createGroup(groupData).unwrap();

        if (result.status === "OK" && result.object) {
          console.log("Группа успешно создана:", result.object);
          router.push("/chats");
        } else {
          setCreationError(result.error || "Неизвестная ошибка при создании группы");
        }
      } else if (type === "channel") {
        const channelData = {
          name: decodedName,
          description: decodedDescription,
          avatar,
          chat_type: chatType as "public-channel" | "private-channel",
          uid_users_list: selectedContactIds,
        };

        console.log("Создание канала с данными:", channelData);

        const result = await createChannel(channelData).unwrap();

        if (result.status === "OK" && result.object) {
          console.log("Канал успешно создан:", result.object);
          router.push("/chats");
        } else {
          setCreationError(result.error || "Неизвестная ошибка при создании канала");
        }
      }
    } catch (err: unknown) {
      console.error("Ошибка при создании чата:", err);

      if (err && typeof err === "object" && "data" in err) {
        const errorData = err as { data?: { error?: string } };
        if (errorData.data?.error) {
          setCreationError(errorData.data.error);
        } else if (
          errorData.data &&
          typeof errorData.data === "object" &&
          "message" in errorData.data
        ) {
          const errorObj = errorData.data as { message?: string };
          if (errorObj.message) {
            setCreationError(errorObj.message);
          }
        }
      } else if (err && typeof err === "object" && "error" in err) {
        const errorObj = err as { error?: string };
        if (errorObj.error) {
          setCreationError(errorObj.error);
        }
      } else if (err && typeof err === "object" && "message" in err) {
        const errorObj = err as { message?: string };
        if (errorObj.message) {
          setCreationError(errorObj.message);
        }
      } else if (typeof err === "string") {
        setCreationError(err);
      } else {
        setCreationError("Произошла ошибка при создании. Попробуйте еще раз.");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const isCreating = isCreatingGroup || isCreatingChannel;
  const title = type === "channel" ? "Добавить подписчиков" : "Пригласить участников";
  const buttonText = isCreating
    ? "Создание..."
    : type === "channel"
      ? "Создать канал"
      : "Создать группу";

  const errorMessage = creationError;

  return (
    <div className="flex flex-row gap-x-6 w-full justify-center md:mb-1">
      <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
        <div className="flex items-center w-full p-4 relative">
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 w-10 h-10 bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
            aria-label="Назад"
          >
            <div className="md:hidden flex items-center justify-center">
              <Image
                src={backMobile}
                alt="Назад"
                width={24}
                height={24}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="hidden md:flex items-center justify-center">
              <Image
                src={backDesktop}
                alt="Назад"
                width={24}
                height={24}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </button>

          <h1 className="text-lg font-semibold text-gray-900 md:ml-3 ml-auto mr-auto md:mr-0">
            {title}
          </h1>
        </div>

        {errorMessage && (
          <div className="mx-4 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="relative w-full px-4 pb-3">
          <Input
            onChange={handleSearchChange}
            placeholder="Поиск"
            type="search"
            className="placeholder:text-base placeholder:height-1.3; placeholder:font-normal border border-(--color-gray-1) 
              pr-3 pl-11 pt-2.5 pb-2.5 md:pr-3 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px]"
          />
          <Image
            src={search}
            alt="Поиск"
            className="absolute left-7 top-1/2 -translate-y-1/2 w-[16px] md:w-[24px]"
          />
        </div>

        <div
          ref={containerRef}
          className="w-full overflow-y-auto px-2 overflow-x-hidden scroll-custom"
        >
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className={`flex items-center py-1.5 gap-x-2.5 h-[72px] rounded-lg px-2 mt-2 mb-1 cursor-pointer
                  ${
                    selectedContactIds.includes(contact.id)
                      ? "bg-(--color-overlay)"
                      : "hover:bg-(--color-gray-2)"
                  }`}
              >
                <div className="relative" onClick={() => toggleContactSelection(contact.id)}>
                  {contact.avatar ? (
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={contact.avatar}
                      width={40}
                      height={40}
                      alt="Аватар"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-white font-medium">{contact.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0" onClick={() => toggleContactSelection(contact.id)}>
                  <p className="font-medium text‑lg leading-[1.2] truncate mb-0.5">
                    {contact.name}
                  </p>
                  {contact.is_online ? (
                    <p className="text-sm font-normal text-(--color-violet) leading-[1.2]">
                      в сети
                    </p>
                  ) : (
                    contact.was_online_at && (
                      <p className="text-sm font-normal text-(--color-gray) leading-[1.2]">
                        был(а) {contact.was_online_at}
                      </p>
                    )
                  )}
                </div>

                <Checkbox
                  checked={selectedContactIds.includes(contact.id)}
                  onChange={() => toggleContactSelection(contact.id)}
                  name="contact-selection"
                  value={contact.id}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-(--color-gray) font-normal">
              <Image
                className="mb-6"
                src="/images/not-found.png"
                alt="Ничего не найдено"
                width={120}
                height={120}
              />
              <p className="mb-2 text-lg">Контакты не найдены</p>
              <p className="text-[14px]">Попробуйте изменить запрос поиска</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 pb-4 px-4 border-t border-(--color-gray-1)">
          <Button
            variant="primary"
            size="medium"
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full"
          >
            {buttonText}
          </Button>
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg border border-(--color-gray-1)" />
    </div>
  );
};

export default AddSubscribersPage;
