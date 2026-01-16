"use client";

import { useState } from "react";
import Image from "next/image";
import Radio from "@/src/components/ui/Radio";
import upDownIcon from "../../../../assets/icons/up-down.svg";

interface IGroupTypeSelector {
  value: "closed" | "open";
  onChange: (value: "closed" | "open") => void;
}

const GroupTypeSelector = ({ value, onChange }: IGroupTypeSelector) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRadioChange = (type: "closed" | "open") => {
    onChange(type);
    setIsExpanded(false);
  };

  const getTypeLabel = () => {
    return value === "closed" ? "Закрытая" : "Открытая";
  };

  return (
    <>
      {/* Мобильная версия - всегда видимый блок с радиокнопками */}
      <div className="md:hidden w-full">
        <div className="text-base font-normal text-gray-900 mb-4">Тип группы</div>

        <div className="border border-(--color-gray-1) rounded-lg overflow-hidden bg-white">
          <Radio
            label="Закрытая"
            description="В закрытую группу можно попасть только по приглашению или пригласительной ссылке."
            checked={value === "closed"}
            onChange={() => onChange("closed")}
            name="groupTypeMobile"
            value="closed"
            className="border-b border-(--color-gray-1)"
          />

          <Radio
            label="Открытая"
            description="Открытую группу можно найти через поиск. Присоединиться к ней может любой пользователь."
            checked={value === "open"}
            onChange={() => onChange("open")}
            name="groupTypeMobile"
            value="open"
          />
        </div>
      </div>

      {/* Десктоп версия - раскрывающийся блок */}
      <div className="hidden md:block w-full">
        <div className="text-base font-normal text-gray-900 mb-4">Тип группы</div>

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
              label="Закрытая"
              description="В закрытую группу можно попасть только по приглашению или пригласительной ссылке."
              checked={value === "closed"}
              onChange={() => handleRadioChange("closed")}
              name="groupTypeDesktop"
              value="closed"
              className="border-b border-(--color-gray-1)"
            />

            <Radio
              label="Открытая"
              description="Открытую группу можно найти через поиск. Присоединиться к ней может любой пользователь."
              checked={value === "open"}
              onChange={() => handleRadioChange("open")}
              name="groupTypeDesktop"
              value="open"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default GroupTypeSelector;
