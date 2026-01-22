"use client";

import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";
import { useEffect, useMemo, useRef, useState } from "react";
// import { chatsList } from "@/src/data/chats";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalConfirm from "@/src/components/ui/modal/ModalConfirm";
import { declension } from "@/src/utils/declension";
import {
  useAddContactByPhoneMutation,
  useDeleteContactMutation,
  useGetContactsQuery,
  useGetUsersListQuery,
} from "@/src/services/contactApi";
import { Loader } from "@/src/components/ui/Loader";
import { timeFormat } from "@/src/utils/timeFormat";
import type { IContact } from "@/src/types/contact";

const Page = () => {
  // const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    error,
  }: {
    data?: { results: IContact[] };
    isLoading: boolean;
    error?: unknown;
  } = useGetContactsQuery();
  const [addContactByPhone] = useAddContactByPhoneMutation();
  const [deleteContact] = useDeleteContactMutation();
  // const { users, isSuccess } = useGetUsersListQuery([
  //   {
  //     phone_or_nickname: "+77056122436",
  //   },
  // ]);
  const handleAddContact = async () => {
    try {
      const result = await addContactByPhone({
        phone: "+78888888888",
      }).unwrap();
      console.log("Контакт добавлен:", result);
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  const contacts = useMemo(() => {
    return data?.results || [];
  }, [data]);

  console.log(data?.results || "Данные не загружены", error || "Нет ошибок");
  // console.log(users);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Функция: проверить, превышает ли высота контента 100vh − 165px
    const isContentTall = () => {
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight - 165 - 36 - (selectedContactIds.length > 0 ? 76 : 0);
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
  }, [selectedContactIds.length, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteContacts = () => {
    setEditing(true);
  };

  const cancelDeleteContacts = () => {
    setEditing(false);
    setSelectedContactIds([]);
  };

  const cancelDeletion = () => {
    setSelectedContactIds([]);
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id],
    );
    console.log(selectedContactIds);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async () => {
    try {
      const result = await deleteContact({
        contact_uids: selectedContactIds,
      }).unwrap();
      console.log("Контакт(ы) удален(ы):", result);
    } catch (err) {
      console.error("Ошибка:", err);
    }

    setSelectedContactIds([]);
    setEditing(false);
    setIsModalOpen(false);
  };

  // const filteredChats = contacts.filter(contact =>
  //   contact.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  // );

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
        {!editing ? (
          contacts.length > 0 && (
            <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
              <p className="text-sm font-normal leading-[1.2]">Контакты пользователей А-чата</p>
              <button className="cursor-pointer" onClick={handleDeleteContacts}>
                <Image
                  src="/assets/icons/contacts/delete-gray.svg"
                  alt="Удалить"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </button>
            </div>
          )
        ) : (
          <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
            <div className="flex gap-x-2">
              <button className="cursor-pointer" onClick={cancelDeleteContacts}>
                <Image
                  src="/assets/icons/contacts/arrow-left.svg"
                  alt="Отменить"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </button>
              <p className="font-medium">Удалить контакты</p>
            </div>
            {selectedContactIds.length > 0 ? (
              <button className="cursor-pointer" onClick={cancelDeletion}>
                <Image
                  src="/assets/icons/contacts/cancel.svg"
                  alt="Отменить"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </button>
            ) : (
              <button className="cursor-default!">
                <Image
                  src="/assets/icons/contacts/delete-violet.svg"
                  alt="Удалить"
                  width={24}
                  height={24}
                  className="w-[24px] h-[24px]"
                />
              </button>
            )}
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full overflow-y-auto ${selectedContactIds.length > 0 ? "h-[calc(100vh-201px-76px)]" : "h-[calc(100vh-201px)]"}  ${selectedContactIds.length > 0 ? "md:h-[calc(100vh-206px-76px)]" : "md:h-[calc(100vh-206px)]"} scroll-custom px-2`}
        >
          {isLoading ? (
            <Loader text="контактов" className="pt-40" />
          ) : contacts.length > 0 ? (
            contacts.map(contact => (
              <div
                key={contact.uid}
                className={`flex items-center py-1.5 gap-x-2.5 min-w-[344px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                   rounded-lg px-2 mt-2 mb-1
               ${selectedContactIds.includes(contact.uid) ? "bg-(--color-violet-1) hover:bg-(--color-violet-2)" : ""}`}
              >
                {contact.system_contact.avatar_url ? (
                  <div className="min-w-10 min-h-10 w-10! h-10!  rounded-full overflow-hidden">
                    <Image
                      src={contact.system_contact.avatar_url}
                      alt="Аватар"
                      width={40}
                      height={40}
                      className="object-fill w-full h-full"
                      priority
                    />
                  </div>
                ) : (
                  <Image
                    className="h-10 w-10"
                    src="/avatar/avatar-8.png"
                    width={40}
                    height={40}
                    alt="Аватар"
                  />
                )}
                <div className="flex justify-between relative after:absolute after:left-0 after:right-0 after:bottom-[-22px] after:border-b after:border-1 after:border-(--color-button-disabled) after:z--1 w-full">
                  <div>
                    <p className="font-medium text‑lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.system_contact.is_online ? (
                      <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2">
                        в сети
                      </p>
                    ) : (
                      <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2">
                        был(а) {timeFormat(contact.system_contact.was_online_at * 1000)}
                      </p>
                    )}
                  </div>
                  {editing &&
                    (selectedContactIds.includes(contact.uid) ? (
                      <button
                        className="cursor-pointer"
                        onClick={() => toggleContactSelection(contact.uid)}
                      >
                        <Image
                          src="/assets/icons/contacts/checkbox-true.svg"
                          alt="Выбрано"
                          width={24}
                          height={24}
                          className="w-[24px] h-[24px]"
                        />
                      </button>
                    ) : (
                      <button
                        className="cursor-pointer"
                        onClick={() => toggleContactSelection(contact.uid)}
                      >
                        <Image
                          src="/assets/icons/contacts/checkbox.svg"
                          alt="Выбрать"
                          width={20}
                          height={20}
                          className="w-[20px] h-[20px]"
                        />
                      </button>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
              <Image
                className="mb-6"
                src="/images/phone-book.png"
                alt="Список контактов пока пуст"
                loading="eager"
                width={200}
                height={200}
              />
              <p className="text-lg">Список контактов пока пуст</p>
            </div>
          )}
        </div>
        {selectedContactIds.length > 0 && (
          <button
            className="flex items-start justify-center w-full h-[76px] font-normal text-(--color-error) bg-(--color-gray-1) md:rounded-b-lg pt-2"
            onClick={() => openModal()}
          >
            {`Удалить ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"])}`}
          </button>
        )}
      </div>

      <div
        className="hidden md:flex justify-center text-center items-center w-full 
      max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4"
      >
        <p className="text-(--color-gray) text-lg font-normal">
          Выберите контакт для начала общения
        </p>
        <button onClick={handleAddContact}>Добавить</button>
      </div>

      {isModalOpen && (
        <ModalBase onClose={handleCloseModal}>
          <ModalConfirm
            onClose={handleCloseModal}
            onConfirm={handleConfirm}
            title="Удалить контакты"
            message={
              selectedContactIds.length === 1
                ? "Вы уверены, что хотите удалить контакт?"
                : `Вы уверены, что хотите удалить ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"])}?`
            }
            confirmText="Удалить"
            cancelText="Отмена"
          />
        </ModalBase>
      )}
    </div>
  );
};

export default Page;
