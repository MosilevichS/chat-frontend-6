"use client";

import Link from "next/link";
interface IButton {
  children: React.ReactNode;
  className?: string;
  variant: "primary" | "secondary1" | "secondary2" | "adaptive";
  size: "small" | "medium";
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button = ({
  children,
  type,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  href,
}: IButton) => {
  const buttonBaseStyle =
    "inline-flex items-center justify-center focus:outline-none transition-all duration-200 ease-in-out";

  const variants = {
    primary:
      "bg-[var(--color-violet)] text-white hover:bg-[var(--color-violet-dark)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
    secondary1:
      "bg-white text-[var(--color-violet)] border-2 border-[var(--color-violet)] hover:bg-[var(--color-gray-light)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
    secondary2:
      "bg-white text-[var(--color-violet)] hover:bg-[var(--color-gray-light)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
    adaptive:
      "bg-white text-[var(--color-violet)] border-2 border-[var(--color-violet)] hover:bg-[var(--color-gray-light)] active:scale-95 active:translate-y-0.5 active:shadow-inner md:border-none",
  };

  const sizes = {
    small: "w-[140px] md:w-[95px] h-[44px] md:h-[32px] px-2 rounded-md md:rounded-sm text-lg",
    medium: "w-full max-w-[360px] h-[56px] px-4 rounded-lg text-lg font-medium",
  };

  const buttonDisabledStyle = disabled
    ? "bg-[var(--color-button-disabled)] text-[var(--color-gray-dark)] cursor-not-allowed active:none"
    : "";

  if (href) {
    return (
      <Link
        href={href}
        className={`${buttonBaseStyle} ${disabled ? buttonDisabledStyle : variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${buttonBaseStyle} ${disabled ? buttonDisabledStyle : variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
