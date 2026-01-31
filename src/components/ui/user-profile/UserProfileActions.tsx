"use client";
import Image from "next/image";
import vector from "@/assets/icons/vector.svg";
import leave from "@/assets/icons/leave.svg";
import { userProfileActions } from "@/components/ui/user-profile/model/userProfileActions";
import Link from "next/link";
import { logoutAction } from "@/src/actions/auth";
import { useRouter } from "next/navigation";

export const UserProfileActions = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await logoutAction();

    if (res.success) {
      router.replace("/phone");
    }
  };

  return (
    <div className="flex flex-col w-full md:max-w-[360px] bg-[color:var(--color-white)] rounded-lg">
      {userProfileActions.map(({ picture, name, href }) => (
        <Link
          key={name}
          href={href}
          className="w-full p-3 flex items-center justify-between border-b border-[color:var(--color-gray-light)]
          hover:bg-[color:var(--color-violet-ultra-light)] transition-colors hover:border-[color:var(--color-gray-300)]"
        >
          <div className="flex items-center gap-2">
            <Image src={picture} width={28} height={28} alt="" />
            <span className="text-base font-normal text-1xl text-[color:var(--color-black)]">{name}</span>
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

      <button
        onClick={handleLogout}
        className="w-full p-3 flex items-center justify-between border-b border-[color:var(--color-gray-light)]
        hover:bg-[color:var(--color-violet-ultra-light)] transition-colors hover:border-[color:var(--color-gray-300)]"
      >
        <div className="flex items-center gap-2">
          <Image src={leave} width={28} height={28} alt="" />
          <span className="text-base font-normal text-1xl text-[color:var(--color-black)]">
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
  );
};