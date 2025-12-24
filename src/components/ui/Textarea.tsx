import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { ErrorMessage } from "./ErrorMessage";

interface ITextarea {
  register: UseFormRegisterReturn;
  name: string;
  label: string;
  placeholder: string;
  error?: string;
  className?: string;
}

const Textarea: React.FC<ITextarea> = ({
  register,
  name,
  label,
  placeholder,
  error,
  className,
}) => {
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

      <textarea
        {...register}
        id={name}
        placeholder={placeholder}
        className={twMerge(
          "w-full resize-none",
          "text-lg tracking-[0.01em] leading-[130%]",
          "border border-(--color-gray) rounded-md",
          "p-4",
          "focus:outline-none focus:border-(--color-violet)",
          "bg-white text-(--color-text) placeholder:text-gray-500",
          "transition-all duration-200",
          "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70",
          error && "border-(--color-error) focus:border-(--color-error)",
          className,
        )}
      />
    </div>
  );
};

export default Textarea;
