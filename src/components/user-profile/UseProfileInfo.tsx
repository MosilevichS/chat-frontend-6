"use client"
import Image from "next/image";
// import { useGetProfileQuery } from "@/src/services/userApi";



export const UseProfileInfo = () => {
  // const {data} = useGetProfileQuery({})
  // console.log("DATA:", data)
  return (
    <div className="flex flex-row items-center gap-x-2 p-3 w-full md:max-w-[360px]  bg-(--color-white) rounded-lg">
      <Image src="/avatar/avatar.png" width={82} height={82} alt="Фото" />
      <div className="h-full">
        <p>Name</p>
        <p>Username</p>
        <p>Phone</p>
      </div>
    </div>
  );
};

