// components/ui/Avatar.tsx
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
  shape?: "circle" | "square"; // Добавляем проп для формы
}

export const Avatar = ({
  picUrl,
  height = 82,
  width = 82,
  lastName = "",
  firstName = "",
  className = "",
  alt = "Аватар пользователя",
  shape = "circle", // По умолчанию круг
}: AvatarProps) => {
  const initials = useMemo(() => {
    if (!firstName && !lastName) return "U";

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

    return `${firstInitial}${lastInitial}` || "U";
  }, [firstName, lastName]);

  // Определяем классы для формы
  const shapeClass = shape === "square" ? "rounded-lg" : "rounded-full";
  const imageShapeClass = shape === "square" ? "rounded-lg" : "rounded-full";

  if (picUrl) {
    return (
      <div
        className={twMerge(`relative overflow-hidden ${shapeClass}`, className)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <Image
          src={picUrl}
          alt={alt}
          fill
          className={`object-cover ${imageShapeClass}`}
          sizes="(max-width: 768px) 100vw, 200px"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        `flex items-center justify-center text-white font-semibold bg-(--color-gray-3) ${shapeClass}`,
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
