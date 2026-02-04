"use client";
import { useGetProfileQuery } from "@/src/services/userApi";
import { Avatar } from "@/components/ui/Avatar";
import { UserProfileInfoSkeleton } from "@/components/ui/user-profile/UserProfileInfo.Skeleton";

export const UseProfileInfo = () => {
  const { data: profileData, isLoading } = useGetProfileQuery();

  if (isLoading) return <UserProfileInfoSkeleton />;

  return (
    <div className="flex flex-row items-center gap-x-2 p-3 w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
      <Avatar
        picUrl={profileData?.avatar_url}
        width={64}
        height={64}
        lastName={profileData?.last_name}
        firstName={profileData?.first_name}
      />
      <div className="h-full">
        <p>{profileData?.first_name}</p>
        <p>{profileData?.username}</p>
        <p>{profileData?.phone}</p>
      </div>
    </div>
  );
};
