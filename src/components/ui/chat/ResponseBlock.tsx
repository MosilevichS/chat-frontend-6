import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import closeCall from "@/src/assets/icons/close-call.svg";
import fullScreen from "@/src/assets/icons/full-screen.svg";
import callEnd from "@/src/assets/icons/call-end.svg";
import video from "@/src/assets/icons/video.svg";
import removeSound from "@/src/assets/icons/remove-sound.svg";
// import onSound from "@/src/assets/icons/on-sound.svg";
import bigAvatar from "@/src/assets/icons/big-avatar.svg";
import callActive from "@/src/assets/icons/call-active.svg";

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

interface ResponseBlockProps {
  data: CallData;
  isSound: boolean;
  remoteStream: MediaStream;
  toggleSound: () => void;
  handleEndCall: () => void;
  callState: string;
  cleanupConnection: () => void;
}

const ResponseBlock = ({
  data,
  remoteStream,
  toggleSound,
  isSound,
  handleEndCall,
  callState,
  cleanupConnection,
}: ResponseBlockProps) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);

  // Время начала звонка
  const callStartTimeRef = useRef<number | null>(null);
  // Храним интервал для очистки
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [dots, setDots] = useState([
    { size: 6, opacity: 1 },
    { size: 5, opacity: 0.7 },
    { size: 4, opacity: 0.4 },
  ]);

  // Форматирование времени в MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  };

  console.log(callState);

  useEffect(() => {
    if (callState === "connected") {
      callStartTimeRef.current = Date.now(); // фиксируем время начала разговора
      durationIntervalRef.current = setInterval(() => {
        if (callStartTimeRef.current) {
          const currentDuration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
          setCallDuration(currentDuration);
        }
      }, 1000);
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log(remoteVideoRef.current.srcObject);
    }

    if (callState === "end" && durationIntervalRef.current !== null) {
      clearInterval(durationIntervalRef.current);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      callStartTimeRef.current = null;
    };
  }, [callState]);

  useEffect(() => {
    let swapIndex = 0;
    const interval = setInterval(() => {
      setDots(prev => {
        const newDots = [...prev];
        // Меняем текущую точку со следующей (с циклом)
        const nextIndex = (swapIndex + 1) % prev.length;
        [newDots[swapIndex], newDots[nextIndex]] = [newDots[nextIndex], newDots[swapIndex]];
        swapIndex = nextIndex;
        return newDots;
      });
    }, 300);

    return () => {
      clearInterval(interval);
      cleanupConnection();
    };
  }, []);

  return (
    <div
      className={`absolute inset-0 z-50 mx-auto mt-[84px] flex flex-col items-center justify-between  rounded-lg bg-(--color-violet-dark) p-5 mb-1
          ${isFullScreen ? "max-w-[1200px] mb-1" : "w-[388px] max-h-[770px]"} 
          `}
    >
      <div className="w-full flex justify-between">
        <button onClick={() => setIsFullScreen(!isFullScreen)}>
          <Image src={fullScreen} alt="Полный экран" width={36} height={36} />
        </button>
        <button onClick={handleEndCall}>
          <Image src={closeCall} alt="Закрыть окно" width={36} height={36} />
        </button>
      </div>
      <div className="flex flex-col items-center text-white h-[310px]">
        <video ref={remoteVideoRef} className="hidden" id="video" autoPlay controls />
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
        <p className="text-2xl font-medium mb-2">
          {data.message_rtc.from_user.first_name} {data.message_rtc.from_user.last_name}
        </p>

        {callState === "connecting" && (
          <div className="flex items-center gap-x-1 h-[24px]">
            <p>Соединение</p>
            <div className="flex gap-0.5 w-[20px] h-[6px] mt-1">
              {dots.map((dot, index) => (
                <div
                  key={index}
                  className="bg-white rounded-full my-auto transition-all duration-300"
                  style={{
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    opacity: dot.opacity,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {callState === "connected" && (
          <div className="flex gap-x-1">
            <Image src={callActive} alt="Идет звонок" width={14} height={14} />
            <p>{formatDuration(callDuration)}</p>
          </div>
        )}

        {callState === "end" && (
          <div className="flex flex-col items-center">
            <p>Звонок завершен</p>
            {formatDuration(callDuration)}
          </div>
        )}

        {callState === "error" && <div>Ошибка соединения</div>}
      </div>
      <div className="flex gap-x-4 text-white text-xs font-normal">
        <button className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]">
          <Image src={video} alt="Видео" width={36} height={36} />
          <p>Видео</p>
        </button>
        <button
          className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]"
          onClick={toggleSound}
        >
          {isSound ? (
            <Image src={removeSound} alt="Убрать звук" width={36} height={36} />
          ) : (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M36 18C36 27.9411 27.9411 36 18 36C8.05887 36 0 27.9411 0 18C0 8.05887 8.05887 0 18 0C27.9411 0 36 8.05887 36 18Z"
                fill="white"
              />
              <path
                d="M18.0001 20.3438C19.5563 20.3438 20.8126 19.0875 20.8126 17.5312V11.9063C20.8126 10.35 19.5563 9.09375 18.0001 9.09375C16.4438 9.09375 15.1876 10.35 15.1876 11.9063V17.5312C15.1876 19.0875 16.4438 20.3438 18.0001 20.3438ZM17.0626 11.9063C17.0626 11.3906 17.4845 10.9688 18.0001 10.9688C18.5157 10.9688 18.9376 11.3906 18.9376 11.9063V17.5312C18.9376 18.0469 18.5157 18.4688 18.0001 18.4688C17.4845 18.4688 17.0626 18.0469 17.0626 17.5312V11.9063ZM22.6876 17.5312C22.6876 20.1187 20.5876 22.2188 18.0001 22.2188C15.4126 22.2188 13.3126 20.1187 13.3126 17.5312H11.4376C11.4376 20.8406 13.8845 23.5594 17.0626 24.0188V26.9062H18.9376V24.0188C22.1157 23.5594 24.5626 20.8406 24.5626 17.5312H22.6876Z"
                fill="#7769E1"
              />
              <line
                x1="11.0992"
                y1="11.9793"
                x2="24.0992"
                y2="25.9793"
                stroke="#7769E1"
                strokeWidth="3"
              />
              <path d="M11.2969 10.3203L25.2969 25.3203" stroke="white" strokeWidth="2" />
            </svg>
          )}

          <p>{isSound ? "Убрать звук" : "Вкл. звук"}</p>
        </button>
        <button
          className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]"
          onClick={handleEndCall}
        >
          <Image src={callEnd} alt="Завершить" width={36} height={36} />
          <p>Завершить</p>
        </button>
      </div>
    </div>
  );
};

export default ResponseBlock;
