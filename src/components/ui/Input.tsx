import { ErrorMessage } from "./ErrorMessage";
import type { UseFormRegister, FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";

interface IInput {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  register: UseFormRegister<FieldValues>;
  error?: string;
  disabled?: boolean;
  defaultValue?: string;
}

export const Input = ({
  name,
  label,
  type = "text",
  placeholder,
  className = "",
  register,
  error,
  disabled = false,
  defaultValue,
}: IInput) => {
  return (
    <div className="mb-4  max-w-[22.5rem] max-h-[4.8125rem]">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium h-4 mb-[0.25rem] text-gray-700">
          {label}
        </label>
      )}

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        className={twMerge(
          "w-full h-[3.7rem]",
          "text-lg leading-[1.3] tracking-[0.01em] text-center",
          "border-[0.125rem] border-gray-500 rounded-md",
          "py-[1rem] px-[1.2rem]",
          "focus:outline-none focus:border-[#7769E1] focus:ring-2 focus:ring-[#7769E1]/20",
          "bg-white text-gray-900 placeholder:text-gray-500",
          "transition-all duration-200",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
          error && "border-red-500 focus:border-red-500 focus:ring-red-200",
          className,
        )}
        {...register(name)}
      />

      {error && <ErrorMessage error={error} />}
    </div>
  );
};
