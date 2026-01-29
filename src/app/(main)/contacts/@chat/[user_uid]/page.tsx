"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import call from "@/src/assets/icons/call.svg";
import search from "@/src/assets/icons/search-messages.svg";
import noMessages from "@/src/assets/icons/no-messages.svg";
import clip from "@/src/assets/icons/clip.svg";
import close from "@/src/assets/icons/close.svg";
import closePurple from "@/src/assets/icons/close-purple.svg";
import microphone from "@/src/assets/icons/microphone.svg";
import sendMessageIcon from "@/src/assets/icons/send-message.svg";

import type { IContact } from "@/src/types/contact";
import type { IMessage } from "@/src/types/message";

import Loader from "@/src/components/ui/Loader";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalSuccess from "@/src/components/ui/modal/ModalSuccess";

import { timeFormat } from "@/src/utils/timeFormat";
import { useGetContactByIdQuery } from "@/src/services/contactApi";
import { useGetContactsQuery, useAddContactByPhoneMutation } from "@/src/services/contactApi";
import { useGetProfileQuery } from "@/src/services/userApi";

export default function Page() {
  // WebSocket и сообщения
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState("");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;

    async function connectWebSocket() {
      const accessToken = await fetch("/api/get-token")
        .then(res => res.json())
        .then(data => data.token);

      ws = new WebSocket(`ws://localhost:3001/ws/chat?authorization=${accessToken}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
      };

      ws.onmessage = event => {
        const data = JSON.parse(event.data);
        console.log("Received:", data);

        setMessages(prevMessages => [...prevMessages, data]);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
      };
    }

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current?.send(
      JSON.stringify({
        action: "create_text_message",
        request_uid: profile?.uid,
        object: {
          to_user_uid: user_uid,
          content: inputValue.trim(),
        },
      }),
    );

    setInputValue("");
  };

  // Контакт и профиль
  const { user_uid } = useParams<{ user_uid: string }>();
  const [addContactByPhone] = useAddContactByPhoneMutation();

  const [isBannerHidden, setBannerHidden] = useState(false);
  const [isBannerClosing, setBannerClosing] = useState(false);

  const [isProfileOpen, setProfileOpen] = useState(false);

  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);

  // Проверка есть ли пользователь в списке контактов
  const { data: contactsData } = useGetContactsQuery();

  const contacts = contactsData?.results;

  const isInContacts = contacts?.some(
    (contact: IContact) => contact.system_contact.uid === user_uid,
  );

  // Получение данных профиля
  const { data: profileData } = useGetProfileQuery();
  const profile = profileData;

  // Получение контакта по uid
  const { data, isLoading, isError } = useGetContactByIdQuery(user_uid);

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        <Loader />
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        Ошибка загрузки пользователя.
      </div>
    );

  // Добавление контакта по номеру телефона

  const handleAddContact = async (phone_number: string) => {
    try {
      await addContactByPhone({ phone: phone_number }).unwrap();
      setModalSuccessOpen(true);
    } catch (error) {
      console.error("Ошибка при добавлении контакта:", error);
    }
  };

  return (
    <>
      <div className="md:flex w-full overflow-hidden">
        <div className="relative flex flex-col w-full h-screen md:h-full max-w-[744px] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1)">
          <header
            className="px-4 w-full flex justify-between items-center h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3) z-30 cursor-pointer"
            onClick={() => setProfileOpen(true)}
          >
            <div className="flex gap-3">
              {data.avatar_url ? (
                <Image
                  src={data.avatar_url}
                  alt="Аватар"
                  width={40}
                  height={40}
                  className="rounded-full"
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

              <div>
                <p className="font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                  {data.first_name} {data.last_name}
                </p>
                {data.is_online ? (
                  <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2">
                    в сети
                  </p>
                ) : (
                  <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2">
                    был(а) {timeFormat(data.was_online_at * 1000)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-x-3">
              <button aria-label="Поиск">
                <Image src={search} alt="Поиск" width={36} height={36} />
              </button>
              <button aria-label="Звонок">
                <Image src={call} alt="Звонок" width={36} height={36} />
              </button>
            </div>
          </header>

          {!isInContacts && !isBannerHidden && (
            <div
              className={`h-[44px] w-full px-4 flex items-center bg-(--color-gray-light) border-b border-(--color-gray-3) 
                absolute top-[60px] left-0 right-0 z-20
                transition-transform duration-300 ease-in-out ${isBannerClosing ? "translate-y-[-100%]" : "translate-y-0"}`}
            >
              <div className="flex gap-1 w-full">
                <div className="flex justify-center w-full max-w-[340px]">
                  <button
                    className="text-(--color-violet) active:text-(--color-violet-light)"
                    onClick={() => {
                      setBannerClosing(true);
                      setTimeout(() => setBannerHidden(true), 300);
                      handleAddContact(data.username);
                    }}
                  >
                    Добавить в контакты
                  </button>
                </div>
                <div className="flex justify-center w-full max-w-[340px]">
                  <button className="text-(--color-error) active:opacity-20">Заблокировать</button>
                </div>
              </div>
              <button
                onClick={() => {
                  setBannerClosing(true);
                  setTimeout(() => setBannerHidden(true), 300);
                }}
                aria-label="Закрыть"
              >
                <Image src={close} alt="Закрыть" width={24} height={24} />
              </button>
            </div>
          )}

          <main className="flex flex-1 flex-col items-center justify-center">
            {messages.length > 0 ? (
              messages.map((message, i) => (
                <div key={i} className="mb-4 px-4 w-full max-w-[624px]">
                  <div className="bg-white py-2 px-3 rounded-lg shadow-md max-w-[80%]">
                    <p className="text-(--color-black)">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <Image
                  src={noMessages}
                  alt="Нет сообщений"
                  width={200}
                  height={200}
                  className="mb-6"
                  loading="eager"
                />
                <p className="text-(--color-gray) text-lg leading-[130%]">Сообщений пока нет</p>
                <p className="text-(--color-gray) text-sm leading-[120%]">Напишите первым :)</p>
              </>
            )}
          </main>

          <footer className="flex items-center px-4 w-full h-[60px] bg-(--color-gray-light) rounded-b-lg border-t border-(--color-gray-3)">
            <form className="flex justify-between items-center gap-2 w-full">
              <button>
                <Image src={clip} alt="Прикрепить файл" width={36} height={36} />
              </button>
              <input
                type="text"
                placeholder="Сообщение"
                className="outline-none bg-white rounded-[1.25rem] py-2 pl-3 pr-10 w-full max-w-[624px]"
                onChange={e => setInputValue(e.target.value)}
                value={inputValue}
              />
              <button type="button" onClick={sendMessage}>
                {inputValue.trim() ? (
                  <Image src={sendMessageIcon} alt="Микрофон" width={36} height={36} />
                ) : (
                  <Image src={microphone} alt="Микрофон" width={36} height={36} />
                )}
              </button>
            </form>
          </footer>
        </div>

        <aside
          className={`h-full bg-(--color-gray-light-opacity) rounded-lg border-1 border-(--color-gray-1) transition-all duration-500 ease-in-out
            ${isProfileOpen ? "w-full max-w-[360px] ml-6 opacity-100" : "w-0 opacity-0"}
            `}
        >
          {isProfileOpen && (
            <div className="w-full max-w-[360px] h-full">
              <header className="px-4 w-full flex items-center h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3)">
                <button onClick={() => setProfileOpen(false)} aria-label="Закрыть">
                  <Image src={closePurple} alt="Закрыть" width={24} height={24} className="mr-3" />
                </button>
                <h2 className="text-lg font-medium leading-[120%]">Информация</h2>
              </header>
            </div>
          )}
        </aside>
      </div>

      {isModalSuccessOpen && (
        <ModalBase onClose={() => setModalSuccessOpen(false)}>
          <ModalSuccess
            name={`${data.first_name} ${data.last_name}`}
            text="теперь в списке ваших контактов"
          />
        </ModalBase>
      )}
    </>
  );
}
