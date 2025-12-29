import { useState, useEffect } from "react";

import Image from "next/image";
import notificationIcon from "@/src/assets/icons/notification-icon.svg";

interface ISnackbar {
  message: string;
  duration?: number;
}

const Snackbar = ({ message, duration = 3000 }: ISnackbar) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => {
      clearTimeout(hideTimer);
    };
  }, [message, duration]);

  if (!message) return null;

  return (
    <div
      className={`flex flex-row gap-x-2.5 md:gap-x-2 items-center bg-(--color-black-light) 
        w-full max-w-[360px] h-[40px] md:h-[48px] rounded-lg px-3 md:px-4 py-3 absolute bottom-6 left-1/2 z-50
        -translate-x-1/2 transition-all duration-300 ease-out
        ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      <Image
        src={notificationIcon}
        alt="Уведомление"
        className="w-[16px] h-[16px] md:w-[24px] md:h-[24px]"
      />
      <p className="text-white text-sm font-normal leading-[1.063rem]">{message}</p>
    </div>
  );
};

export default Snackbar;
