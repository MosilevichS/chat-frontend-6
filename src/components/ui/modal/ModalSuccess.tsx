"use client";

import Image from "next/image";
import success from "@/src/assets/icons/success.svg";

interface IModalSuccess {
  name?: string;
  text: string;
}

const ModalSuccess = ({ name, text }: IModalSuccess) => {
  return (
    <div className="w-[329px] md:w-[280px] bg-white px-6 pt-6 pb-8 rounded-lg text-center">
      <Image src={success} alt="Success" width={52} height={52} className="mx-auto mb-4" />
      <h3 className="font-medium text-lg mb-1 leading-[120%]">{name}</h3>
      <p className="text-sm leading-[120%]">{text}</p>
    </div>
  );
};

export default ModalSuccess;
