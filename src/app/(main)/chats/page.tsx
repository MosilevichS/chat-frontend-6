import Input from "@/src/components/ui/Input";
import Image from "next/image";
import search from "../../../assets/icons/search.svg";

const Chats = () => {
  return (
    <div className="flex flex-row  gap-x-6 w-full  justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="relative w-full">
          <Input
            placeholder="Поиск"
            type="search"
            className="placeholder:text-base placeholder:height-1.3; placeholder:font-normal border border-(--color-gray-1) pr-3 pl-11 pt-2.5 pb-2.5 md:pr-3 md:pl-11 md:pt-2.5 md:pb-2.5 h-[44px]"
          />
          <Image
            src={search}
            alt="Поиск"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-[16px] md:w-[24px]"
          />
        </div>
        <div>
          <div>
            <Image src="/avatar/avatar.png" width={60} height={60} alt="Фото" />
            <p>Влад Ляшев</p>
            <p>Привет, Владик!</p>
          </div>
        </div>
      </div>
      <div className="hidden  md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4">
        <p className="text-(--color-gray) text-lg font-normal">
          Выберите контакт для начала общения
        </p>
      </div>
    </div>
  );
};

export default Chats;
