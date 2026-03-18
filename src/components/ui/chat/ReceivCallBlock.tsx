import Image from "next/image";

import bigAvatar from "@/src/assets/icons/big-avatar.svg";
import { useEffect, useRef } from "react";

interface User {
  avatar_url?: string;
  first_name: string;
  last_name: string;
}

interface MessageRtc {
  from_user: User;
}

interface CallData {
  message_rtc: MessageRtc;
}

interface ReceivCallBlockProps {
  data: CallData;
  handleRejectCall: () => void;
  handleAcceptCall: () => void;
}

const ReceivCallBlock = ({ data, handleRejectCall, handleAcceptCall }: ReceivCallBlockProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Гудок запущен");
        })
        .catch(error => {
          console.warn(
            "Автовоспроизведение заблокировано. Ожидание взаимодействия пользователя:",
            error,
          );
          // Показываем кнопку «Разрешить звук»
        });
    }
  }, []);

  return (
    <div className="absolute inset-0 bg-(--color-violet-3) z-50 mx-auto mt-[84px] flex flex-col rounded-lg p-5 mb-1 w-[388px] max-h-[770px]">
      <div className="flex flex-col flex-1 items-center justify-center h-[267px]">
        <div className="flex justify-center items-center h-[184px] w-[184px] mb-[32px]">
          {data.message_rtc.from_user.avatar_url ? (
            <div className="relative">
              <Image
                src={data.message_rtc.from_user.avatar_url}
                width={160}
                height={160}
                alt="Аватар"
                className="rounded-full h-[160px] w-[160px]"
              />
              <div className="absolute -top-3 -left-3">
                <svg width="184" height="184" viewBox="0 0 184 184" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="172"
                    height="172"
                    rx="86"
                    stroke="#CEC8FF"
                    strokeOpacity="0.3"
                    strokeWidth="12"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <Image src={bigAvatar} width={184} height={184} alt="Аватар" />
          )}
        </div>

        <div className="flex flex-col items-center">
          <p className="text-2xl font-medium mb-2">
            {data.message_rtc.from_user.first_name} {data.message_rtc.from_user.last_name}
          </p>
          <p>Входящий звонок</p>
        </div>
      </div>

      <div className="flex gap-x-5 h-[44px]">
        <button
          onClick={handleRejectCall}
          className="bg-(--color-red) text-white h-[44px] w-[164px] rounded-2xl"
        >
          Отмена
        </button>
        <button
          onClick={handleAcceptCall}
          className="bg-(--color-green) text-white h-[44px] w-[164px] rounded-2xl"
        >
          Ответить
        </button>
      </div>

      <audio ref={audioRef} src="/sounds/ringtone.mp3" autoPlay loop />
    </div>
  );
};

export default ReceivCallBlock;
