
import { UseProfileInfo, UserProfileActions } from "@/components/user-profile";


const Settings = () => {
  return (
    <div className="flex gap-x-6 w-full  justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="relative w-full">
          <p className="flex justify-center text-(--color-black)  font-medium text-[1.125rem] ">
            Настройки
          </p>
          <div className="gap-y-4 flex flex-col p-4">
            <UseProfileInfo />
            <UserProfileActions />

          </div>
        </div>
      </div>
      <div className="hidden  md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};

export default Settings;
