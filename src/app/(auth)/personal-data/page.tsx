"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import Input from "@/src/components/ui/Input";
import Button from "@/components/ui/Button";

import { useUpdateProfileMutation } from "@/src/services/userApi";
import { parseApiError } from "@/src/services/apiError";

const formSchema = z.object({
  first_name: z
    .string()
    .trim()
    .nonempty("Заполните поле")
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, "Используйте только буквы, пробел или тире")
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(30, "Не более 30 символов"),

  nickname: z
    .string()
    .trim()
    .nonempty("Заполните поле")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Никнейм может содержать только латинские буквы, цифры, точки, дефисы и подчеркивания",
    )
    .min(3, "Никнейм должен содержать минимум 3 символа")
    .max(30, "Никнейм не должен превышать 30 символов"),
});

type FormData = z.infer<typeof formSchema>;

export default function Page() {
  const router = useRouter();
  const [updateProfile] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      first_name: "",
      nickname: "",
    },
  });

  // Сабмит формы
  const onSubmit = async (data: FormData) => {
    try {
      await updateProfile(data).unwrap();
      router.push("/done");
    } catch (err) {
      const { fieldErrors, message } = parseApiError(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof FormData, {
            type: "server",
            message: messages[0],
          });
        });
      }

      if (message) {
        setError("root", {
          type: "server",
          message,
        });
      }
    }
  };

  return (
    <div className="h-full flex items-center flex-col pb-10 md:pb-20 pt-6 md:pt-18">
      <AuthHeader className="mb-5 md:mb-8" />

      <h3 className="mb-3 md:mb-6 text-(--color-text) font-medium text-2xl leading-[120%] md:font-semibold md:text-[2rem] md:leading-[100%] tracking-normal">
        Личная информация
      </h3>
      <span className="mb-5 md:mb-6 text-lg leading-[130%] tracking-[0.01em] text-(--color-text)">
        Пожалуйста, заполните данные
      </span>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[360px] flex flex-col h-full">
        <Input
          register={register("first_name")}
          name="name"
          label="Введите имя"
          placeholder=""
          error={errors.first_name?.message}
          className="mb-2 md:mb-3"
        />

        <Input
          register={register("nickname")}
          name="nickName"
          label="Введите никнейм"
          placeholder=""
          error={errors.nickname?.message}
        />

        {errors.root && <p className="text-(--color-error)">{errors.root.message}</p>}

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
