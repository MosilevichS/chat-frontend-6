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
import Snackbar from "@/src/components/ui/Snackbar";

import { useOtpTimer } from "@/src/hooks/useOtpTimer";
import { useLocalStorageState } from "@/src/hooks/useLocalStorageState";

import { loginAction } from "@/src/actions/auth";
import { useSendCodeMutation } from "@/src/services/authApi";
import { parseApiError } from "@/src/services/apiError";

export default function Page() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [blockedPhone, setBlockedPhone] = useState("");

  const [resendLimitReached, setResendLimitReached] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isTimeOutModalOpen, setIsTimeOutModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useLocalStorageState<string>("inputError", "");
  const [isInputDisabled, setIsInputDisabled] = useLocalStorageState<boolean>(
    "inputDisabled",
    false,
  );

  const { isButtonDisabled, label, startShort, startBlock10, startBlock60, initialized, reset } =
    useOtpTimer();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Получаем номер телефона
  useEffect(() => {
    const updatePhone = () => {
      setPhone(localStorage.getItem("currentPhoneNumber") || "");
      setBlockedPhone(localStorage.getItem("blockedPhoneNumber") || "");
    };
    window.addEventListener("phoneChanged", updatePhone);
    updatePhone();
    return () => window.removeEventListener("phoneChanged", updatePhone);
  }, []);

  // Когда таймер закончился или был изменён номер телефона, очищаем ошибку и блок инпута
  useEffect(() => {
    if (!initialized) return;

    if (!isButtonDisabled) {
      setErrorMessage("");
      setIsInputDisabled(false);
    }

    if (phone !== blockedPhone) {
      setErrorMessage("");
      setIsInputDisabled(false);
      reset();
    }
  }, [
    initialized,
    isButtonDisabled,
    setErrorMessage,
    setIsInputDisabled,
    phone,
    blockedPhone,
    reset,
  ]);

  const { control, setValue } = useForm({
    defaultValues: { otp: "" },
  });

  const [sendCode] = useSendCodeMutation();

  // Показ снэкбара
  const showSnackbar = () => {
    setSnackbarMessage("");
    setTimeout(() => setSnackbarMessage("Новый код отправлен"), 10);
  };

  // Отправка кода
  const handleComplete = async (code: string) => {
    const result = await loginAction({
      phone_number: phone.replace(/\s+/g, ""),
      code,
    });

    if (!result.success) {
      setValue("otp", "");

      if (result.message.includes("10 минут")) {
        startBlock10();
        setErrorMessage("Слишком много неверных попыток.");
        setIsInputDisabled(true);
        setIsLimitModalOpen(true);
        localStorage.setItem("blockedPhoneNumber", phone);
        setBlockedPhone(localStorage.getItem("blockedPhoneNumber") || "");
        return;
      }

      if (result.message.includes("1 час") || result.message.includes("заблокирован")) {
        startBlock60();
        setErrorMessage("Слишком много неверных попыток.");
        setIsInputDisabled(true);
        setIsLimitModalOpen(true);
        localStorage.setItem("blockedPhoneNumber", phone);
        setBlockedPhone(localStorage.getItem("blockedPhoneNumber") || "");
        return;
      }

      if (result.message.includes("время действия")) {
        setIsTimeOutModalOpen(true);
        return;
      }

      setErrorMessage(result.message || "Ошибка авторизации");
      return;
    }

    // Чистим локальное хранилище
    localStorage.removeItem("otp_timer");
    localStorage.removeItem("inputError");
    localStorage.removeItem("inputDisabled");
    localStorage.removeItem("currentPhoneNumber");
    localStorage.removeItem("blockedPhoneNumber");

    if (result.is_filled) {
      router.push("/chats");
    } else {
      router.push("/personal-data");
    }
  };

  // Запрос на обновление кода
  const handleResend = async () => {
    if (resendLimitReached) {
    }

    if (isButtonDisabled) return;

    try {
      await sendCode({ phone_number: phone.replace(/\s+/g, "") }).unwrap();
      showSnackbar();
      setErrorMessage("");
      setValue("otp", "");
      startShort();
    } catch (err) {
      const parsed = parseApiError(err);

      if (parsed.message?.includes("превышено")) {
        setResendLimitReached(true);
        startBlock60();
        return;
      }
    }
  };

  return (
    <div className="h-full flex items-center flex-col pt-6 md:pt-18">
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
            error={isClient ? errorMessage : null}
            disabled={isClient ? isInputDisabled : false}
            onSupport={() => setIsSupportModalOpen(true)}
            onResend={handleResend}
            label={label}
            isButtonDisabled={isButtonDisabled}
          />
        )}
      />

      <div className="w-full h-full relative">
        <Snackbar message={snackbarMessage} />
      </div>

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

      {isTimeOutModalOpen && (
        <ModalBase onClose={() => setIsTimeOutModalOpen(false)}>
          <ModalSupport
            onClose={() => setIsTimeOutModalOpen(false)}
            onSupport={() => router.push("/support")}
            title="Срок действия кода истек"
          ></ModalSupport>
        </ModalBase>
      )}
    </div>
  );
}
