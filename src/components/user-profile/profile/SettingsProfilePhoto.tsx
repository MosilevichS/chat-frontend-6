import Image from "next/image";
import avatar from "@/public/avatar/avatar-1.png";

const SettingsProfilePhoto = () => {
  return (
    <div className="items-center flex flex-col w-full justify-center p-4 gap-2">
      <Image src={avatar} width={200} height={200} alt="Фото" />
    </div>
  );
};

export default SettingsProfilePhoto;