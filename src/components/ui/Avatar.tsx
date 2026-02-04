import { useMemo } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

interface AvatarProps {
  picUrl: undefined | string;
  height?: number;
  width?: number;
  lastName: string | undefined;
  firstName: string | undefined;
  className?: string;
  alt?: string;
}

export const Avatar = ({
  picUrl,
  height = 82,
  width = 82,
  lastName = "",
  firstName = "",
  className = "",
  alt = "Аватар пользователя",
}: AvatarProps) => {
  const initials = useMemo(() => {
    if (!firstName && !lastName) return "U";

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

    return `${firstInitial}${lastInitial}` || "U";
  }, [firstName, lastName]);
  // const isValidUrl = (url: string | StaticImageData): boolean => {
  //   if (!url) return false;
  //
  //   // Если это StaticImageData из next/image
  //   if (typeof url === "object" && "src" in url) {
  //     return true;
  //   }
  //
  //   // Если это строка
  //   if (typeof url === "string") {
  //     const trimmed = url.trim();
  //     if (!trimmed) return false;
  //
  //     // Проверяем, является ли валидным URL или относительным путем
  //     try {
  //       // Для относительных путей
  //       if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
  //         return true;
  //       }
  //
  //       // Для абсолютных URL
  //       if (
  //         trimmed.startsWith("http://") ||
  //         trimmed.startsWith("https://") ||
  //         trimmed.startsWith("data:")
  //       ) {
  //         new URL(trimmed);
  //         return true;
  //       }
  //
  //       // Для путей к публичным файлам (без префикса)
  //       return true; // Допускаем простые имена файлов
  //     } catch {
  //       return false;
  //     }
  //   }
  //
  //   return false;
  // };

  if (picUrl) {
    return (
      <div className={twMerge("relative rounded-full overflow-hidden", className)}>
        <Image
          src={picUrl}
          width={width}
          height={height}
          alt={alt}
          className="object-cover w-full h-full rounded-full"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        "flex items-center justify-center rounded-full text-white font-semibold  bg-(--color-gray-3)",
        className,
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.min(width, height) / 2.5}px`,
      }}
    >
      {initials}
    </div>
  );
};
