import Image from "next/image";
import Search from "@/assets/icons/search.svg";
interface BlackListInputSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const BlackListInputSearch = ({
  value,
  onChange,
}: BlackListInputSearchProps) => {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Поиск по черному списку"
        className="w-full pl-10 pr-4 py-2   border border-transparent bg-[var(--color-gray-light)] focus:bg-white  rounded-[30px] focus:border focus:border-[var(--color-violet)] focus:outline-none"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Image src={Search} alt="search" width={20} height={20} />
      </div>
    </div>
  );
};
