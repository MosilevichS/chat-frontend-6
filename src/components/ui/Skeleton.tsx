import { twMerge } from "tailwind-merge";

interface ISkeletonProps {
  width?: number;
  height?: number;
  className?: string;
}
export const Skeleton = ({ width, height, className }: ISkeletonProps) => (
  <div
    className={twMerge("animate-pulse bg-gray-200", className)}
    style={{ width: `${width}px`, height: `${height}px` }}
  />
);
