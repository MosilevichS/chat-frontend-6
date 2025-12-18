interface ErrorProps {
  error?: string;
  className?: string;
}

export const ErrorMessage = ({ error, className }: ErrorProps) => {
  return (
    <p
      className={`text-[var(--color-error)] text-[14px] leading-[120%] tracking-[0.01em] align-middle min-h-[20px] block${className}`}
    >
      {error}
    </p>
  );
};
