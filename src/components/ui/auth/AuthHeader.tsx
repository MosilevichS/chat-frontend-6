import Logo from "@/src/components/ui/Logo";
import Image from "next/image";
import backIcon from "@/assets/icons/back-icon.svg";

export const AuthHeader = () => {
  return (
    <div
      className="
      h-[50px] w-full max-w-full
      relative flex items-center justify-between
      md:justify-center
    "
    >
      <div
        className="
        w-[44px] h-[50px]
        md:absolute md:left-0 md:top-0
      "
      >
        <Image
          src={backIcon}
          alt="Кнопка назад"
          width={32}
          height={32}
          className="
            cursor-pointer hover:opacity-80 transition-opacity
            w-auto h-full
            md:w-[32px] md:h-[32px]
          "
        />
      </div>
      <Logo size="small" className="object-contain" />
    </div>
  );
};
