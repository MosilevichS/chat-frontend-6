"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";

import Logo from "@/src/components/ui/Logo";
import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import OTPInput from "@/src/components/ui/OTPInput";
import BackButton from "@/src/components/ui/BackButton";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalSupport from "@/src/components/ui/modal/ModalSupport";

import { useOtpResend } from "@/src/hooks/useOtpResend";

import { useSendCodeMutation, useVerifyCodeMutation } from "@/src/services/authApi";
import { parseApiError } from "@/src/services/apiError";

export default function Page() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const storedPhone = localStorage.getItem("phoneNumber");
    if (storedPhone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhone(storedPhone);
    }
  }, []);

  const router = useRouter();
  const resendCountdown = useOtpResend();

  const { control, setValue } = useForm({
    defaultValues: { otp: "" },
  });

  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation();
  const [sendCode] = useSendCodeMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputBlocked, setInputBlocked] = useState(false);
  const [resendLimitReached, setResendLimitReached] = useState(false);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Отправка кода
  const handleComplete = async (code: string) => {
    if (inputBlocked || isVerifying) return;

    try {
      await verifyCode({ phone_number: phone.replace(/\s+/g, ""), code }).unwrap();
      router.push("/personal-data");
    } catch (err) {
      const parsed = parseApiError(err);

      setErrorMessage(parsed.message ?? "Неверный код");
      setValue("otp", "");

      if (parsed.message?.includes("Блокировка")) {
        setInputBlocked(true);
      }
    }
  };

  // Запрос на обновление кода
  const handleResend = async () => {
    if (resendLimitReached) {
      setIsLimitModalOpen(true);
      return;
    }

    if (resendCountdown.isDisabled) return;

    try {
      await sendCode({ phone_number: phone.replace(/\s+/g, "") }).unwrap();
      setErrorMessage(null);
      setValue("otp", "");
      resendCountdown.startShortCooldown();
    } catch (err) {
      const parsed = parseApiError(err);

      if (parsed.message?.includes("превышено")) {
        setResendLimitReached(true);
        resendCountdown.startLongBlock();
        setIsLimitModalOpen(true);
        return;
      }

      setErrorMessage(parsed.message ?? "Не удалось отправить код");
    }
  };

  return (
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-6 md:pt-18">
      <AuthHeader className="hidden md:flex md:mb-8" />
      <div className="relative w-full max-w-[360px] pt-5 mb-8 md:mb-6 md:hidden text-center">
        <BackButton className="md:hidden absolute top-0 left-0" />
        <Logo size="small" />
        <h3 className="text-(--color-text) font-medium md:font-semibold text-[2rem] md:text-[3rem] leading-[120%] tracking-normal">
          А-Чат
        </h3>
      </div>

      <h3 className="mb-3 md:mb-6 text-(--color-text) font-semibold text-2xl leading-[120%] md:font-semibold md:text-[2rem] md:leading-[100%] tracking-normal">
        Подтвердите вход
      </h3>
      <span className="mb-5 md:mb-2 text-lg text-center leading-[130%] tracking-[0.01em] text-(--color-text)">
        Код подтверждения отправлен <br /> на следующий номер:
      </span>
      <span className="mb-7 md:mb-6 text-lg font-medium text-center leading-[120%]">{phone}</span>

      <Controller
        name="otp"
        control={control}
        render={({ field }) => (
          <OTPInput
            value={field.value}
            onChange={field.onChange}
            onComplete={handleComplete}
            error={errorMessage}
            disabled={inputBlocked || isVerifying}
            onSupport={() => setIsSupportModalOpen(true)}
            onResend={handleResend}
            countdown={resendCountdown}
          />
        )}
      />

      {isSupportModalOpen && (
        <ModalBase onClose={() => setIsSupportModalOpen(false)}>
          <ModalSupport
            onClose={() => setIsSupportModalOpen(false)}
            onSupport={() => router.push("/support")}
            title={"Код не пришел?"}
          ></ModalSupport>
        </ModalBase>
      )}

      {isLimitModalOpen && (
        <ModalBase onClose={() => setIsLimitModalOpen(false)}>
          <ModalSupport
            onClose={() => setIsLimitModalOpen(false)}
            onSupport={() => router.push("/support")}
            title="Лимит исчерпан"
            message="Попробуйте позднее"
          ></ModalSupport>
        </ModalBase>
      )}
    </div>
  );
}
