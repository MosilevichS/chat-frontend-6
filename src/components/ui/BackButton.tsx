"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import backIcon from "../../assets/icons/back-icon.svg";

const steps = ["/", "phone", "code", "profile", "success"];

const BackButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  const current = pathname.split("/").pop();
  const index = steps.indexOf(current!);

  if (index <= 0) return null;
  const handleBack = () => {
    const previousStep = steps[index - 1];
    router.push(`/auth/${previousStep}`);
  };

  return (
    <button
      onClick={handleBack}
      aria-label="На предыдущую страницу"
      className="transition-opacity delay-200 hover:opacity-80"
    >
      <Image src={backIcon} alt="Иконка назад" className="w-[32px] h-[32px]" />
    </button>
  );
};

export default BackButton;
