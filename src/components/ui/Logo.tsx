"use client";

import Link from "next/link";
import logo from "../../assets/icons/logo-icon.svg";

interface ILogo {
  size?: "small" | "large";
  className?: string;
}

const Logo = ({ size = "small", className }: ILogo) => {
  const logoSizes = {
    small: "w-[58px] h-[53px] md:w-[78px] md:h-[70px]",
    large: "w-[211px] h-[183px] md:w-[179px] md:h-[161px]",
  };

  return (
    <Link
      href="/"
      area-label="Ha главную"
      className={`inline-block transition-opacity hover:opacity-80 ${className}`}
    >
      <img src={logo.src} alt="Логотип компании" className={logoSizes[size]} />
    </Link>
  );
};

export default Logo;
