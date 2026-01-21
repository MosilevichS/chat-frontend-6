import Image from "next/image";
import vector from "@/assets/icons/vector.svg";
import leave from "@/assets/icons/leave.svg";
import { userProfileActions } from "@/components/user-profile/model/userProfileActions";
import Link from "next/link";

export const UserProfileActions = () => {
  return (
    <div className="flex flex-col  w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
      {userProfileActions.map(({ picture, name, href }) => (
        <Link
          key={name}
          href={href}
          className="w-full p-3 flex items-center justify-between border-b border-(--color-gray-200)"
        >
          <div className="flex items-center gap-2">
            <Image src={picture} width={28} height={28} alt="" />
            <span className="text-base font-normal text-1xl text-(--color-black)">
              {name}
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
        </Link>
      ))}
      <Link
        href="/"
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
      </Link>
    </div>
  );
};
