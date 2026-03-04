import Image from "next/image";
import Search from "@/assets/icons/search.svg";
export const BlackListInputSearch = () => {
  return (
    <div className="relative">
      <input
        placeholder="Поиск по черному списку"
        className="w-full pl-10 pr-4 py-2 border rounded-lg border-[var(--color-violet)] focus:outline-none"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Image src={Search} alt="search" width={20} height={20} />
      </div>
    </div>
  );
};
