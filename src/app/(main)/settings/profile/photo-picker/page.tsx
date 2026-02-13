import Image from "next/image";
import Link from "next/link";
import close from "@/assets/icons/close.svg";
import {
  SettingsProfilePhotoPicker
} from "@/components/ui/user-profile/profile/photo-picker/SettingsProfilePhotoPicker";

const Page = () => {
  return (
    <div className="flex gap-x-6 w-full  justify-center">
      <div className="w-full flex flex-col  md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-0-4-4-4">
        <div className="w-full">
          <div className="flex-row items-center justify-end gap-4 flex border-b border-[color:var(--color-gray-1)]">
            <h2 className="flex justify-center text-(--color-black)  font-medium text-[1.125rem] ">
              Изменить фото профиля
            </h2>
            <Link href="/settings/profile" className="flex p-4">
              <Image src={close} width={24} height={24} alt="" />
            </Link>
          </div>
          <SettingsProfilePhotoPicker />

        </div>
      </div>
      <div className="hidden  md:flex  justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};
export default Page;
