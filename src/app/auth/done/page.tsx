import Logo from "@/src/components/ui/Logo";
import Button from "@/components/ui/Button";
import done from "@/src/assets/icons/done.svg";
import Image from "next/image";

const page = () => {
  return (
    <>
      <div className="hidden md:flex w-full h-full items-center flex-col pb-20 pt-18 ">
        <Logo size="large" className="object-contain ml-5" />
        <div className="flex flex-1 flex-col items-center w-full gap-4 py-16">
          <h3 className="text-[var(--color-black)] font-medium text-[24px] leading-[120%] md:font-roboto md:font-semibold md:text-[32px] md:leading-[100%] tracking-normal  align-middle">
            Поздравляем!
          </h3>
          <span
            className="
            font-roboto font-normal text-[18px] leading-[130%] tracking-[0.01em] text-center text-[var(--color-black)]
            md:text-[18px]
          "
          >
            Регистрация прошла успешно!
          </span>
        </div>

        <div className="flex w-full ">
          <Button size="medium" variant="primary">
            Далее
          </Button>
        </div>
      </div>
      <div className="flex md:hidden w-full h-full items-center  flex-col pb-20 pt-24 ">
        <Image src={done} alt="Done picture" width={154} height={154} className="w-39 h-39" />
        <div className="flex flex-col items-center w-full gap-4 pt-6 mb-8">
          <h3 className="text-[var(--color-black)] font-medium text-[24px] leading-[120%] md:font-roboto md:font-semibold md:text-[32px] md:leading-[100%] tracking-normal  align-middle">
            Поздравляем!
          </h3>
          <span
            className="
            font-roboto font-normal text-[18px] leading-[130%] tracking-[0.01em] text-center text-[var(--color-gray)]
            md:text-[18px]
          "
          >
            Регистрация прошла успешно!
          </span>
        </div>

        <div className="flex w-full items-center justify-center">
          <Button size="medium" variant="primary">
            Далее
          </Button>
        </div>
      </div>
    </>
  );
};

export default page;
