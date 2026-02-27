import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import closeCall from "@/src/assets/icons/close-call.svg";
import fullScreen from "@/src/assets/icons/full-screen.svg";
import callEnd from "@/src/assets/icons/call-end.svg";
import video from "@/src/assets/icons/video.svg";
import removeSound from "@/src/assets/icons/remove-sound.svg";
// import onSound from "@/src/assets/icons/on-sound.svg";
import bigAvatar from "@/src/assets/icons/big-avatar.svg";
import { useGetCallQuery } from "@/src/services/callApi";
import type { IContact } from "@/src/types/contact";
import { getSocket } from "@/src/services/socketService";
import type { IUser } from "@/src/types/user";
import type { SignalingMessage } from "@/src/types/calls";

interface CallBlockProps {
  setIsCallModalOpen: (isCallModalOpen: boolean) => void;
  data: IContact;
  profile: IUser;
}

const CallBlock = ({ setIsCallModalOpen, data, profile }: CallBlockProps) => {
  const [callState, setCallState] = useState<"connecting" | "connected" | "end" | "error">(
    "connecting",
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSound, setIsSound] = useState(true);
  const [dots, setDots] = useState([
    { size: 6, opacity: 1 },
    { size: 5, opacity: 0.7 },
    { size: 4, opacity: 0.4 },
  ]);

  const { data: stunAndTurnServers } = useGetCallQuery();
  // Время звонка
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null); // Храним интервал для очистки
  const [callDuration, setCallDuration] = useState<number>(0);

  // Очистка таймера при размонтировании компонента
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  //  проверка есть ли разрешение на доступ к камере и микрофону пользователя
  const checkPermissions = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({
        name: "camera",
      });
      const microphonePermission = await navigator.permissions.query({
        name: "microphone",
      });

      if (cameraPermission.state === "denied" || microphonePermission.state === "denied") {
        alert("Для звонка нужно разрешить доступ к камере и микрофону в настройках браузера");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Не удалось проверить разрешения:", error);
      return false;
    }
  };

  // запрашиваем у пользователя разрешение на доступ к медиаустройствам (микрофону, камере) и возвращаем медиапоток
  const getMediaAccess = async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Доступ к устройствам получен");
      return stream;
    } catch (error) {
      console.log("Ошибка доступа к устройствам:", error);
    }
  };

  // Форматирование времени в MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString()}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerCall = async (
    pc: RTCPeerConnection | null,
    data: Extract<SignalingMessage, { action: "answer_call" }>,
  ) => {
    if (!pc) {
      console.warn("RTCPeerConnection не инициализирован");
      return;
    }

    try {
      await pc.setRemoteDescription({
        type: "answer", // Правильно: "answer" для ответа
        sdp: data.object.answer_sdp, // Правильно: берём из answer_sdp
      });
      await processIceCandidateBuffer(pc);
      console.log("Удаленное описание (answer) успешно установлено", pc);
      setCallState("connected");
    } catch (error) {
      console.error("Ошибка установки remoteDescription для answer:", error);
      setCallState("error");
    }
  };

  const handleIceCandidate = async (pc: RTCPeerConnection, candidateStr: string) => {
    const iceCandidate = new RTCIceCandidate({
      candidate: candidateStr,
      sdpMid: "0", // Явно указываем медиалинию (обычно '0' для аудио)
      sdpMLineIndex: 0,
    });

    if (pc.remoteDescription) {
      // remoteDescription есть — можно добавить кандидата
      await pc.addIceCandidate(iceCandidate);
      console.log("ICE‑кандидат добавлен");
    } else {
      // remoteDescription нет — кладём в буфер
      iceCandidateBuffer.current.push(iceCandidate);
      console.log("ICE‑кандидат буферизован");
    }
  };

  // берем все кандидаты из буфера и добавляем их
  const processIceCandidateBuffer = async (pc: RTCPeerConnection) => {
    for (const candidate of iceCandidateBuffer.current) {
      await pc.addIceCandidate(candidate);
    }
    iceCandidateBuffer.current = []; // очищаем буфер после обработки
  };

  // Функция для отправки сообщения через сигнальный сервер собеседнику
  const sendToSignalingServer = (message: SignalingMessage) => {
    console.log("Отправка через сигнальный сервер:", message);

    const ws = getSocket();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS not ready");
      return;
    }

    ws.send(JSON.stringify(message));
  };

  // завершаем звонок
  const handleEndCall = () => {
    try {
      // 1. Закрываем WebRTC‑соединение
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // 2. Останавливаем локальный медиапоток
      const localVideo = document.getElementById("local-video") as HTMLVideoElement;
      if (localVideo && localVideo.srcObject) {
        (localVideo.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
      }

      // 3. Отправляем сигнал о завершении звонка через WebSocket
      sendToSignalingServer({
        action: "call_completion",
        request_uid: uuidv4(),
        object: {
          from_user_uid: profile.uid,
          to_user_uid: data.uid,
          type_complete: "completed",
          message_rtc_uid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          duration: callDuration,
        },
      });

      // 4. Сбрасываем состояния
      setCallState("end");
      console.log("Звонок завершён, ресурсы освобождены");
      console.log(`Звонок завершён, длительность: ${formatDuration(callDuration)}`);
    } catch (error) {
      console.error("Ошибка при завершении звонка:", error);
    }
  };

  useEffect(() => {
    if (!stunAndTurnServers?.ice_servers?.length) {
      console.log("ICE‑серверы ещё не загружены");
      return;
    }

    console.log("Получены ICE‑серверы:", stunAndTurnServers);
    let localStream: MediaStream | null = null;

    const initCall = async () => {
      try {
        const hasPermissions = await checkPermissions();
        if (!hasPermissions) return;

        const pc = new RTCPeerConnection({
          iceServers: stunAndTurnServers.ice_servers,
        });
        peerConnectionRef.current = pc;
        console.log("RTCPeerConnection создан успешно");

        pc.ontrack = event => {
          console.log("Получен удалённый медиапоток");

          const remoteVideo = document.getElementById("remote-video") as HTMLVideoElement | null;
          console.log("remoteVideo:", remoteVideo);
          if (remoteVideo) remoteVideo.srcObject = event.streams[0];
        };

        // При нахождении кандидата срабатывает обработчик pc.onicecandidate кандидат отправляется другому участнику через сигнальный сервер:
        pc.onicecandidate = event => {
          if (event.candidate) {
            console.log("Найден ICE‑кандидат:", event.candidate);
            sendToSignalingServer({
              action: "ice_candidate",
              request_uid: uuidv4(), // генерируем новый UUID для этого сообщения
              object: {
                from_user_uid: profile.uid, // ID текущего пользователя
                to_user_uid: data.uid, // ID получателя
                ice_candidate: event.candidate.candidate, // строковое представление кандидата
              },
            });
          } else {
            console.log("Cбор кандидатов завершён");
          }
        };
        // Обработка состояния соединения
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          console.log("Состояние соединения изменилось:", state);

          switch (state) {
            case "connected":
              setCallState("connected");
              console.log("✅ Соединение установлено успешно!");
              callStartTimeRef.current = Date.now(); // фиксируем время начала разговора
              durationIntervalRef.current = setInterval(() => {
                if (callStartTimeRef.current) {
                  const currentDuration = Math.floor(
                    (Date.now() - callStartTimeRef.current) / 1000,
                  );
                  setCallDuration(currentDuration);
                }
              }, 1000);
              break;
            case "failed":
              setCallState("error");
              console.error("❌ Соединение не удалось установить. Проверьте сеть и ICE‑серверы.");
              break;
            case "disconnected":
              console.warn("⚠️ Временное отключение. Пытаемся восстановить соединение...");
              break;
            case "closed":
              setCallState("end");
              console.log("📞 Соединение закрыто.");
              break;
            default:
              // "new", "connecting" — ожидаем
              console.log(`⏱️ Текущее состояние: ${state}`);
          }
        };

        localStream = await getMediaAccess({ audio: true, video: false });
        console.log("Локальный поток:", localStream);
        console.log("Аудиодорожки:", localStream?.getAudioTracks());
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        const localVideo = document.getElementById("local-video");
        if (localVideo) localVideo.srcObject = localStream;

        // Шаг 1: создаём и отправляем offer тому, кому хотим позвонить
        const offer = await pc.createOffer();
        console.log("SDP offer:", offer.sdp);
        await pc.setLocalDescription(offer);

        if (!offer.sdp) {
          console.error("SDP offer не содержит данных");
          setCallState("error");
          return;
        }
        sendToSignalingServer({
          action: "offer_call",
          request_uid: uuidv4(),
          object: {
            to_user_uid: data.uid,
            offer_sdp: offer.sdp,
          },
        });

        // Обработчик входящих сообщений WebSocket
        const ws = getSocket();
        ws.onmessage = async (event: MessageEvent) => {
          try {
            const data: SignalingMessage = JSON.parse(event.data);

            switch (data.action) {
              case "answer_call":
                await handleAnswerCall(peerConnectionRef.current, data);
                break;
              case "ice_candidate":
                if (data.object.ice_candidate) {
                  await handleIceCandidate(pc, data.object.ice_candidate);
                }
                break;
              default:
                console.log("Неизвестное действие:", data.action);
            }
          } catch (error) {
            console.error("Ошибка обработки сигнального сообщения:", error);
          }
        };
      } catch (error) {
        console.error("Критическая ошибка инициализации звонка:", error);
      }
    };

    initCall();

    return () => {
      // Очистка WebSocket-обработчиков
      const ws = getSocket();
      ws.onmessage = null;

      // Остановка медиапотока
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Закрытие RTCPeerConnection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      console.log("Ресурсы звонка освобождены");
    };
  }, [stunAndTurnServers]);

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

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`absolute inset-0 z-50 mx-auto mt-[84px] flex flex-col items-center justify-between  rounded-lg bg-(--color-violet-dark) p-5
        ${isFullScreen ? "max-w-[1200px] mb-1" : "w-[388px] max-h-[770px]"} video-element remote
        `}
    >
      <div className="w-full flex justify-between">
        <button onClick={() => setIsFullScreen(!isFullScreen)}>
          <Image src={fullScreen} alt="Полный экран" width={36} height={36} />
        </button>
        <button onClick={() => setIsCallModalOpen(false)}>
          <Image src={closeCall} alt="Закрыть окно" width={36} height={36} />
        </button>
      </div>
      <div className="flex flex-col items-center text-white">
        <audio className="hidden" id="remote-video" autoPlay controls />
        <div className="flex justify-center items-center h-[184px] w-[184px] mb-[32px]">
          {data.avatar_url ? (
            <div className="relative">
              <Image
                src={data.avatar_url}
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
          {data.first_name} {data.last_name}
        </p>

        {callState === "connected" && <div>{formatDuration(callDuration)}</div>}
        {callState === "end" && (
          <div className="flex flex-col items-center">
            <p>Звонок завершен</p>
            {formatDuration(callDuration)}
          </div>
        )}
        {callState === "error" && <div>Ошибка соединения</div>}

        {callState === "connecting" && (
          <div className="flex items-center gap-x-1 h-[24px]">
            <p>Звонок</p>
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
            </div>{" "}
          </div>
        )}
      </div>
      <div className="flex gap-x-4 text-white text-xs font-normal">
        <button className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]">
          <Image src={video} alt="Завершить" width={36} height={36} />
          <p>Видео</p>
        </button>
        <button
          className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]"
          onClick={() => setIsSound(!isSound)}
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
                stroke-width="3"
              />
              <path d="M11.2969 10.3203L25.2969 25.3203" stroke="white" stroke-width="2" />
            </svg>
          )}

          <p>{isSound ? "Убрать звук" : "Вкл. звук"}</p>
        </button>
        <button
          className="flex flex-col items-center gap-y-1 w-[68px] h-[54px]"
          onClick={() => handleEndCall()}
        >
          <Image src={callEnd} alt="Завершить" width={36} height={36} />
          <p>Завершить</p>
        </button>
      </div>
    </div>
  );
};

export default CallBlock;
