import { useState, useRef, useEffect, useCallback } from "react";
import { useGetCallQuery } from "@/src/services/callApi";
import type { SignalingMessage } from "../types/calls";
import { getSocket } from "../services/socketService";
import { v4 as uuidv4 } from "uuid";
import { useDelayedAction } from "./useDelayedAction ";

interface CallInfo {
  from_user: string;
  to_user: string;
  message_rtc: {
    uid: string;
    from_user?: { avatar_url?: string; first_name: string; last_name: string };
  };
  offer_sdp?: string;
}

interface IncomingCallData {
  object: CallInfo;
}

export const useCallLogic = (isCallModalOpen: boolean) => {
  // Состояния
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // const [sdp, setSdp] = useState("");
  const sdpRef = useRef<string>("");

  const [incomingCall, setIncomingCall] = useState(false);
  const [isSound, setIsSound] = useState(true);
  // показываем или нет блок ответа
  const [isResponse, setIsResponse] = useState(false);
  // данные для хранения информации о звонке
  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [callState, setCallState] = useState<
    "connecting" | "connected" | "end" | "error" | "rejected"
  >("connecting");
  // Новые состояния для видео
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Рефы
  // мой звук
  const localStreamRef = useRef<MediaStream | undefined>(undefined);
  // удаленный стрим
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // накапливаем потенциальный сетевые маршрут (адрес + порт), по которому два устройства могут установить прямое соединение через WebRTC, пока нету данных чтобы их отправить
  const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);

  const { data: stunAndTurnServers } = useGetCallQuery();
  const { executeAfterDelay } = useDelayedAction(2000);

  // Обработчик входящих сообщений WebSocket
  const setupWebSocketHandlers = () => {
    const ws = getSocket();
    if (ws === null) return;

    ws.onmessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.action) {
          // пришел вызов
          case "offer_call":
            if (sdpRef.current === "") {
              await handleIncomingOffer(data);
              // Передаём данные в функцию показа окна (ответить на звонок да нет)
              handleIncomingCall(data);
              console.log("Первый offer_call");
              sdpRef.current = data.object.offer_sdp;
            } else {
              console.log(" не Первый offer_call");

              await peerConnectionRef.current?.setRemoteDescription({
                type: "offer",
                sdp: data.object.offer_sdp,
              });
              const answer = await peerConnectionRef.current?.createAnswer();
              await peerConnectionRef.current?.setLocalDescription(answer);

              sendToSignalingServer({
                action: "answer_call",
                request_uid: uuidv4(),
                object: {
                  from_user_uid: data.object.from_user,
                  to_user_uid: data.object.to_user,
                  answer_sdp: answer?.sdp as string,
                },
              });
            }

            break;
          case "ice_candidate":
            if (data.object.ice_candidate && peerConnectionRef.current) {
              await handleIceCandidate(peerConnectionRef.current, data.object.ice_candidate);
            }
            break;
          case "call_completion":
            if (data.object?.type_complete === "completed") {
              setIncomingCall(false);
              setCallState("end");
              executeAfterDelay(() => {
                setIsResponse(false);
                setCallState("connecting");
                cleanupConnection();
              });
            }

            break;
          default:
          // console.log("Неизвестное действие:", data.action);
        }
      } catch (error) {
        console.error("Ошибка обработки сигнального сообщения:", error);
      }
    };
  };

  //  Инициализация соединения
  const initializePeerConnection = async (): Promise<RTCPeerConnection | null> => {
    if (!stunAndTurnServers?.ice_servers?.length) {
      // console.warn("STUN/TURN серверы не загружены");
      return null;
    }

    console.log("Инициализация PeerConnection");

    try {
      const pc = new RTCPeerConnection({
        iceServers: stunAndTurnServers.ice_servers,
      });

      // Настраиваем обработчик получения треков
      pc.ontrack = event => {
        const stream = event.streams[0];

        stream.onremovetrack = e => {
          if (e.track.kind === "video") {
            setHasRemoteVideo(false);
          }
        };

        // Проверяем, что есть хотя бы один поток
        if (!event.streams || event.streams.length === 0) {
          console.warn("ontrack: нет потоков в событии");
          return;
        }

        // Ищем существующий объединённый поток или создаём новый
        let combinedStream = remoteStreamRef.current;

        if (!combinedStream) {
          combinedStream = new MediaStream();
          remoteStreamRef.current = combinedStream;
        }

        // Обрабатываем все потоки из события
        event.streams.forEach(incomingStream => {
          incomingStream.getTracks().forEach(track => {
            // Определяем тип трека
            if (track.kind === "video") {
              // Удаляем все существующие видео‑треки из объединённого потока
              const existingVideoTracks = combinedStream
                .getTracks()
                .filter(t => t.kind === "video");

              existingVideoTracks.forEach(oldTrack => {
                combinedStream.removeTrack(oldTrack);
              });

              // Добавляем новый видео‑трек
              combinedStream.addTrack(track);

              setHasRemoteVideo(true);
            } else {
              // Для аудио‑треков сохраняем логику добавления без замены
              const existingTrack = combinedStream.getTracks().find(t => t.id === track.id);
              if (!existingTrack) {
                combinedStream.addTrack(track);
              }
            }
          });
        });

        // Обновляем состояние
        setRemoteStream(combinedStream);

        console.log(combinedStream.getTracks());

        if (combinedStream.getTracks().length >= 2) {
          setHasRemoteVideo(true);
        }

        // Применяем текущее состояние звука ко всем аудио‑трекам
        combinedStream.getAudioTracks().forEach(track => {
          track.enabled = isSound;
        });
      };

      pc.onicecandidate = event => {
        if (event.candidate) {
          const fromUserUid = callInfo?.from_user;
          const toUserUid = callInfo?.to_user;

          if (fromUserUid && toUserUid) {
            sendToSignalingServer({
              action: "ice_candidate",
              request_uid: uuidv4(),
              object: {
                from_user_uid: fromUserUid,
                to_user_uid: toUserUid,
                ice_candidate: event.candidate.candidate,
              },
            });
          } else {
            iceCandidateBuffer.current.push(event.candidate);
            console.log("Буферизуем ICE‑кандидат (callInfo не готов)");
          }
        } else {
          console.log("Сбор ICE‑кандидатов завершён");
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log("Состояние соединения изменилось:", state);

        switch (state) {
          case "connected":
            setCallState("connected");
            break;
          case "failed":
            setCallState("error");
            break;
          case "disconnected":
            console.warn("Временное отключение. Пытаемся восстановить соединение...");
            break;
          case "closed":
            setCallState("end");
            console.log("Соединение закрыто.");
            break;
          default:
            console.log(`Текущее состояние: ${state}`);
        }
      };

      return pc;
    } catch (error) {
      console.error("Ошибка создания RTCPeerConnection:", error);
      return null;
    }
  };

  // Завершение звонка
  const handleEndCall = () => {
    try {
      // Останавливаем локальный медиапоток
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = undefined;
      }

      // Закрываем соединение и сбрасываем ref
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Очищаем буфер ICE‑кандидатов
      iceCandidateBuffer.current = [];

      // Отправляем сигнал о завершении звонка
      if (callInfo) {
        sendToSignalingServer({
          action: "call_completion",
          request_uid: uuidv4(),
          object: {
            from_user_uid: callInfo.from_user,
            to_user_uid: callInfo.to_user,
            type_complete: "completed",
            message_rtc_uid: callInfo.message_rtc.uid,
          },
        });
      }

      // Сбрасываем все состояния
      executeAfterDelay(() => {
        setIsResponse(false);
        setIncomingCall(false);
        setCallInfo(null);
      });

      setCallState("end");
    } catch (error) {
      console.error("Ошибка при завершении звонка:", error);
    }
  };

  // Обрабатываем входящий вызов
  const handleIncomingOffer = async (
    message: Extract<SignalingMessage, { action: "offer_call" }>,
  ) => {
    // Если соединение закрыто или отсутствует, создаём новое
    if (!peerConnectionRef.current || peerConnectionRef.current.signalingState === "closed") {
      const newPc = await initializePeerConnection();
      if (!newPc) return;
      peerConnectionRef.current = newPc;
    }

    const pc = peerConnectionRef.current;

    if (pc.signalingState === "closed") {
      console.warn("Пропускаем setRemoteDescription — соединение закрыто");
      return;
    }

    try {
      // Устанавливаем удалённое описание из offer
      await pc.setRemoteDescription({
        type: "offer",
        sdp: message.object.offer_sdp,
      });
    } catch (error) {
      console.error("Ошибка при обработке входящего звонка:", error);
      setCallState("error");
    }
  };

  // Принять вызов
  const handleAcceptCall = async () => {
    console.log("Вызов принят");
    console.log("Ответ на звонок отправлен");

    if (peerConnectionRef.current === null) return;

    try {
      localStreamRef.current = await getMediaAccess({
        audio: true,
        // video: true,
      });

      if (localStreamRef.current) {
        const stream = localStreamRef.current;
        stream.getTracks().forEach(track => peerConnectionRef.current!.addTrack(track, stream));
        setLocalStream(stream);
      }

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      if (callInfo) {
        sendToSignalingServer({
          action: "answer_call",
          request_uid: uuidv4(),
          object: {
            from_user_uid: callInfo.from_user,
            to_user_uid: callInfo.to_user,
            answer_sdp: answer.sdp as string,
          },
        });
      }

      setIsResponse(true);
      setIncomingCall(false);
    } catch (error) {
      console.error("Ошибка при принятии звонка:", error);
      setCallState("error");
    }
  };

  // Функция отправки сообщений через сигнальный сервер
  const sendToSignalingServer = useCallback((message: SignalingMessage) => {
    const ws = getSocket();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS not ready");
      return;
    }
    ws.send(JSON.stringify(message));
  }, []);

  // Показываем модальное окно для принятия вызова
  const handleIncomingCall = (callData: IncomingCallData) => {
    setCallInfo(callData.object);
    setIncomingCall(true);
  };

  // Отклонить вызов
  const handleRejectCall = () => {
    if (callInfo) {
      sendToSignalingServer({
        action: "call_completion",
        request_uid: uuidv4(),
        object: {
          from_user_uid: callInfo.from_user,
          to_user_uid: callInfo.to_user,
          type_complete: "rejected",
          message_rtc_uid: callInfo.message_rtc.uid,
        },
      });
    }
    cleanupConnection();
    setIncomingCall(false);
  };

  // Включение/выключение звука
  const toggleSound = () => {
    setIsSound(!isSound);

    const streamRemote = remoteStreamRef.current;
    if (streamRemote) {
      streamRemote.getAudioTracks().forEach(track => {
        track.enabled = !isSound;
      });
      console.log(`Звук удалённого потока ${isSound ? "выключен" : "включён"}`);
    }

    const streamLocal = localStreamRef.current;
    if (streamLocal) {
      streamLocal.getAudioTracks().forEach(track => {
        track.enabled = !isSound;
      });
      console.log(`Локальный звук ${isSound ? "выключен" : "включён"}`);
    }
  };

  const getMediaAccess = useCallback(async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Доступ к устройствам получен");
      return stream;
    } catch (error) {
      console.log("Ошибка доступа к устройствам:", error);
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      // const cameraPermission = await navigator.permissions.query({
      //   name: "camera",
      // });
      const microphonePermission = await navigator.permissions.query({
        name: "microphone",
      });

      if (
        // cameraPermission.state === "denied"
        // ||
        microphonePermission.state === "denied"
      ) {
        alert("Для звонка нужно разрешить доступ к камере и микрофону в настройках браузера");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Не удалось проверить разрешения:", error);
      return false;
    }
  }, []);

  // Обработка буфера при обновлении callInfo
  useEffect(() => {
    const buffered = [...iceCandidateBuffer.current];
    iceCandidateBuffer.current = [];
    buffered.forEach(candidate => {
      if (callInfo) {
        sendToSignalingServer({
          action: "ice_candidate",
          request_uid: uuidv4(),
          object: {
            from_user_uid: callInfo?.from_user,
            to_user_uid: callInfo?.to_user,
            ice_candidate: candidate.candidate,
          },
        });
      }
    });
  }, [callInfo]);

  const handleIceCandidate = async (pc: RTCPeerConnection, candidateStr: string) => {
    if (!pc || pc.signalingState === "closed") {
      console.warn("Соединение закрыто, пропускаем ICE‑кандидат");
      return;
    }
    try {
      const iceCandidate = new RTCIceCandidate({
        candidate: candidateStr,
        sdpMid: "0",
        sdpMLineIndex: 0,
      });

      await pc.addIceCandidate(iceCandidate);
    } catch (error) {
      console.error("Критическая ошибка добавления ICE‑кандидата:", error);
    }
  };

  // функция очистки
  const cleanupConnection = () => {
    // 1. Останавливаем локальный медиапоток
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = undefined;
      console.log("Локальный медиапоток остановлен");
    }
    setHasRemoteVideo(false);
    sdpRef.current = "";

    // setRemoteStream(null);
    if (remoteStream) {
      console.log("очистка удаленного стрима");

      remoteStream.getTracks().forEach(track => track.stop());
      const tracks = remoteStream.getTracks();
      tracks.forEach(track => remoteStream.removeTrack(track));
      setRemoteStream(null);
    }

    // 2. Останавливаем удалённый медиапоток
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
      setRemoteStream(null);
      console.log("Удаленный медиапоток остановлен");
    }

    // 3. Закрываем RTCPeerConnection
    if (peerConnectionRef.current) {
      // Отписываемся от всех событий перед закрытием
      const pc = peerConnectionRef.current;
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onsignalingstatechange = null;
      pc.oniceconnectionstatechange = null;

      // Закрываем соединение, если оно ещё открыто
      if (pc.signalingState !== "closed") {
        pc.close();
        console.log("RTCPeerConnection закрыт");
      }

      peerConnectionRef.current = null;
    }

    // 4. Очищаем буфер ICE‑кандидатов
    iceCandidateBuffer.current = [];
    console.log("Буфер ICE‑кандидатов очищен");

    // 6. Сбрасываем состояния
    setIncomingCall(false);
    setCallInfo(null);
    setIsResponse(false);
    setCallState("connecting");
    setIsSound(true);

    console.log("Очистка ресурсов завершена");
  };

  useEffect(() => {
    const initCall = async () => {
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) return;

      const pc = await initializePeerConnection();
      if (!pc) return;

      peerConnectionRef.current = pc;
      setupWebSocketHandlers();
    };

    initCall();
  }, [stunAndTurnServers, isCallModalOpen]);

  return {
    // Состояния
    remoteStream,
    localStream,
    incomingCall,
    isSound,
    isResponse,
    callInfo,
    callState,
    hasRemoteVideo,
    // Функции
    handleIncomingCall,
    handleRejectCall,
    toggleSound,
    handleEndCall,
    handleAcceptCall,
    setIsResponse,
    cleanupConnection,
  };
};
