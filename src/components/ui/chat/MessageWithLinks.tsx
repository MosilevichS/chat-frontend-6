"use client";

interface MessageWithLinksProps {
  text: string;
  className?: string;
}

type LinkPart = {
  type: "link";
  content: string;
  url: string;
};

type TextPart = {
  type: "text";
  content: string;
  url?: never;
};

type MessagePart = LinkPart | TextPart;

// Функция для обнаружения ссылок в тексте
const detectLinks = (text: string): MessagePart[] => {
  const urlRegex = /(https?:\/\/[^\s]+)|(\/join\/[^\s]+)/g;
  const parts: MessagePart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    let fullUrl: string;

    if (match[0].startsWith("http")) {
      fullUrl = match[0];
    } else {
      // Добавляем базовый URL и гарантируем наличие слэша
      const baseUrl = window.location.origin;
      // Убеждаемся, что путь начинается со слэша
      const path = match[0].startsWith("/") ? match[0] : `/${match[0]}`;
      fullUrl = `${baseUrl}${path}`;
    }

    parts.push({
      type: "link",
      content: match[0],
      url: fullUrl,
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  return parts;
};

export default function MessageWithLinks({ text, className = "" }: MessageWithLinksProps) {
  const parts = detectLinks(text);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Opening URL:", url); // Для отладки

    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.url}
              onClick={e => handleLinkClick(e, part.url)}
              className="text-blue-600 hover:underline break-all cursor-pointer"
              rel="noopener noreferrer"
              target="_blank"
            >
              {part.content.length > 50 ? part.content.substring(0, 50) + "..." : part.content}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
}
