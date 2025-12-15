import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="max-w-[1440px] w-full min-h-screen mx-auto bg-[linear-gradient(145.07deg,#E2EAFE_18.45%,#DCF0EE_81.96%)] md:bg-[url('/images/auth-background.png')] bg-cover bg-center">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-[488px] h-[760px] rounded-2xl bg-[url('/images/auth-container-background.png')] bg-cover bg-center px-4 md:px-16 py-20 shadow-lg border-2 border-white md:border-none">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
