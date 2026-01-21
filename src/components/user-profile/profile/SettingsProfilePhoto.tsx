"use client";
import Avatar from "@/components/ui/Avatar";

const SettingsProfilePhoto = () => {
  return (
    <div className="items-center flex flex-col w-full justify-center p-4 gap-2">
      <Avatar picUrl="/avatar/avatar-1.png" width={200} height={200} />
      <button className="text-[color:var(--color-violet)] text-[1.125rem] font-medium hover:opacity-60 transition-opacity">
        Изменить фото
      </button>
    </div>
  );
};
export default SettingsProfilePhoto;
