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
    <div className="min-h-screen flex flex-col">
      <AuthHeader />

      <div className="flex-1 px-4 md:px-0">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 py-8 md:gap-8">
            <h3
              className="
              font-medium text-2xl text-black-500 text-center
              md:text-3xl md:font-semibold md:text-black-900
            "
            >
              Личная информация
            </h3>
            <span
              className="
              font-roboto font-normal text-[18px] text-center text-gray-600
              md:text-[20px]
            "
            >
              Пожалуйста, заполните данные
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="space-y-4 mb-22 md:mb-12">
              <Input
                register={register("name")}
                name="name"
                label="Введите имя"
                placeholder=""
                error={errors.name?.message}
              />

              <Input
                register={register("nickName")}
                name="nickName"
                label="Придумайте никнейм"
                placeholder=""
                error={errors.nickName?.message}
              />
            </div>

            <div className="mt-4">
              <p
                className="
                font-roboto font-normal text-[12px] text-gray-500
                md:text-[14px]
              "
              >
                Нажимая на «Зарегистрироваться», вы соглашаетесь с{" "}
                <a href="#">
                  <span className="text-blue-500 hover:text-blue-600">
                    Пользовательским соглашением.
                  </span>
                </a>
              </p>
            </div>

            <Button
              type="submit"
              size="medium"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || !isValid}
            >
              Зарегистрироваться
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
