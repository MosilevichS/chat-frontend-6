"use client";

import { useRouter } from "next/navigation";
import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import Button from "@/src/components/ui/Button";

const SuccessPage = () => {
  const router = useRouter();

  const handleGoHome = () => {
    // Переход на стартовую страницу авторизации
    router.push("/auth");
  };

  return (
    <div className="flex h-full flex-col items-center pb-[1.688rem] md:pb-[5.188rem] pt-6 md:pt-18">
      {/* Десктопная версия - AuthHeader */}
      <div className="hidden md:block">
        <AuthHeader className="mb-5 md:mb-8" />
      </div>

      {/* Мобильная версия - только BackButton */}
      <div className="md:hidden w-full max-w-[360px] px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-(--color-text) hover:text-(--color-violet) transition-colors"
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Заголовок "Служба поддержки" */}
      <h2 className="text-2xl md:text-[2rem] leading-[120%] md:leading-10 font-medium md:font-bold tracking-normal text-(--color-text) mb-4 md:mb-6">
        Служба поддержки
      </h2>

      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-[360px] px-4 md:px-0">
        {/* Success иконка */}
        <div className="mb-3 md:mb-5">
          <div className="w-[120px] h-[120px] md:w-[140px] md:h-[140px] flex items-center justify-center">
            <img 
              src="/assets/icons/success.svg" 
              alt="Успешно"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Заголовок "Обращение отправлено!" */}
        <h3 className="text-[24px] md:text-[28px] leading-[120%] font-medium tracking-normal text-(--color-text) text-center mb-7 md:mb-6">
          Обращение отправлено!
        </h3>

        {/* Описание */}
        <p className="text-base md:text-lg leading-[140%] tracking-normal text-(--color-gray) text-center max-w-[320px] md:max-w-[360px] mb-6 md:mb-8">
          В&nbsp;ближайшее время вы&nbsp;получите ответ на&nbsp;электронную почту, указанную в&nbsp;обращении
        </p>

        {/* Кнопка "На главную" */}
        <div className="w-full mt-auto mb-[150px] md:mb-0">
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