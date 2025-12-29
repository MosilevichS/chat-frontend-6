"use client";

import { useRouter } from "next/navigation";

import Logo from "@/src/components/ui/Logo";
import Button from "@/components/ui/Button";
import done from "@/src/assets/icons/done.svg";
import Image from "next/image";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex w-full h-full items-center flex-col pb-20 pt-24 md:pt-18 ">
      <div className="hidden md:block">
        <Logo size="large" className="mb-16 hidden" />
      </div>
      <Image
        src={done}
        alt="Done picture"
        width={154}
        height={154}
        className="mb-5 block md:hidden"
      />

      <h3 className="mb-4 text-(--color-text) font-medium text-2xl leading-[120%] md:font-roboto md:font-semibold md:text-[32px] md:leading-[100%] tracking-normal  align-middle">
        Поздравляем!
      </h3>
      <span className="mb-8 text-lg leading-[130%] tracking-[0.01em] text-center text-(--color-text) md:text-[18px]">
        Регистрация прошла успешно!
      </span>

      <Button
        size="medium"
        variant="primary"
        className="md:mt-auto"
        onClick={() => router.push("/chats")}
      >
        Далее
      </Button>
    </div>
  );
}
