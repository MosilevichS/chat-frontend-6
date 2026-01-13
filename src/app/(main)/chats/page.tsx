"use client";

import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";
import createDesktop from "../../../assets/icons/create.svg";
import create2Desktop from "../../../assets/icons/create2.svg";
import createMobile from "../../../assets/icons/create-mobile.svg";
import channel from "../../../assets/icons/channel.svg";
import group from "../../../assets/icons/group.svg";
import ModalDropdown from "@/src/components/ui/modal/ModalDropdown";
import { useState } from "react";

const Chats = () => {
  const [isCreateButtonActive, setIsCreateButtonActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClick = () => {
    setIsCreateButtonActive(true);
    setIsModalOpen(true);
  };

  const handleCreateGroup = () => {
    console.log("Создать группу");
    setIsModalOpen(false);
    setIsCreateButtonActive(false);
  };

  const handleCreateChannel = () => {
    console.log("Создать канал");
    setIsModalOpen(false);
    setIsCreateButtonActive(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsCreateButtonActive(false), 150);
  };

  return (
    <div className="flex flex-row gap-x-6 w-full justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="flex gap-x-2 w-full relative">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск"
              type="search"
              className="placeholder:text-base placeholder:height-1.3 placeholder:font-normal border border-(--color-gray-1) pr-3 pl-11 pt-2.5 pb-2.5 md:pr-3 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px] w-full"
            />
            <Image
              src={search}
              alt="Поиск"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-[16px] md:w-[24px]"
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <button
            className="flex-shrink-0 w-[44px] h-[44px] bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200"
            aria-label="Создать чат"
            onClick={handleCreateClick}
          >
            <div className="md:hidden flex items-center justify-center mt-[2px]">
              <Image
                src={createMobile}
                alt="Создать"
                width={26}
                height={26}
                className="mr-[2px]"
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="hidden md:flex items-center justify-center">
              <Image
                src={isCreateButtonActive ? create2Desktop : createDesktop}
                alt="Создать"
                width={24}
                height={24}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </button>

          {isModalOpen && (
            <ModalDropdown onClose={handleCloseModal} className="md:right-0 right-4 top-full">
              <div className="w-[192px] h-[128px] md:w-[220px] md:h-[88px] bg-white rounded-lg border border-(--color-gray-1) shadow-lg overflow-hidden">
                <button
                  onClick={handleCreateGroup}
                  className="w-full h-1/2 md:h-[44px] bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between px-4 transition-colors"
                >
                  <span className="text-base font-normal text-gray-900">Создать группу</span>
                  <Image
                    src={group}
                    alt="Группа"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    style={{ width: "auto", height: "auto" }}
                  />
                </button>

                <div className="w-full h-px bg-(--color-gray-1)" />

                <button
                  onClick={handleCreateChannel}
                  className="w-full h-1/2 md:h-[44px] bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between px-4 transition-colors"
                >
                  <span className="text-base font-normal text-gray-900">Создать канал</span>
                  <Image
                    src={channel}
                    alt="Канал"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                    style={{ width: "auto", height: "auto" }}
                  />
                </button>
              </div>
            </ModalDropdown>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Image
              src="/avatar/avatar.png"
              width={60}
              height={60}
              alt="Фото"
              className="rounded-full"
              style={{ width: "auto", height: "auto" }}
            />
            <div>
              <p className="font-medium">Влад Ляшев</p>
              <p className="text-(--color-gray) text-sm">Привет, Владик!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4">
        <p className="text-(--color-gray) text-lg font-normal">
          Выберите контакт для начала общения
        </p>
      </div>
    </div>
  );
};

export default Chats;
