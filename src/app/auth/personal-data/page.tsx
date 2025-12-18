"use client";

import { AuthHeader } from "@/src/components/ui/auth/AuthHeader";
import { Input } from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(30, "Имя не должно превышать 30 символов")
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, "Имя может содержать только буквы, пробелы и дефисы")
    .trim(),

  nickName: z
    .string()
    .min(3, "Никнейм должен содержать минимум 3 символа")
    .max(30, "Никнейм не должен превышать 30 символов")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Никнейм может содержать только латинские буквы, цифры, точки, дефисы и подчеркивания",
    )
    .trim(),
});

type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      nickName: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Данные формы:", data);
  };

  return (
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-6 md:pt-18 ">
      <AuthHeader />

      <div className="flex flex-col items-center justify-center gap-3 md:gap-4 py-8 md:gap-6">
        <h3 className="text-black font-medium text-[24px] leading-[120%] md:font-roboto md:font-semibold md:text-[32px] md:leading-[100%] tracking-normal  align-middle">
          Личная информация
        </h3>
        <span
          className="
            font-roboto font-normal text-[18px] leading-[130%] tracking-[0.01em] text-center text-gray-600
            md:text-[18px]
          "
        >
          Пожалуйста, заполните данные
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
        <div className="flex flex-col items-center gap-4 md:gap-6 flex-1">
          <Input
            register={register("name")}
            name="name"
            label="Введите имя"
            placeholder=""
            error={errors.name?.message}
            containerClassName="w-full max-w-[360px]"
          />

          <Input
            register={register("nickName")}
            name="nickName"
            label="Придумайте никнейм"
            placeholder=""
            error={errors.nickName?.message}
            containerClassName="w-full max-w-[360px]"
          />
        </div>
        <div className="mt-auto  pt-6 pb-4">
          <div className="flex flex-col items-center">
            <p
              className="
                font-roboto font-normal text-[12px] text-gray-500
                md:text-[14px] max-w-[360px] mb-4
              "
            >
              Нажимая на «Зарегистрироваться», вы соглашаетесь с{" "}
              <a href="#">
                <span className="text-blue-500 hover:text-blue-600">
                  Пользовательским соглашением.
                </span>
              </a>
            </p>

            <div className="w-full max-w-[360px]">
              <Button
                type="submit"
                size="medium"
                variant="primary"
                className="w-full"
                disabled={isSubmitting || !isValid}
              >
                Зарегистрироваться
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
