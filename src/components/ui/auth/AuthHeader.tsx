import Logo from "@/src/components/ui/Logo";
import BackButton from "@/components/ui/BackButton";

const AuthHeader = ({ className }: { className?: string }) => {
  return (
    <div
      className={`h-[50px] md:h-[70px] w-full max-w-[360px] relative flex items-center justify-between md:justify-center ${className}`}
    >
      <BackButton className="md:absolute md:left-0 md:top-0" />

      <Logo size="small" className="object-contain" />
    </div>
  );
};

export default AuthHeader;
