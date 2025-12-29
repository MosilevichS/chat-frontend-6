"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import AuthHeader from "@/src/components/ui/auth/AuthHeader";
import Link from "next/link";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Textarea from "@/src/components/ui/Textarea";

import { useSendMessageToSupportMutation } from "@/src/services/authApi";
import { parseApiError } from "@/src/services/apiError";

const formSchema = z.object({
  email: z.string().trim().min(1, "Email обязателен").email("Некорректный email"),
  text: z.string().trim().min(10, "Минимум 10 символов").max(2000, "Сообщение слишком длинное"),
});

type FormData = z.infer<typeof formSchema>;

const Page = () => {
  const router = useRouter();
  const [sendMessage] = useSendMessageToSupportMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      text: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await sendMessage(data).unwrap();
      router.push("/support/success");
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
    <div className="flex h-full flex-col items-center pb-[1.688rem] md:pb-[5.188rem] pt-6 md:pt-18">
      <AuthHeader className="mb-5 md:mb-8" />

      <h2 className="text-2xl md:text-[2rem] leading-[120%] md:leading-10 mb-4 md:mb-6 font-medium md:font-bold tracking-normal text-(--color-text)">
        Служба поддержки
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full w-full max-w-[360px]">
        <Input
          register={register("email")}
          name="email"
          label="Укажите Ваш e-mail"
          type="email"
          placeholder=""
          error={errors.email?.message}
          className="mb-3"
        />

        <Textarea
          register={register("text")}
          name="description"
          label="Опишите Вашу проблему"
          placeholder=""
          error={errors.text?.message}
          className="mb-3 md:mb-2 h-[280px] md:h-[219px]"
        />

        {errors.root && <p className="text-(--color-error)">{errors.root.message}</p>}

        <div>
          <p className="font-medium text-xs md:text-sm text-(--color-gray) leading-[120%] w-full mb-4 md:mb-5">
            Ознакомьтесь со{" "}
            <Link
              href="/auth/support/known-issues"
              className="font-medium text-(--color-violet) hover:text-(--color-violet-dark) hover:underline"
            >
              списком известных проблем и их решениями
            </Link>
            .
          </p>

          <Button type="submit" variant="primary" size="medium" disabled={isSubmitting || !isValid}>
            Отправить
          </Button>

          {isSubmitting && (
            <div className="mt-3 md:mt-4 flex items-center justify-center">
              <div className="w-6 h-6 md:w-7 md:h-7 border-2 border-(--color-violet) border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Page;
