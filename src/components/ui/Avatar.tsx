import { useMemo } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

interface AvatarProps {
  picUrl?: string;
  firstName?: string;
  lastName?: string;
  alt?: string;
  className?: string;
  sizes?: string;
  imageClassName?: string;
}

export const Avatar = ({
  picUrl,
  firstName = "",
  lastName = "",
  alt = "Аватар пользователя",
  className = "",
  sizes,
  imageClassName,
}: AvatarProps) => {
  const initials = useMemo(() => {
    if (!firstName && !lastName) return "U";
    return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  }, [firstName, lastName]);

  return (
    <div
      className={twMerge("relative overflow-hidden", className)}
      style={{
        width: sizes,
        height: sizes,
        ...(sizes && { flexShrink: 0 }),
      }}
    >
      {picUrl ? (
        <Image
          src={picUrl}
          alt={alt}
          fill
          priority
          className={twMerge("object-cover", imageClassName)}
          sizes={sizes}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-semibold">
          <span className="text-5xl">{initials}</span>
        </div>
      )}
    </div>
  );
};
