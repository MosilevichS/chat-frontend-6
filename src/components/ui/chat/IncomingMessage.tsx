import { useEffect, useRef } from "react";
import { timeFormat } from "@/src/utils/timeFormat";
import type { IMessage } from "@/src/types/message";
import MessageWithLinks from "./MessageWithLinks";

export default function IncomingMessage({
  message,
  markAsRead,
  className,
}: {
  message: IMessage;
  markAsRead: (message: IMessage) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!message.new) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          markAsRead(message);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [message, markAsRead]);

  return (
    <div
      ref={ref}
      className={`relative mr-auto py-2.5 pl-3 pr-14 bg-(--color-gray-1) rounded-2xl rounded-bl-sm ${className}`}
    >
      <MessageWithLinks text={message.content} className="text-gray-800 break-words" />
      <div className="absolute bottom-2.5 right-3">
        <span className="text-sm text-(--color-gray)">
          {timeFormat(message.created_at, "time")}
        </span>
      </div>
    </div>
  );
}
