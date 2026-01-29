"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import type { IContact } from "@/src/types/contact";

import Input from "@/src/components/ui/Input";
import search from "../../../assets/icons/search.svg";
import ModalDeleteContacts from "./ModalDeleteContacts";
import Loader from "@/src/components/ui/Loader";
import NotFound from "../NotFound";
import ContactItem from "./ContactItem";

import { declension } from "@/src/utils/declension";
import { useDebounce } from "@/src/hooks/useDebounce";

import {
  useDeleteContactMutation,
  useGetContactsQuery,
  useGetUsersListQuery,
} from "@/src/services/contactApi";

const Contacts = () => {
  // const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    // error,
  }: {
    data?: { results: IContact[] };
    isLoading: boolean;
    error?: unknown;
  } = useGetContactsQuery();

  const [deleteContact, { isLoading: isDeleteLoading }] = useDeleteContactMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: users } = useGetUsersListQuery(
    debouncedQuery ? [{ phone_or_nickname: debouncedSearchQuery }] : [],
  );

  const filteredContacts = useMemo(() => {
    const allContacts = data?.results || [];
    if (!searchQuery) return allContacts;

    return allContacts.filter(contact => {
      const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();

      return fullName.includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let high;

    // Функция: проверить, превышает ли высота контента 100vh − 165px
    const isContentTall = () => {
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight - 165 - 36 - (selectedContactIds.length > 0 ? 76 : 0);
      return container.scrollHeight > threshold;
    };

    if (isContentTall()) {
      high = true;
    } else {
      high = false;
    }

    if (!high) {
      container.style.paddingRight = "6px";
    }

    if (high) {
      container.style.paddingRight = "0px";
    }

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
  }, [selectedContactIds.length]);

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

  return (
    <>
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
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

        {filteredContacts.length > 0 &&
          (!editing ? (
            filteredContacts.length > 0 && (
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
          ))}

        {filteredContacts.length === 0 && users !== undefined && users.length > 0 && (
          <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
            <p className="text-sm font-normal leading-[1.2]">Пользователи А-Чата</p>
          </div>
        )}

        <div
          ref={containerRef}
          className={`w-full overflow-y-auto ${selectedContactIds.length > 0 ? "h-[calc(100vh-201px-76px)]" : "h-[calc(100vh-201px)]"} 
           ${selectedContactIds.length > 0 ? "md:h-[calc(100vh-206px-76px)]" : "md:h-[calc(100vh-206px)]"} scroll-custom pl-2 pr-1.5`}
        >
          {(isLoading || isDeleteLoading) && <Loader text="контактов" className="pt-40" />}

          {filteredContacts.length > 0 &&
            filteredContacts.map(contact => (
              <ContactItem
                key={contact.uid}
                contact={contact}
                isSelected={selectedContactIds.includes(contact.uid)}
                isEditing={editing}
                onSelect={toggleContactSelection}
              />
            ))}

          {!isLoading &&
            !searchQuery &&
            filteredContacts.length === 0 &&
            users !== undefined &&
            users.length === 0 && (
              <div className="flex flex-col items-center mt-45 text-center text-(--color-gray) font-normal">
                <Image
                  className="mb-6"
                  src="/images/phone-book.svg"
                  alt="Список контактов пока пуст"
                  width={200}
                  height={200}
                  loading="eager"
                />
                <p className="text-lg">Список контактов пока пуст</p>
              </div>
            )}

          {filteredContacts.length > 0 && users !== undefined && users.length > 0 && (
            <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) -mx-1.5 px-4">
              <p className="text-sm font-normal leading-[1.2]">Пользователи А-Чата</p>
            </div>
          )}
          {searchQuery && users !== undefined && users.length > 0 && (
            <div className="mt-4">
              {users.map(user => (
                <ContactItem
                  key={user.uid}
                  contact={{
                    uid: user.uid,
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    system_contact: {
                      uid: user.uid,
                      avatar_url: user.avatar_url,
                      is_online: user.is_online,
                      was_online_at: user.was_online_at,
                    },
                  }}
                  isSelected={selectedContactIds.includes(user.uid)}
                  isEditing={editing}
                  onSelect={toggleContactSelection}
                />
              ))}
            </div>
          )}
          {searchQuery &&
            filteredContacts.length === 0 &&
            users !== undefined &&
            users.length === 0 && <NotFound />}
        </div>

        {selectedContactIds.length > 0 && (
          <button
            className="flex items-start justify-center w-full h-[76px] font-normal text-(--color-error) bg-(--color-gray-1) md:rounded-b-lg pt-2"
            onClick={() => openModal()}
          >
            {`Удалить ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"], 1)}`}
          </button>
        )}
      </div>

      <ModalDeleteContacts
        isOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        handleConfirm={handleConfirm}
        selectedContactIds={selectedContactIds}
      />
    </>
  );
};

export default Contacts;
