import React from "react";
import Image, { type StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

interface AvatarProps {
  picUrl: string | StaticImageData;
  height?: number;
  width?: number;
  lastName?: string;
  firstName?: string;
  className?: string;
  alt?: string;
  showInitials?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  picUrl,
  height = 82,
  width = 82,
  lastName = "",
  firstName = "",
  className = "",
  alt = "Аватар пользователя",
  showInitials = true,
}) => {
  const getInitials = () => {
    if (!firstName && !lastName) return "U";

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";

    return `${firstInitial}${lastInitial}` || "U";
  };
  const isValidUrl = picUrl && typeof picUrl === "string" && picUrl.trim() !== "";

  const avatarBaseClasses = "relative rounded-full overflow-hidden";

  const fallbackBaseClasses =
    "flex items-center justify-center rounded-full text-white font-semibold";

  if (!isValidUrl && showInitials) {
    const initials = getInitials();

    const fallbackClasses = twMerge(fallbackBaseClasses, className);

    return (
      <div
        className={fallbackClasses}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          fontSize: `${Math.min(width, height) / 2.5}px`,
        }}
      >
        {initials}
      </div>
    );
  }

  const containerClasses = twMerge(avatarBaseClasses, className);

  return (
    <div className={containerClasses}>
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
};

export default Avatar;
