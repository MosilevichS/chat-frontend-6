"use client";
import { useGetProfileQuery } from "@/src/services/userApi";
import Avatar from "@/components/ui/Avatar";

export const UseProfileInfo = () => {
  const { data } = useGetProfileQuery();
  return (
    <div className="flex flex-row items-center gap-x-2 p-3 w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
      <Avatar picUrl="/avatar/avatar.png" />
      <div className="h-full">
        <p>{data?.first_name}</p>
        <p>{data?.username}</p>
        <p>{data?.phone}</p>
      </div>
    </div>
  );
};
