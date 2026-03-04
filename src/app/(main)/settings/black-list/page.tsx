"use client";

import { BlackListTopMenu } from "@/components/ui/user-profile/black-list/BlackListTopMenu";
import { BlackListInputSearch } from "@/components/ui/user-profile/black-list/BlackListInputSearch";

const Page = () => {
  return (
    <div className="flex gap-x-6 w-full justify-center">
      <div className="w-full flex flex-col md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto  md:rounded-t-lg border border-[var(--color-gray-1)] p-4">
        <BlackListTopMenu />
        <BlackListInputSearch />
      </div>
      <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};

export default Page;
