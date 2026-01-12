"use client";

import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";
import create from "../../../assets/icons/create.svg";
import create2 from "../../../assets/icons/create2.svg";
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
  };

  const handleCreateChannel = () => {
    console.log("Создать канал");
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsCreateButtonActive(false), 100);
  };

  return (
    <div className="flex flex-row gap-x-6 w-full justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4 relative">
        <div className="flex gap-x-4 md:gap-x-2 w-full">
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
            />
          </div>
          
          {/* Кнопка Create */}
          <button 
            className="flex-shrink-0 w-[44px] h-[44px] bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200"
            aria-label="Создать чат"
            onClick={handleCreateClick}
          >
            <Image
              src={isCreateButtonActive ? create2 : create}
              alt="Создать"
              width={24}
              height={24}
              className="w-6 h-6"
            />
          </button>
        </div>

        {/* Модальное окно с кнопками */}
        {isModalOpen && (
          <ModalDropdown 
            onClose={handleCloseModal}
            className="right-4 md:right-6 mt-2"
          >
            <div className="w-[192px] h-[128px] md:w-[220px] md:h-[88px] bg-white rounded-lg border border-(--color-gray-1) shadow-lg overflow-hidden">
              {/* Кнопка "Создать группу" с иконкой */}
              <button
                onClick={handleCreateGroup}
                className="w-full h-1/2 bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center w-full justify-between px-[25px] md:px-[10px]">
                  <span className="text-base font-normal text-gray-900">
                    Создать группу
                  </span>
                  <div className="w-6 h-6">
                    <Image
                      src={group}
                      alt="Группа"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </button>
              
              <div className="w-full h-px bg-(--color-gray-1)" />
              
              {/* Кнопка "Создать канал" с иконкой */}
              <button
                onClick={handleCreateChannel}
                className="w-full h-1/2 bg-transparent hover:bg-gray-50 active:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center w-full justify-between px-[25px] md:px-[10px]">
                  <span className="text-base font-normal text-gray-900">
                    Создать канал
                  </span>
                  <div className="w-6 h-6">
                    <Image
                      src={channel}
                      alt="Канал"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </button>
            </div>
          </ModalDropdown>
        )}
        
        <div className="mt-4">
          <div className="flex items-center gap-x-3 p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
            <Image src="/avatar/avatar.png" width={60} height={60} alt="Фото" className="rounded-full" />
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