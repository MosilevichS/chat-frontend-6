import Image from "next/image";
import { timeFormat } from "@/src/utils/timeFormat";
import type { IMessage } from "@/src/types/message";
import messageSent from "@/src/assets/icons/message-sent.svg";
import messageRead from "@/src/assets/icons/message-read.svg";
import MessageWithLinks from "./MessageWithLinks";
// import messageNotSent from "@/src/assets/icons/message-not-sent.svg";

export default function OutgoingMessage({
  message,
  className,
}: {
  message: IMessage;
  className?: string;
}) {
  return (
    <div
      className={`relative ml-auto py-2.5 pl-3 pr-[4.75rem] bg-(--color-your-message) rounded-2xl rounded-br-sm ${className}`}
    >
      <MessageWithLinks text={message.content} className="text-gray-800 break-words" />
      <div className="absolute bottom-2.5 right-3 flex gap-0.5">
        <span className="text-sm text-(--color-gray)">
          {timeFormat(message.created_at, "time")}
        </span>

        <span>
          {message.new ? (
            <Image src={messageSent} alt="Отправлено" width={18} height={18} />
          ) : (
            <Image src={messageRead} alt="Прочитано" width={18} height={18} />
          )}
        </span>
      </div>
    </div>
  );
}
