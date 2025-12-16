import { ErrorMessage } from "./ErrorMessage";
import type { UseFormRegister, FieldValues } from "react-hook-form";
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
  register?: UseFormRegister<FieldValues>;
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
        <label htmlFor={name} className="block text-sm font-medium h-4 mb-[0.25rem] text-gray-700">
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
          "border-2 border-gray-500 rounded-md",
          "py-4 px-5",
          "focus:outline-none focus:border-[#7769E1] focus:ring-2 focus:ring-[#7769E1]/20",
          "bg-white text-gray-900 placeholder:text-gray-500",
          "transition-all duration-200",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          inputClassName,
        )}
        {...(register && { ...register(name) })}
      />
    </div>
  );
};
