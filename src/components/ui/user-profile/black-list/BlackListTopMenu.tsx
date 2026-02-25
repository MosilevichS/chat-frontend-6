import React from "react";
import Link from "next/link";
import backIcon from "@/assets/icons/back-icon.svg";
import Image from "next/image";

export const BlackListTopMenu = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href="/settings" className="p-2 -ml-2">
        <Image src={backIcon} width={24} height={24} alt="Назад" />
      </Link>
      <h2 className="text-[1.125rem] font-medium text-[var(--color-black)]">
        Обращение в поддержку
      </h2>
      <button className="kebab-button" onClick={() => {}}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="19" r="2" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
};
