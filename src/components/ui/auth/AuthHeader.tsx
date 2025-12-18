import Logo from "@/src/components/ui/Logo";
import BackButton from "@/components/ui/BackButton";

export const AuthHeader = () => {
  return (
    <div
      className="
      h-[50px] w-full max-w-[360px] md:max-w-full
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
        <BackButton />
      </div>
      <Logo size="small" className="object-contain" />
    </div>
  );
};
