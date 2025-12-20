import Image from "next/image";
import notificationIcon from "@/src/assets/icons/notification-icon.svg";

const Notification = ({ text }: { text: string }) => {
  return (
    <div
      className="flex flex-row gap-x-2.5 md:gap-x-2 items-center 
      bg-(--color-black-light) w-full max-w-[360px] h-[40px] md:h-[48px] rounded-lg px-3 md:px-4 py-3"
    >
      <Image
        src={notificationIcon}
        alt="Уведомление"
        className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]"
      />
      <p className="text-white text-sm font-normal leading-[1.063rem]">{text}</p>
    </div>
  );
};

export default Notification;
