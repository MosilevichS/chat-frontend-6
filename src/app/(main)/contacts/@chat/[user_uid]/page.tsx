"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

import call from "@/src/assets/icons/call.svg";
import search from "@/src/assets/icons/search-messages.svg";
import noMessages from "@/src/assets/icons/no-messages.svg";
import { useGetContactByIdQuery } from "@/src/services/contactApi";
import { timeFormat } from "@/src/utils/timeFormat";

export default function Page() {
  const { user_uid } = useParams<{ user_uid: string }>();

  const { data, isLoading, isError } = useGetContactByIdQuery(user_uid);
  console.log("Contact data:", data);
  if (isLoading)
    return (
      <div className="hidden md:flex w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        Загрузка...
      </div>
    );
  if (isError || !data)
    return (
      <div className="hidden md:flex w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        Контакт не найден
      </div>
    );

  return (
    <div className="hidden md:flex flex-col w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg md:rounded-lg border border-(--color-gray-1)">
      <header className="px-4 w-full flex justify-between items-center h-[60px] bg-(--color-gray-light) border-b border-(--color-gray-3)">
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
      <main className="h-full flex flex-col items-center justify-center">
        <Image src={noMessages} alt="Нет сообщений" width={200} height={200} className="mb-6" />
        <p className="text-(--color-gray) text-lg leading-[130%]">Сообщений пока нет</p>
        <p className="text-(--color-gray) text-sm leading-[120%]">Напишите первым :)</p>
      </main>
      <footer className="h-[60px] bg-(--color-gray-light) border-t border-(--color-gray-3)"></footer>
    </div>
  );
}
