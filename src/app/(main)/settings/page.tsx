import { UseProfileInfo, UserProfileActions } from "@/components/user-profile";
import Image from "next/image";
import delete_outline from "../../../assets/icons/delete_outline.svg";

const Page = () => {
  return (
    <div className="flex gap-x-6 w-full  justify-center">
      <div className="w-full flex flex-col  md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="w-full">
          <p className="flex justify-center text-(--color-black)  font-medium text-[1.125rem] ">
            Настройки
          </p>
          <div className="gap-y-4 flex flex-col p-4">
            <UseProfileInfo />
            <UserProfileActions />
          </div>
        </div>
        <button className="flex mb-5 md:mb-0 mt-auto items-center gap-2 px-4">
          <Image src={delete_outline} width={16} height={16} alt="" />
          <span className="text-base font-normal text-[color:var(--color-error)] hover:opacity-60 transition-opacity">
            Удалить профиль
          </span>
        </button>
      </div>
      <div className="hidden  md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};

export default Page;
