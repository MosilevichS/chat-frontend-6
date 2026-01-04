"use client";

import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";
import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/src/hooks/useClickOutside";
import ContextMenu from "./_components/ContextMenu";
// import { useGetChatsQuery } from "@/src/services/chatsApi";

const Chats = () => {
  const POPUP_HEIGHT = 238;
  const MENU_OFFSET = 20;

  const [chats, setChats] = useState([
    {
      name: "Влад Ляшев",
      avatar: "/avatar/avatar-1.png",
      content: "Привет, Владик!",
      time: "21:49",
      new: true,
      notifications: false,
    },
    {
      name: "Сергей Евтушенко",
      avatar: "/avatar/avatar-2.png",
      content:
        "Привет. Я оставил две стремянки и два шуруповёрта. Один в кейсе, а другой просто так. Одна батарейка может кончиться, тогда будете одним добивать. Воды с собой возьмите, там ничего уже не осталось.",
      time: "21:49",
      new: false,
      notifications: false,
    },
    {
      name: "Инна Георгиевна",
      avatar: "/avatar/avatar-3.png",
      content:
        "Привет. Я оставил две стремянки и два шуруповёрта. Один в кейсе, а другой просто так. Одна батарейка может кончиться, тогда будете одним добивать. Воды с собой возьмите, там ничего уже не осталось.",
      time: "21:49",
      notifications: true,
    },
    {
      name: "Константин Передвиженцев",
      avatar: "/avatar/avatar-4.png",
      content: "doc00498820200806132640.pdf",
      time: "21:49",
      new: true,
      notifications: false,
    },
    {
      name: "Анастасия Бортникова",
      avatar: "/avatar/avatar-5.png",
      content: "Мурка по утрам на балкон рвëтся. Никак не успокоится",
      time: "21:49",
      new: true,
      notifications: true,
    },
    {
      name: "Ванесса Рейхарт",
      avatar: "/avatar/avatar-6.png",
      content:
        "Привет. Я оставил две стремянки и два шуруповёрта. Один в кейсе, а другой просто так. Одна батарейка может кончиться, тогда будете одним добивать. Воды с собой возьмите, там ничего уже не осталось.",
      time: "ПН",
      new: true,
      notifications: false,
    },
    {
      name: "Илья Макаров",
      avatar: "/avatar/avatar-7.png",
      content: "instruction.pdf",
      time: "ПН",
      new: false,
      notifications: false,
    },
    {
      name: "Алексей Митрофанов",
      content:
        "Мурка по утрам на балкон рвëтся. Жить не может без традиционного гуляния на балконе.",
      time: "ПН",
      new: false,
      notifications: true,
    },
    {
      name: "Александр Маслюченков",
      avatar: "/avatar/avatar-9.png",
      content:
        "Мурка по утрам на балкон рвëтся. Жить не может без традиционного гуляния на балконе.",
      time: "ПН",
      new: false,
      notifications: true,
    },
    {
      name: "Ира Непогодьевшинаа",
      avatar: "/avatar/avatar-10.png",
      content: "Привет",
      time: "30.12.23",
      new: false,
      notifications: true,
    },
    {
      name: "Оксана Костомина",
      avatar: "/avatar/avatar-11.png",
      content: "Привет",
      time: "30.12.23",
      new: false,
      notifications: false,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openContextMenu, setOpenContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
    placement: "bottom" as "top" | "bottom",
  });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  const handleRightClick = (e: React.MouseEvent, chat) => {
    e.preventDefault();
    const chatId = chat.name;

    const { clientY, clientX } = e;
    const windowHeight = window.innerHeight;

    const hasSpaceBelow = clientY + POPUP_HEIGHT + MENU_OFFSET <= windowHeight;

    setMenuPosition({
      x: clientX,
      y: clientY,
      placement: hasSpaceBelow ? "bottom" : "top",
    });

    setOpenContextMenu(true);
    setSelectedChatId(chatId);
  };

  const handleOutsideClick = () => {
    setOpenContextMenu(false);
    setSelectedChatId(null);
  };

  useClickOutside(popupRef, handleOutsideClick);

  // const { data, isLoading, error } = useGetChatsQuery();

  // console.log(data, error);

  const toggleNotifications = () => {
    if (!selectedChatId) return;

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.name === selectedChatId ? { ...chat, notifications: !chat.notifications } : chat,
      ),
    );

    setOpenContextMenu(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setSearchQuery(e.target.value);
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-row  gap-x-6 w-full  justify-center md:mb-1">
      <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-88px)]">
        <div className="relative w-full p-4 bg-(--color-gray-light) md:rounded-t-lg border-t border-l border-r border-(--color-gray-1)">
          <Input
            onChange={handleChange}
            placeholder="Поиск"
            type="search"
            className="placeholder:text-base placeholder:height-1.3; placeholder:font-normal border border-(--color-gray-1) 
            pr-3 pl-11 pt-2.5 pb-2.5 md:pr-3 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px]"
          />
          <Image src={search} alt="Поиск" className="absolute left-7 top-8 w-[16px] md:w-[24px]" />
        </div>

        <div
          ref={containerRef}
          className="w-full overflow-y-auto h-[calc(100vh-165px)] md:h-[calc(100vh-170px)] scroll-custom px-2 
         bg-(--color-gray-light) md:rounded-b-lg border-b border-l border-r border-(--color-gray-1)"
        >
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <div
                onContextMenu={e => handleRightClick(e, chat)}
                key={index}
                className={`flex py-1.5 gap-x-2 min-w-[344px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                   rounded-lg px-2 mt-2 mb-1
               ${selectedChatId === `${chat.name}` ? "bg-(--color-gray-2)" : ""}`}
              >
                {chat.avatar ? (
                  <Image
                    className="h-15 w-15"
                    src={chat.avatar}
                    width={60}
                    height={60}
                    alt="Аватар"
                  />
                ) : (
                  <Image
                    className="h-15 w-15"
                    src="/avatar/avatar-8.png"
                    width={60}
                    height={60}
                    alt="Аватар"
                  />
                )}

                <div className="relative after:absolute after:left-0 after:right-0 after:bottom-[-10px] after:border-b after:border-1 after:border-(--color-button-disabled) after:z--1 w-full">
                  <div className="flex justify-between mb-1">
                    <div className="flex gap-x-1 h-[22px] ">
                      <p className="font-medium text‑lg leading-[1.2] truncate max-w-[165px]">
                        {chat.name}
                      </p>
                      {!chat.notifications && (
                        <div className="flex items-center">
                          <Image
                            className="w-4.5 h-4.5 "
                            src="/assets/icons/chat/no-sound.svg"
                            alt="Уведомления отключены"
                            width={18}
                            height={18}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-x-0.5 h-[22px]">
                      <div className="flex items-center">
                        {chat.new === true ? (
                          <Image
                            className="w-4.5 h-4.5"
                            src="/assets/icons/chat/unread.svg"
                            alt="Новое сообщение"
                            width={18}
                            height={18}
                          />
                        ) : chat.new === false ? (
                          <Image
                            className="w-4.5 h-4.5"
                            src="/assets/icons/chat/read.svg"
                            alt="Прочитано"
                            width={18}
                            height={18}
                          />
                        ) : (
                          <Image
                            className="w-4.5 h-4.5"
                            src="/assets/icons/chat/loading.svg"
                            alt="Загрузка"
                            width={18}
                            height={18}
                          />
                        )}
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%]">
                          {chat.time}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2">
                    {chat.content}
                  </p>
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
        <ContextMenu
          isOpen={openContextMenu}
          ref={popupRef}
          chats={chats}
          chatId={selectedChatId}
          position={menuPosition}
          onToggleNotifications={toggleNotifications}
          menuOffset={MENU_OFFSET}
        />
      </div>

      <div
        className="hidden md:flex justify-center text-center items-center w-full 
      max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg px-4"
      >
        <p className="text-(--color-gray) text-lg font-normal">
          Выберите контакт для начала общения
        </p>
      </div>
    </div>
  );
};

export default Chats;
