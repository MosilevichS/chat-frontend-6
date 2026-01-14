"use client";

import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";
import { useEffect, useRef, useState } from "react";
import { chatsList } from "@/src/data/chats";

const Contacts = () => {
  const [chats, setChats] = useState(chatsList);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Функция: проверить, превышает ли высота контента 100vh − 165px
    const isContentTall = () => {
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight - 165; // 100vh − 165px
      return container.scrollHeight > threshold;
    };

    // Обработчик ховера
    const onMouseEnter = () => {
      if (isContentTall()) {
        container.style.paddingRight = "0px";
      }
    };

    const onMouseLeave = () => {
      container.style.paddingRight = "6px"; // Сброс
    };

    // Прикрепим обработчики
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    // Очистка
    return () => {
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-row gap-x-6 w-full justify-center md:mb-1">
      <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
        <div className="relative w-full p-4">
          <Input
            onChange={handleChange}
            placeholder="Поиск"
            type="search"
            className="placeholder:text-base placeholder:height-1.3; placeholder:font-normal border border-(--color-gray-1) 
            pr-3 pl-11 pt-2.5 pb-2.5 md:pr-3 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px]"
          />
          <Image src={search} alt="Поиск" className="absolute left-7 top-8 w-[16px] md:w-[24px]" />
        </div>
        <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
          <p className="text-sm font-normal leading-[1.2]">Контакты пользователей А-чата</p>
          <button className="cursor-pointer">
            <Image
              src="/assets/icons/contacts/delete-gray.svg"
              alt="Удалить"
              width={24}
              height={24}
              className="w-[24px] h-[24px]"
            />
          </button>
        </div>

        <div
          ref={containerRef}
          className="w-full overflow-y-auto h-[calc(100vh-165px)] md:h-[calc(100vh-206px)] scroll-custom px-2"
        >
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <div
                key={index}
                className={`flex py-1.5 gap-x-2.5 min-w-[344px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                   rounded-lg px-2 mt-2 mb-1
               ${selectedChatId === `${chat.name}` ? "bg-(--color-gray-2)" : ""}`}
              >
                {chat.avatar ? (
                  <Image
                    className="h-10 w-10"
                    src={chat.avatar}
                    width={40}
                    height={40}
                    alt="Аватар"
                  />
                ) : (
                  <Image
                    className="h-10 w-10"
                    src="/avatar/avatar-8.png"
                    width={40}
                    height={40}
                    alt="Аватар"
                  />
                )}
                <div className="relative after:absolute after:left-0 after:right-0 after:bottom-[-10px] after:border-b after:border-1 after:border-(--color-button-disabled) after:z--1 w-full">
                  <p className="font-medium text‑lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                    {chat.name}
                  </p>
                  {chat.is_online && (
                    <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2">
                      в сети
                    </p>
                  )}
                  {chat.was_online_at && (
                    <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2">
                      {chat.was_online_at}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
              <Image
                className="mb-6"
                src="/images/not-found.png"
                alt="Ничего не найдено"
                width={200}
                height={200}
              />
              <p className="mb-2 text-lg">Поиск не дал результатов</p>
              <p className="text-[14px]">По вашему запросу ничего не найдено.</p>
              <p className="text-[14px]">Измените запрос и попробуйте снова</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="hidden md:flex justify-center text-center items-center w-full 
      max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4"
      >
        <p className="text-(--color-gray) text-lg font-normal">
          Выберите контакт для начала общения
        </p>
      </div>
    </div>
  );
};

export default Contacts;
