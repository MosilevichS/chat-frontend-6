import Image from "next/image";
import noMessages from "@/src/assets/icons/no-messages.svg";

export default function NoMessagesPlaceholder() {
  return (
    <div className="h-full flex flex-1 flex-col items-center justify-center">
      <Image
        src={noMessages}
        alt="Нет сообщений"
        width={200}
        height={200}
        className="mb-6"
        loading="eager"
      />
      <p className="text-(--color-gray) text-lg leading-[130%]">Сообщений пока нет</p>
      <p className="text-(--color-gray) text-sm leading-[120%]">Напишите первым :)</p>
    </div>
  );
}
