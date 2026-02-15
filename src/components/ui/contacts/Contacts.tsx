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
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

import arrowLeft from "../../../assets/icons/arrow-left.svg";
import cancel from "../../../assets/icons/cancel.svg";
import close from "../../../assets/icons/close.svg";
import deleteGray from "../../../assets/icons/delete-gray.svg";
import deleteViolet from "../../../assets/icons/delete-violet.svg";
import forwardMessage from "../../../assets/icons/forward-message.svg";
import phoneBook from "../../../assets/icons/phone-book.svg";
import deleteContacts from "../../../assets/icons/delete_outline.svg";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useMediaQuery();

  const {
    data,
    isLoading,
  }: {
    data?: { results: IContact[] };
    isLoading: boolean;
    error?: unknown;
  } = useGetContactsQuery();

  const [deleteContact] = useDeleteContactMutation();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: users } = useGetUsersListQuery(
    debouncedSearchQuery ? [{ phone_or_nickname: debouncedSearchQuery }] : [],
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
    const container = containerRef.current;
    if (!container) return;

    let high;

    // проверяет, превышает ли высота контента контейнер прокрутки
    const isContentTall = () => {
      const viewportHeight = window.innerHeight;
      // высота контейнера прокрутки
      const threshold = isMobile
        ? viewportHeight - 200
        : viewportHeight - 204 - (selectedContactIds.length > 0 ? 76 : 0);

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
      await deleteContact({
        contact_uids: selectedContactIds,
      }).unwrap();
    } catch (err) {
      console.error("Ошибка:", err);
    }

    setSelectedContactIds([]);
    setEditing(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-84px)] md:min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
        <div className="relative w-full p-4 h-[80px]">
          <Input
            onChange={e => {
              setSearchQuery(e.target.value);
              setSelectedContactIds([]);
            }}
            value={searchQuery}
            placeholder="Поиск"
            type="text"
            pattern=".*"
            className="placeholder:text-base placeholder:height-1.3; placeholder:font-normal border border-(--color-gray-1) 
            pr-11 pl-11 pt-2.5 pb-2.5 md:pr-11 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <Image
                src={close}
                alt="Очистить"
                width={24}
                height={24}
                className="absolute right-7  top-8.5 md:top-8 w-[20px] md:w-[24px]"
              />
            </button>
          )}
          <Image
            src={search}
            alt="Поиск"
            className="absolute left-7 top-8.5 md:top-8 w-[20px] md:w-[24px]"
          />
        </div>

        {filteredContacts.length > 0 &&
          (!editing ? (
            filteredContacts.length > 0 && (
              <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
                <p className="text-sm font-normal leading-[1.2]">Мои контакты</p>
                <button className="cursor-pointer " onClick={handleDeleteContacts}>
                  {isMobile ? (
                    <p className="text-(--color-violet) font-normal">Выбрать</p>
                  ) : (
                    <Image
                      src={deleteGray}
                      alt="Удалить"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px]"
                    />
                  )}
                </button>
              </div>
            )
          ) : (
            <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) px-4">
              <div className="flex gap-x-2">
                <button className="cursor-pointer" onClick={cancelDeleteContacts}>
                  <Image
                    src={arrowLeft}
                    alt="Отменить"
                    width={24}
                    height={24}
                    className="w-[24px] h-[24px]"
                  />
                </button>
                <p className="font-medium">{isMobile ? "Мои контакты" : "Удалить контакты"}</p>
              </div>
              {selectedContactIds.length > 0 ? (
                isMobile ? (
                  <p className="text-(--color-violet) font-normal">Выбрать</p>
                ) : (
                  <button className="cursor-pointer" onClick={cancelDeletion}>
                    <Image
                      src={cancel}
                      alt="Отменить"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px]"
                    />
                  </button>
                )
              ) : (
                <button className="cursor-default!">
                  {isMobile ? (
                    <p className="text-(--color-violet) font-normal">Выбрать</p>
                  ) : (
                    <Image
                      src={deleteViolet}
                      alt="Удалить"
                      width={24}
                      height={24}
                      className="w-[24px] h-[24px]"
                    />
                  )}
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
          className={`w-full overflow-y-auto h-[calc(100vh-200px)] 
           ${selectedContactIds.length > 0 ? "md:h-[calc(100vh-206px-76px)]" : "md:h-[calc(100vh-206px)]"} scroll-custom pl-2 pr-1.5`}
        >
          {isLoading && <Loader text="контактов" className="pt-40" />}

          {filteredContacts.length > 0 &&
            filteredContacts.map(contact => (
              <ContactItem
                key={contact.uid}
                contact={contact}
                isSelected={selectedContactIds.includes(contact.uid)}
                isEditing={editing}
                onSelect={toggleContactSelection}
                isToggleButtonVisible
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
                  src={phoneBook}
                  alt="Список контактов пока пуст"
                  width={200}
                  height={200}
                  loading="eager"
                />
                <p className="text-lg">Список контактов пока пуст</p>
              </div>
            )}

          {searchQuery &&
            filteredContacts.length > 0 &&
            users !== undefined &&
            users.length > 0 && (
              <div className="flex justify-between items-center h-[36px] bg-(--color-gray-2) -mx-1.5 px-4">
                <p className="text-sm font-normal leading-[1.2]">Пользователи А-Чата</p>
              </div>
            )}

          {searchQuery && users !== undefined && users.length > 0 && (
            <div>
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
                  isToggleButtonVisible={false}
                />
              ))}
            </div>
          )}
          {searchQuery &&
            filteredContacts.length === 0 &&
            users !== undefined &&
            users.length === 0 && <NotFound />}
        </div>

        {selectedContactIds.length > 0 &&
          (isMobile ? (
            <div className="fixed bottom-0 z-20 flex justify-between w-full h-[84px]  bg-(--color-gray-1) pb-4 px-4">
              <div className="flex items-center gap-x-5">
                <button onClick={() => cancelDeletion()}>
                  <Image src={close} alt="Очистить" width={24} height={24} className=" w-[24px]" />
                </button>
                <p className="font-medium">
                  {`Выбрано ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"], 1)}`}
                </p>
              </div>
              <div className="flex gap-x-7">
                <button>
                  <Image
                    src={forwardMessage}
                    alt="Переслать"
                    width={24}
                    height={24}
                    className=" w-[24px]"
                  />
                </button>
                <button onClick={() => openModal()}>
                  <Image
                    src={deleteContacts}
                    alt="Удалить"
                    width={24}
                    height={24}
                    className=" w-[24px]"
                  />
                </button>
              </div>
            </div>
          ) : (
            <button
              className="flex items-start justify-center w-full h-[76px] font-normal text-(--color-error) bg-(--color-gray-1) md:rounded-b-lg pt-2"
              onClick={() => openModal()}
            >
              {`Удалить ${selectedContactIds.length} ${declension(selectedContactIds.length, ["контакт", "контакта", "контактов"], 1)}`}
            </button>
          ))}
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
