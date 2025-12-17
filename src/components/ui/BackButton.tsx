"use client";

import Link from "next/link";
import Image from "next/image";
import backIcon from "../../assets/icons/back-icon.svg";

interface IBackButton {
  href: string;
  ariaLabel?: string;
  className?: string;
}

const BackButton = ({ href, ariaLabel = "Вернуться назад", className = "" }: IBackButton) => {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`
        inline-flex items-center justify-center
        rounded-full
        transition-all duration-300
        w-11 h-11
        md:w-8 md:h-8
        hover:shadow-lg
        focus:shadow-xl
        ${className}
      `}
    >
      <Image
        src={backIcon}
        alt="Назад"
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
      />
    </Link>
  );
};

export default BackButton;
