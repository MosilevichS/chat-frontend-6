import Image from "next/image";
import SettingsProfilePhoto from "@/components/ui/user-profile/profile/SettingsProfilePhoto";
import Link from "next/link";
import backIcon from "@/assets/icons/back-icon.svg";
import SettingsProfileChangeForm from "@/components/ui/user-profile/profile/SettingsProfileChangeForm";

const Page = () => {
  return (
    <div className="flex gap-x-6 w-full  justify-center">
      <div className="w-full flex flex-col  md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-0-4-4-4">
        <div className="w-full ">
          <div className="flex-row items-center gap-4 flex border-b border-[color:var(--color-gray-1)]">
            <Link href="/settings" className="flex p-4">
              <Image src={backIcon} width={24} height={24} alt="" />
            </Link>
            <h2 className="flex justify-center text-(--color-black)  font-medium text-[1.125rem] ">
              Редактирование профиля
            </h2>
          </div>
          <SettingsProfilePhoto />
          <SettingsProfileChangeForm />

        </div>
      </div>
      <div className="hidden  md:flex  justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};
export default Page;
