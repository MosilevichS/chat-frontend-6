"use client";
interface ErrorProps {
  error?: string;
  className?: string;
}

export const ErrorMessage = ({ error, className }: ErrorProps) => {
  return (
    <p
      className={`text-(--color-error) text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block ${className}`}
    >
      {error}
    </p>
  );
};
