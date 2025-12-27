"use client";

import Link from "next/link";
import Image from "next/image";
import logoIcon from "../../assets/icons/logo-icon.svg";

interface ILogo {
  size?: "small" | "medium" | "large";
  className?: string;
}

const Logo = ({ size = "small", className }: ILogo) => {
  const logoSizes = {
    small: "w-[58px] h-[53px] md:w-[78px] md:h-[70px]",
    medium: "w-[49px]",
    large: "w-[211px] h-[183px] md:w-[179px] md:h-[161px]",
  };

  return (
    <Link
      href="/"
      area-label="Ha главную"
      className={`inline-block transition-opacity delay-200 hover:opacity-80 ${className}`}
    >
      <Image src={logoIcon} alt="Логотип компании" className={logoSizes[size]} />
    </Link>
  );
};

export default Logo;
