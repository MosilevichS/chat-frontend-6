import { Skeleton } from "@/components/ui/Skeleton";

export const UserProfileInfoSkeleton = () => (
  <div className="flex flex-row items-center gap-x-4 p-3 w-full md:max-w-[360px] bg-(--color-white) rounded-lg">
    <div className="relative">
      <Skeleton width={82} height={82} className="rounded-full" />
    </div>
    <div className="h-full space-y-2 flex-1">
      <Skeleton width={120} height={16} className="rounded" />
      <Skeleton width={80} height={14} className="rounded" />
      <Skeleton width={100} height={14} className="rounded" />
    </div>
  </div>
)
