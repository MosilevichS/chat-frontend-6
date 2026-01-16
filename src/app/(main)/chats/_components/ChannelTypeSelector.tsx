"use client";

import { useState } from "react";
import Image from "next/image";
import Radio from "@/src/components/ui/Radio";
import upDownIcon from "../../../../assets/icons/up-down.svg";

interface IChannelTypeSelector {
  value: "public" | "private";
  onChange: (value: "public" | "private") => void;
}

const ChannelTypeSelector = ({ value, onChange }: IChannelTypeSelector) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRadioChange = (type: "public" | "private") => {
    onChange(type);
    setIsExpanded(false);
  };

  const getTypeLabel = () => {
    return value === "public" ? "Публичный" : "Частный";
  };

  return (
    <>
      {/* Мобильная версия - всегда видимый блок с радиокнопками */}
      <div className="md:hidden w-full">
        <div className="text-base font-normal text-gray-900 mb-4">Тип канала</div>

        <div className="border border-(--color-gray-1) rounded-lg overflow-hidden bg-white">
          <Radio
            label="Публичный"
            description="Публичный канал можно найти через поиск. Подписаться на него может любой пользователь."
            checked={value === "public"}
            onChange={() => onChange("public")}
            name="channelTypeMobile"
            value="public"
            className="border-b border-(--color-gray-1)"
          />

          <Radio
            label="Частный"
            description="В частный канал можно попасть только по приглашению или пригласительной ссылке."
            checked={value === "private"}
            onChange={() => onChange("private")}
            name="channelTypeMobile"
            value="private"
          />
        </div>
      </div>

      {/* Десктоп версия - раскрывающийся блок */}
      <div className="hidden md:block w-full">
        <div className="text-base font-normal text-gray-900 mb-4">Тип канала</div>

        {/* Поле с текущим типом и кнопкой */}
        <div
          className="w-full border border-(--color-gray-1) rounded-lg overflow-hidden bg-white cursor-pointer hover:bg-gray-50"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between h-[44px] px-4">
            <span className="text-base font-normal text-gray-900">{getTypeLabel()}</span>
            <Image
              src={upDownIcon}
              alt="Развернуть"
              width={20}
              height={20}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Раскрывающийся блок с радиокнопками */}
        {isExpanded && (
          <div className="mt-2 border border-(--color-gray-1) rounded-lg overflow-hidden bg-white">
            <Radio
              label="Публичный"
              description="Публичный канал можно найти через поиск. Подписаться на него может любой пользователь."
              checked={value === "public"}
              onChange={() => handleRadioChange("public")}
              name="channelTypeDesktop"
              value="public"
              className="border-b border-(--color-gray-1)"
            />

            <Radio
              label="Частный"
              description="В частный канал можно попасть только по приглашению или пригласительной ссылке."
              checked={value === "private"}
              onChange={() => handleRadioChange("private")}
              name="channelTypeDesktop"
              value="private"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelTypeSelector;
