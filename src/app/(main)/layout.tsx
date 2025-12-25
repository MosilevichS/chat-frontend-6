import type { ReactNode } from "react";
import Header from "@/src/components/ui/Header";
import Navigation from "@/src/components/ui/Navigation";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="max-w-[1440px] w-full min-h-screen mx-auto bg-(--color-white)">
      <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-y-6">
        <Header />
        <div className="flex flex-row gap-x-6">
          <Navigation />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
