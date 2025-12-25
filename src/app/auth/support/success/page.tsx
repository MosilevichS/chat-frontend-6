"use client";

import { useRouter } from "next/navigation";
import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import Button from "@/src/components/ui/Button";

const SuccessPage = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/auth");
  };

  return (
    <div className="flex h-full flex-col items-center pb-[1.688rem] md:pb-[5.188rem] pt-[100px] md:pt-18">
      <div className="hidden md:block w-full max-w-[360px]">
        <AuthHeader className="mb-5 md:mb-8" />
      </div>

      <h2 className="text-2xl md:text-[2rem] leading-[120%] md:leading-10 font-medium md:font-bold tracking-normal text-(--color-text) mb-[75px] md:mb-[30px]">
        Служба поддержки
      </h2>

      <div className="flex flex-col items-center w-full max-w-[360px] px-4 md:px-0">
        <div className="mb-[15px] md:mb-[20px]">
          <div className="w-[67px] h-[67px] md:w-[67px] md:h-[67px] flex items-center justify-center">
            <img 
              src="/assets/icons/success.svg" 
              alt="Успешно"
              className="w-full h-full"
            />
          </div>
        </div>

        <h3 className="text-[24px] md:text-[24px] leading-[120%] font-medium tracking-normal text-(--color-text) text-center mb-[28px] md:mb-[24px]">
          Обращение отправлено!
        </h3>

        <p className="text-base md:text-base leading-[140%] tracking-normal text-(--color-text) text-center max-w-[320px] md:max-w-[360px] mb-[24px] md:mb-8">
          В ближайшее время вы получите ответ на электронную почту, указанную в обращении
        </p>

        <div className="w-full mt-0 md:mt-[150px]">
          <Button
            onClick={handleGoHome}
            variant="primary"
            size="medium"
            className="w-full h-14 rounded-lg"
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;