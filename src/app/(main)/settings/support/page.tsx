"use client";
import Image from "next/image";
import Link from "next/link";
import Form from "next/form";
import backIcon from "@/assets/icons/back-icon.svg";
import Input from "@/components/ui/Input";
import type { FormEvent } from "react";

const Page = () => {
  const OnFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Здесь можно добавить логику для отправки данных формы в поддержку
    alert("Форма отправлена!");
  };

  return (
    <div className="flex gap-x-6 w-full justify-center">
      <div className="w-full flex flex-col md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto md:rounded-t-lg border border-[var(--color-gray-1)] p-0-4-4-4">
        <div className="w-full h-full mb-15 p-4">
          <div className="flex-row items-center gap-4 flex">
            <Link href="/settings" className="flex p-4">
              <Image src={backIcon} width={24} height={24} alt="Назад" />
            </Link>
            <h2 className="flex justify-center text-[var(--color-black)] font-medium text-[1.125rem]">
              Обращение в поддержку
            </h2>
          </div>

          <Form onSubmit={OnFormSubmit} className="gap-y-4 flex flex-col flex-1 h-full">
            <Input
              label="Укажите Ваш e-mail"
              type="email"
              name="email"
              placeholder="e-mail"
              className="w-full mb-4 p-2 border border-[var(--color-gray)] rounded-lg"
            />

            <div>
              <label className="text-[var(--color-gray)] text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block">
                Опишите Вашу проблему
              </label>
              <textarea

                name="message"
                required
                className="w-full p-2 border border-[var(--color-gray)] rounded-lg h-80"
              />
              <p className="text-[var(--color-gray)] text-[0.875rem] leading-[120%] tracking-[0.01em] mb-1 block">
                Ознакомьтесь{" "}
                <Link
                  className="text-[var(--color-violet)] text-[0.875rem] leading-[120%] tracking-[0.01em] underline hover:opacity-80"
                  href=""
                >
                  со списком известных проблем и их решениями.
                </Link>
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex mt-auto justify-center bg-[var(--color-violet)] text-white py-2 rounded-lg hover:bg-[var(--color-violet-dark)] transition-colors"
            >
              Отправить
            </button>
          </Form>
        </div>
      </div>

      <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-[var(--color-gray-light)] rounded-t-lg px-4">
      </div>
    </div>
  );
};

export default Page;
