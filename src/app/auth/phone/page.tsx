"use client";
import { useRef, useCallback } from "react";
import { Input } from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Logo from "@/components/ui/Logo";
import BackButton from "@/components/ui/BackButton";
import { AuthHeader } from "@/components/ui/auth/AuthHeader";

const formSchema = z.object({
  phone: z
    .string()
    .min(1, "Введите номер телефона")
    .regex(/^\+7 \d{3} \d{3} \d{2} \d{2}$/, {
      message: "Используйте формат: +7 900 000 00 00",
    }),
});
type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      phone: "+7 900 000 00 00",
    },
    criteriaMode: "firstError",
    reValidateMode: "onChange",
  });


  const onSubmit = (data: FormData) => {
    console.log("Данные формы:", data);
  };

  return (
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-[4.5rem] md:pt-20">
      <AuthHeader className="hidden relative md:flex md:mb-8" />
      <div className="text-center md:hidden ">
        <Logo size="small" />
        <h3 className="mb-8 md:mb-6 text-[var(--color-text)] font-medium md:font-semibold text-[2rem] md:text-[3rem] leading-[120%] tracking-normal">
          А-Чат
        </h3>
      </div>

      <h3 className="mb-5 md:mb-6 text-[var(--color-text)] font-medium text-[1.5rem] leading-[120%] md:font-semibold md:text-[2rem] md:leading-[100%] tracking-normal">
        Вход/регистрация
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full w-full max-w-sm px-4">
        <Input
          register={register("phone", {
            onChange: e => {
              const input = e.target.value;

              const allDigits = input.replace(/\D/g, "");

              let phoneDigits = allDigits.startsWith("7") ? allDigits.slice(1) : allDigits;

              phoneDigits = phoneDigits.slice(0, 10);

              let formatted = "+7";

              if (phoneDigits.length > 0) formatted += " " + phoneDigits.slice(0, 3);
              if (phoneDigits.length > 3) formatted += " " + phoneDigits.slice(3, 6);
              if (phoneDigits.length > 6) formatted += " " + phoneDigits.slice(6, 8);
              if (phoneDigits.length > 8) formatted += " " + phoneDigits.slice(8, 10);

              setValue("phone", formatted, {
                shouldValidate: true,
                shouldDirty: true,
              });
            },
          })}
          name="phone"
          label="Введите номер телефона"
          placeholder="+7 900 000 00 00"
          className="mb-4 md:mb-3"
          onClick={e => {
            if (e.currentTarget.value === "+7 900 000 00 00") {
              setValue("phone", "+7 ", { shouldValidate: true });
            }
          }}
        />

        <div className="mt-auto">
          <div className="flex flex-col items-center">
            <Button
              type="submit"
              size="medium"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? "Отправка..." : "Далее"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
