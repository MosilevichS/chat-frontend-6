import { ErrorMessage } from "./ErrorMessage";
import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { InputHTMLAttributes } from "react";

interface IInput {
  onClick?: InputHTMLAttributes<HTMLInputElement>["onClick"];
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  name?: string;
  label?: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "search";
  placeholder: string;
  register?: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  defaultValue?: string;
  className?: string;
  value?: string;
  pattern?: string;
  required?: boolean;
}

const Input = ({
  onClick,
  onChange,
  name,
  label,
  type = "text",
  placeholder,
  register,
  error,
  disabled = false,
  defaultValue,
  className,
  value,
  pattern,
}: IInput) => {
  return (
    <div>
      {error ? (
        <ErrorMessage error={error} />
      ) : (
        <label
          htmlFor={name}
          className="text-(--color-gray) text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block"
        >
          {label}
        </label>
      )}

      <input
        onClick={onClick}
        onChange={onChange}
        id={name}
        value={value}
        pattern={pattern}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        className={twMerge(
          "w-full h-14",
          "text-lg tracking-[0.01em]",
          "border border-(--color-gray) rounded-md",
          "py-4 px-3 md:py-4 md:px-5",
          "focus:outline-none focus:border-(--color-violet)",
          "bg-white text-(--color-text) placeholder:text-gray-500",
          "transition-all duration-200",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
          error && "border-(--color-error) focus:border-(--color-error)",
          className,
        )}
        {...register}
      />
    </div>
  );
};

export default Input;
