"use client";

import Link from "next/link";
import Logo from "@/src/components/ui/Logo";
import Button from "@/src/components/ui/Button";

const Page = () => {
  return (
    <div data-auth-welcome className="flex h-full flex-col items-center auth-card--mobile-bg">
      <Logo size="large" className="mb-10 md:mb-16" />
      <h2 className="text-[2.125rem] md:text-[2rem] leading-11 md:leading-8 mb-4 md:mb-6 font-extrabold md:font-semibold bg-[linear-gradient(181.47deg,#D7D7D7_-221.42%,#FFF9F9_-78.94%,#4F4C4C_36.08%)] bg-clip-text text-transparent">
        А-Чат
      </h2>
      <span className="text-(--color-violet-dark) text-lg leading-6">Привет!</span>
      <span className="text-(--color-violet-dark) text-lg leading-6">Давай знакомиться</span>

      <Button variant="primary" size="medium" className="mt-6 md:mt-auto">
        <Link href="/auth/phone">Начать</Link>
      </Button>
    </div>
  );
};

export default Page;
