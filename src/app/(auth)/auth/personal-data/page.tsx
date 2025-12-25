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
    .min(1, "Заполните поле")
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(30, "Не более 30 символов")
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, "Используйте только буквы, пробел или тире")
    .trim(),

  nickName: z
    .string()
    .min(1, "Заполните поле")
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
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-[4.5rem] md:pt-18 ">
      <AuthHeader className="mb-5 md:mb-8" />

      <h3 className="mb-3 md:mb-6 text-[var(--color-text)] font-medium text-2xl leading-[120%] md:font-semibold md:text-[2rem] md:leading-[100%] tracking-normal">
        Личная информация
      </h3>
      <span className="mb-5 md:mb-6 text-lg leading-[130%] tracking-[0.01em] text-[var(--color-text)]">
        Пожалуйста, заполните данные
      </span>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <Input
          register={register("name")}
          name="name"
          label="Введите имя"
          placeholder=""
          error={errors.name?.message}
          className="mb-2 md:mb-3"
        />

        <Input
          register={register("nickName")}
          name="nickName"
          label="Введите никнейм"
          placeholder=""
          error={errors.nickName?.message}
        />

        <div className="mt-auto">
          <div className="flex flex-col items-center">
            <p className="font-medium text-xs md:text-sm text-(--color-gray) max-w-[360px] mb-4 leading-[120%]">
              Нажимая на «Зарегистрироваться», вы соглашаетесь с{" "}
              <a href="#">
                <span className="font-medium text-(--color-violet) hover:text-(--color-violet-dark) hover:underline">
                  Пользовательским соглашением.
                </span>
              </a>
            </p>

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
      </form>
    </div>
  );
}
