import { ErrorMessage } from "./ErrorMessage";
import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import type { InputHTMLAttributes } from "react";

interface IInput {
  inputClassName?: string;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  name: string;
  label?: string;
  type?: "text" | "email" | "password" | "tel" | "number";
  placeholder: string;
  containerClassName?: string;
  register?: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export const Input = ({
  inputClassName,
  onChange,
  name,
  label,
  type = "text",
  placeholder,
  containerClassName,
  register,
  error,
  disabled = false,
  defaultValue,
}: IInput) => {
  return (
    <div className={containerClassName}>
      {error ? (
        <ErrorMessage error={error} />
      ) : (
        <label
          htmlFor={name}
          className="text-[var(--color-grey)] text-[14px] leading-[120%] tracking-[0.01em] align-middle min-h-[20px] mb-1 block"
        >
          {label}
        </label>
      )}

      <input
        onChange={onChange}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        className={twMerge(
          "w-full",
          "text-lg tracking-[0.01em]",
          "border-2 border-[var(--color-gray)] rounded-md",
          "py-4 px-3 md:py-4 md:px-5",
          "focus:outline-none focus:border-[var(--color-violet)]",
          "bg-white text-[var(--color-gray)] placeholder:text-gray-500",
          "transition-all duration-200",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
          error && "border-[var(--color-error)] focus:border-[var(--color-error)]",
          inputClassName,
        )}
        {...register}
      />
    </div>
  );
};
