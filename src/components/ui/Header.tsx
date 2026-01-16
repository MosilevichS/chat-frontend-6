import Image from "next/image";
import logoAppStore from "../../assets/icons/appstore.svg";
import logoGooglePlay from "../../assets/icons/googleplay.svg";
import Link from "next/link";
import Logo from "./Logo";

const Header = () => {
  return (
    <header
      className="hidden md:flex items-center justify-between  h-[60px]  bg-(--color-gray-light) 
          rounded-b-lg border-b border-l border-r border-(--color-gray-1) px-4 py-2"
    >
      <Logo size="medium" />
      <div className="flex gap-x-2">
        <Link href="" className="delay-200 hover:opacity-80 cursor-pointer">
          <Image src={logoAppStore} alt="App Store" width={150} height={44} loading="eager" />
        </Link>
        <Link href="" className="delay-200 hover:opacity-80 cursor-pointer">
          <Image src={logoGooglePlay} alt="Google Play" width={150} height={44} loading="eager" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
