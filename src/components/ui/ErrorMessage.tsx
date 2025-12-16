interface ErrorProps {
  error?: string;
  className?: string;
}

export const ErrorMessage = ({ error, className }: ErrorProps) => {
  return <p className={`text-red-500 text-sm mt-1 ${className}`}>{error}</p>;
};
