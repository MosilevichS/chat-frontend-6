import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="max-w-[1440px] w-full min-h-screen mx-auto bg-[linear-gradient(145.07deg,#E2EAFE_18.45%,#DCF0EE_81.96%)] md:bg-[url('/images/auth-background.png')] bg-cover bg-center">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="auth-card w-full max-w-[488px] h-[674px] md:h-[760px] rounded-2xl bg-white md:bg-[url('/images/auth-container-background.png')] bg-cover bg-center shadow-lg border-2 border-white md:border-none">
          <div className="h-full px-4 md:px-16">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
