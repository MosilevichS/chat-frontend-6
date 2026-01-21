import Image from "next/image";
import edit from "../../../assets/icons/edit.svg";
import vector from "../../../assets/icons/vector.svg";
import black_list from "../../../assets/icons/black_list.svg";
import mail from "../../../assets/icons/mail.svg";
import leave from "../../../assets/icons/leave.svg";

const Settings = () => {
  return (
    <div className="flex flex-row  gap-x-6 w-full  justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="relative w-full">
          <p className="flex justify-center text-(--color-black)  font-medium text-[1.125rem] ">
            Настройки
          </p>
          <div className="gap-y-4 flex flex-col p-4">
            <div className="flex flex-row items-center gap-x-2 p-3 w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
              <Image src="/avatar/avatar.png" width={82} height={82} alt="Фото" />
              <div className="h-full">
                <p>Name</p>
                <p>Username</p>
                <p>Phone</p>
              </div>
            </div>
            <div className="flex flex-col  w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
              <button
                // onClick={}
                className="w-full p-3 flex items-center justify-between border-b border-(--color-gray-200)"
              >
                <div className="flex items-center gap-2">
                  <Image src={edit} width={28} height={28} alt="" />
                  <span className="text-base font-normal text-1xl text-(--color-black)">
                    Редактирование профиля
                  </span>
                </div>
                <Image
                  src={vector}
                  width={8}
                  height={12}
                  alt=""
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </button>
              <button
                // onClick={}
                className="w-full p-3 flex items-center justify-between border-b border-(--color-gray-200)"
              >
                <div className="flex items-center gap-2">
                  <Image src={black_list} width={28} height={28} alt="" />
                  <span className="text-base font-normal text-1xl text-(--color-black)">
                    Чёрный список
                  </span>
                </div>
                <Image
                  src={vector}
                  width={8}
                  height={12}
                  alt=""
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </button>
              <button
                // onClick={}
                className="w-full p-3 flex items-center justify-between border-b border-(--color-gray-200)"
              >
                <div className="flex items-center gap-2">
                  <Image src={mail} width={28} height={28} alt="" />
                  <span className="text-base font-normal text-1xl text-(--color-black)">
                   Поддержка
                  </span>
                </div>
                <Image
                  src={vector}
                  width={8}
                  height={12}
                  alt=""
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </button>
              <button
                // onClick={}
                className="w-full p-3 flex items-center justify-between border-b border-(--color-gray-200)"
              >
                <div className="flex items-center gap-2">
                  <Image src={leave} width={28} height={28} alt="" />
                  <span className="text-base font-normal text-1xl text-(--color-black)">
                  Выйти из аккаунта
                  </span>
                </div>
                <Image
                  src={vector}
                  width={8}
                  height={12}
                  alt=""
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden  md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};

export default Settings;
