"use client";

import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <div
      className="hidden md:flex justify-center text-center items-center w-full 
      max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4"
    >
      <p className="text-(--color-gray) text-lg font-normal">Контакт {id}</p>
    </div>
  );
}
