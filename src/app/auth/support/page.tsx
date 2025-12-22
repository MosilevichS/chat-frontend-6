"use client";

import Link from "next/link";
import Logo from "@/src/components/ui/Logo";
import Button from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import BackButton from "@/src/components/ui/BackButton";
import { useForm, Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ISupportFormData {
  email: string;
  problem: string;
}

const SupportPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ISupportFormData>({
    mode: "onChange",
    defaultValues: {
      email: "",
      problem: "",
    },
  });

  const onSubmit = async (data: ISupportFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Отправка формы:", data);

      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push("/auth/support/success");
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={twMerge("flex h-full flex-col items-center", "auth-card--mobile-bg", "px-4")}>
      <div className={twMerge("w-full max-w-[360px]", "mb-2", "pt-[70px]", "flex flex-col")}>
        {/* Десктопная версия */}
        <div className="hidden md:flex items-start justify-between w-full">
          <BackButton className="mt-0" />
          <Logo size="large" className={twMerge("scale-[0.45]", "origin-top", "mt-0")} />
          <div className="w-10"></div>
        </div>

        {/* Мобильная версия */}
        <div className="flex md:hidden items-center justify-between w-full relative min-h-[48px]">
          <BackButton className="mt-0 z-10" />
          <Logo
            size="large"
            className={twMerge(
              "scale-[0.3]",
              "origin-center",
              "absolute right-[-70px] top-1/2 -translate-y-1/2",
              "z-10",
            )}
          />
        </div>
      </div>

      <div
        className={twMerge(
          "w-full max-w-[360px]",
          "flex flex-col items-center",
          "flex-grow",
          "md:mt-[-70px]",
        )}
      >
        <h2
          className={twMerge(
            "text-2xl md:text-[2rem]",
            "leading-[120%] md:leading-10",
            "mb-3 md:mb-5",
            "font-medium md:font-bold",
            "bg-[linear-gradient(181.47deg,#D7D7D7_-221.42%,#FFF9F9_-78.94%,#4F4C4C_36.08%)]",
            "bg-clip-text text-transparent",
            "text-center w-full",
            "tracking-normal",
            "text-[var(--color-text)]",
          )}
        >
          Служба поддержки
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className={twMerge("flex flex-col items-center", "w-full", "flex-grow")}
          noValidate
        >
          <div className={twMerge("w-full", "mb-[10px]")}>
            {/* Метка для email - показываем только если нет ошибки */}
            {!errors.email && (
              <span
                className={twMerge(
                  "block",
                  "text-[0.875rem] leading-[120%] tracking-[0.01em]",
                  "text-[var(--color-gray)]",
                  "mb-2 ml-0", // Изменено: ml-0 вместо ml-1
                )}
              >
                Укажите Ваш e-mail
              </span>
            )}

            {/* Сообщение об ошибке email - показываем вместо метки */}
            {errors.email && (
              <p
                className={twMerge(
                  "text-[var(--color-error)] text-[0.875rem] leading-[120%] tracking-[0.01em]",
                  "mb-2 ml-0", // Изменено: ml-0 вместо ml-1
                )}
              >
                {errors.email.message}
              </p>
            )}

            <Controller
              name="email"
              control={control}
              rules={{
                required: "Введите Email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Некорректный email",
                },
              }}
              render={({ field }) => (
                <div className="w-full">
                  <Input
                    {...field}
                    name="email"
                    type="email"
                    placeholder=""
                    className={twMerge(
                      "w-full max-w-[360px]",
                      "!border !border-[var(--color-gray)]",
                      "!rounded-lg",
                      "!px-5 !py-4",
                      "!h-14",
                      "!bg-white",
                      errors.email &&
                        "!border-[var(--color-error)] !focus:border-[var(--color-error)]",
                    )}
                  />
                </div>
              )}
            />
          </div>

          <div className={twMerge("w-full", "mb-[15px]")}>
            {/* Метка для проблемы - показываем только если нет ошибки */}
            {!errors.problem && (
              <span
                className={twMerge(
                  "block",
                  "text-[0.875rem] leading-[120%] tracking-[0.01em]",
                  "text-[var(--color-gray)]",
                  "mb-[6px] ml-0", // Изменено: ml-0 вместо ml-1
                )}
              >
                Опишите Вашу проблему
              </span>
            )}

            {/* Сообщение об ошибке проблемы - показываем вместо метки */}
            {errors.problem && (
              <p
                className={twMerge(
                  "text-[var(--color-error)] text-[0.875rem] leading-[120%] tracking-[0.01em]",
                  "mb-[6px] ml-0", // Изменено: ml-0 вместо ml-1
                )}
              >
                {errors.problem.message}
              </p>
            )}

            <Controller
              name="problem"
              control={control}
              rules={{
                required: "Введите описание проблемы",
                minLength: {
                  value: 5,
                  message: "Минимум 5 символов",
                },
                maxLength: {
                  value: 1000,
                  message: "Максимум 1000 символов",
                },
              }}
              render={({ field }) => (
                <div className="relative w-full">
                  <textarea
                    {...field}
                    id="problem"
                    placeholder=""
                    className={twMerge(
                      "w-full max-w-[360px]",
                      "text-lg tracking-[0.01em]",
                      "border border-[var(--color-gray)] rounded-lg",
                      "px-5 py-4",
                      "bg-white text-[var(--color-gray)]",
                      "focus:outline-none focus:border-[var(--color-violet)]",
                      "transition-all duration-200",
                      "resize-none",
                      errors.problem &&
                        "border-[var(--color-error)] focus:border-[var(--color-error)]",
                    )}
                    style={{
                      height: "219px",
                      minHeight: "219px",
                      maxHeight: "219px",
                    }}
                  />
                </div>
              )}
            />
          </div>

          <div className={twMerge("w-full", "mb-[80px] mt-[-8px]")}>
            <p
              className={twMerge(
                "font-medium text-xs md:text-sm text-(--color-gray) leading-[120%]",
                "w-full",
              )}
            >
              Ознакомьтесь со{" "}
              <Link
                href="/auth/support/known-issues"
                className="font-medium text-(--color-violet) hover:text-(--color-violet-dark) hover:underline"
              >
                списком известных проблем и их решениями
              </Link>
              .
            </p>
          </div>

          <div className={twMerge("mt-auto w-full", "mb-[150px] mt-[-64px]")}>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              disabled={!isValid || isSubmitting}
              className={twMerge("w-full max-w-[360px]", "h-14", "rounded-lg")}
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </Button>

            {isSubmitting && (
              <div className={twMerge("mt-3 md:mt-4", "flex items-center justify-center")}>
                <div
                  className={twMerge(
                    "w-6 h-6 md:w-7 md:h-7",
                    "border-2 border-[var(--color-violet)] border-t-transparent",
                    "rounded-full",
                    "animate-spin",
                  )}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;