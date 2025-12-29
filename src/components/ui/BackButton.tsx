"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import backIcon from "../../assets/icons/back-icon.svg";

// Основные шаги процесса
const steps = ["", "phone", "phone-code", "personal-data", "done"];

// Исключения: нестандартные страницы и их "назад" путь
const exceptions: Record<string, string> = {
  support: "phone-code",
  success: "support",
};

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();
  const pathname = usePathname();

  const current = pathname.split("/").pop();

  if (!current) return null;

  let previousStep: string | null = null;

  if (exceptions[current]) {
    previousStep = exceptions[current];
  } else {
    const index = steps.indexOf(current);
    previousStep = index > 0 ? steps[index - 1] : null;
  }

  const handleBack = () => {
    router.push(`/${previousStep}`);
  };

  return (
    <button
      onClick={handleBack}
      aria-label="На предыдущую страницу"
      className={`transition-opacity delay-200 hover:opacity-80 ${className}`}
    >
      <Image src={backIcon} alt="Иконка назад" className="w-[32px] h-[32px]" />
    </button>
  );
};

export default BackButton;
