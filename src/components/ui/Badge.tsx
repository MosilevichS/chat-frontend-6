"use client";

interface IBadge {
  className?: string;
  children?: React.ReactNode;
}

const Badge = ({ className = "", children }: IBadge) => {
  if (!children) return null;

  const text = children.toString();
  const isSingle = text.length === 1 && /^\d$/.test(text);

  const size = isSingle
    ? "w-[1.3125rem] h-[1.3125rem] rounded-full"
    : "min-w-[1.875rem] h-[1.3125rem] rounded-[0.65625rem]";

  return (
    <div
      className={`inline-flex items-center justify-center p-1.5 bg-(--color-violet) text-white font-medium ${size} ${className}`}
    >
      <span className="text-[1rem] leading-none">{children}</span>
    </div>
  );
};

export default Badge;
