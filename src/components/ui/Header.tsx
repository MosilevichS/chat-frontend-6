import Image from "next/image";
import logoIcon from "../../assets/icons/logo-icon.svg";
import logoAppStore from "../../assets/icons/appstore.svg";
import logoGooglePlay from "../../assets/icons/googleplay.svg";
import Link from "next/link";

const Header = () => {
  return (
    <header
      className="hidden md:flex items-center justify-between  h-[60px]  bg-(--color-gray-light) 
          xl:rounded-b-lg border-b border-l border-r border-(--color-gray-1) px-4 py-2"
    >
      <Image src={logoIcon} alt="Логотип компании" width={49} height={44} />
      <div className="flex gap-x-2">
        <Link href="" className="cursor-pointer">
          <Image src={logoAppStore} alt="App Store" width={150} height={44} />
        </Link>
        <Link href="" className="cursor-pointer">
          <Image src={logoGooglePlay} alt="Google Play" width={150} height={44} />
        </Link>
      </div>
    </header>
  );
};

export default Header;
