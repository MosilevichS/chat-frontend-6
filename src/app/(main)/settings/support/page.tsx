"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import backIcon from "@/assets/icons/back-icon.svg";
import Input from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Некорректный e-mail"),
  message: z.string().min(1, "Сообщение должно содержать минимум 1 символ"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const onSubmit = async () => {
    // TODO: отправка на сервер
    router.push("support/success");
  };

  return (
    <div className="flex gap-x-6 w-full justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto flex flex-col md:rounded-t-lg border border-[var(--color-gray-1)]">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/settings" className="p-2 -ml-2">
              <Image src={backIcon} width={24} height={24} alt="Назад" />
            </Link>

            <h2 className="text-[1.125rem] font-medium text-[var(--color-black)]">
              Обращение в поддержку
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 gap-4">
            <Input
              name="email"
              label="Укажите Ваш e-mail"
              type="email"
              placeholder="e-mail"
              error={errors.email?.message}
              className="w-full p-2 border rounded-lg"
              register={register("email")}
            />

            <div className="flex flex-col flex-1">
              <label className="text-[0.875rem] mb-1 text-[var(--color-gray)]">
                Опишите Вашу проблему
              </label>

              <textarea
                className={`w-full h-48 resize-none p-2 rounded-lg border ${
                  errors.message ? "border-red-500" : "border-[var(--color-gray)]"
                }`}
                placeholder="Опишите вашу проблему..."
                {...register("message")}
              />

              <p className="text-[0.875rem] mt-2 text-[var(--color-gray)]">
                Ознакомьтесь{" "}
                <Link className="text-[var(--color-violet)] underline hover:opacity-80" href="">
                  со списком известных проблем и их решениями
                </Link>
              </p>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full py-2 rounded-lg text-white bg-[var(--color-violet)]
                         hover:bg-[var(--color-violet-dark)]
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </form>
        </div>
      </div>

      <div
        className="hidden md:flex w-full max-w-[744px] min-h-[calc(100vh-84px)]
                      bg-[var(--color-gray-light)] rounded-t-lg px-4"
      />
    </div>
  );
}
