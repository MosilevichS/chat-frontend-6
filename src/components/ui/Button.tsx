"use client";

interface IButton {
  children: React.ReactNode;
  className?: string;
  variant: "primary" | "secondary1" | "secondary2";
  size: "small" | "medium";
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
}: IButton) => {
  const buttonBaseStyle =
    "inline-flex items-center justify-center focus:outline-none transition-all duration-200 ease-in-out";

  const variants = {
    primary:
      "bg-[var(--color-violet)] text-white hover:bg-[var(--color-violet-dark)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
    secondary1:
      "bg-white text-[var(--color-violet)] border-2 border-[var(--color-violet)] hover:bg-[var(--color-gray-light)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
    secondary2:
      "bg-white text-[var(--color-violet)] hover:text-[var(--color-violet-dark)] active:scale-95 active:translate-y-0.5 active:shadow-inner",
  };

  const sizes = {
    small: "w-[5.9375rem] h-[2rem] px-2 rounded-[0.25rem] text-base",
    medium: "w-[22.5rem] h-[3.5rem] px-4 rounded-[0.5rem] text-[1.125rem] font-medium",
  };

  const buttonDisabledStyle = disabled
    ? "bg-[var(--color-button-disabled)] text-[var(--color-gray-dark)] cursor-not-allowed active:none"
    : "";

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
