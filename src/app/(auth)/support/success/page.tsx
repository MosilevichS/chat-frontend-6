"use client";

import Image from "next/image";
import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import Button from "@/src/components/ui/Button";

const Page = () => {
  return (
    <div className="flex h-full flex-col items-center pb-[1.688rem] md:pb-[5.188rem] pt-25 md:pt-18">
      <div className="hidden md:block w-full">
        <AuthHeader className="mb-5 md:mb-8" />
      </div>

      <h2 className="text-2xl md:text-[2rem] leading-[120%] md:leading-10 font-medium md:font-bold tracking-normal text-(--color-text) mb-18.75 md:mb-7.5">
        Служба поддержки
      </h2>

      <div className="h-full flex flex-col items-center">
        <Image
          src="/assets/icons/success.svg"
          alt="Успешно"
          width={67}
          height={67}
          className="mb-3.75 md:mb-5"
        />

        <h3 className="text-2xl leading-[120%] font-medium tracking-normal text-(--color-text) text-center mb-7 md:mb-6">
          Обращение отправлено!
        </h3>

        <p className="text-lg leading-[130%] tracking-normal text-(--color-text) text-center mb-6 md:mb-8">
          В ближайшее время вы получите ответ на электронную почту, указанную в обращении
        </p>

        <Button href="/" variant="primary" size="medium" className="mt-0 md:mt-auto">
          На главную
        </Button>
      </div>
    </div>
  );
};

export default Page;
