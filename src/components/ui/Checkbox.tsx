"use client";

import Image from "next/image";
import checkboxDone from "../../assets/icons/checkbox-done.svg";

interface ICheckbox {
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
  className?: string;
}

const Checkbox = ({ checked, onChange, name, value, className = "" }: ICheckbox) => {
  const handleClick = () => {
    onChange();
  };

  return (
    <div
      className={`flex items-center justify-center w-6 h-6 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Незаполненное состояние - только обводка */}
      {!checked && <div className="w-6 h-6 rounded-full border-2 border-(--color-violet)"></div>}

      {/* Заполненное состояние - SVG иконка (24x24) */}
      {checked && (
        <Image
          src={checkboxDone}
          alt="Выбрано"
          width={24}
          height={24}
          className="text-(--color-violet)"
        />
      )}

      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="absolute opacity-0 w-0 h-0"
      />
    </div>
  );
};

export default Checkbox;
