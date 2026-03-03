import { useState, useRef, useEffect, useCallback } from "react";
import { useGetCallQuery } from "@/src/services/callApi";
import type { SignalingMessage } from "../types/calls";
import { getSocket } from "../services/socketService";
import { v4 as uuidv4 } from "uuid";
import { useDelayedAction } from "./useDelayedAction ";

export const useCallLogic = () => {
  // Состояния
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [isSound, setIsSound] = useState(true);
  // показываем или нет блок ответа
  const [isResponse, setIsResponse] = useState(false);
  // данные для хранения информации о звонящем
  const [callInfo, setCallInfo] = useState(null);
  const [callState, setCallState] = useState("");

  // Рефы
  // мой звук
  const localStreamRef = useRef<MediaStream | undefined>(undefined);
  // удаленный звук
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // накапливаем потенциальный сетевые маршрут (адрес + порт), по которому два устройства могут установить прямое соединение через WebRTC, пока нету данных чтобы их отправить
  const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);

  const { data: stunAndTurnServers } = useGetCallQuery();
  const { executeAfterDelay } = useDelayedAction(2000);

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
  const handleIncomingCall = (callData: any) => {
    setCallInfo(callData.object);
    setIncomingCall(true);
  };

  // Обрабатываем входящий вызов
  const handleIncomingOffer = async (
    pc: RTCPeerConnection,
    message: Extract<SignalingMessage, { action: "offer_call" }>,
  ) => {
    try {
      // Устанавливаем удалённое описание из offer
      await pc.setRemoteDescription({
        type: "offer",
        sdp: message.object.offer_sdp,
      });

      // Передаём данные в функцию показа окна
      handleIncomingCall(message);
    } catch (error) {
      console.error("Ошибка при обработке входящего звонка:", error);
      setCallState("error");
    }
  };

  // Отклонить вызов
  const handleRejectCall = useCallback(() => {
    console.log("callInfo:", callInfo);

    sendToSignalingServer({
      action: "call_completion",
      request_uid: uuidv4(),
      object: {
        from_user_uid: callInfo.from_user,
        to_user_uid: callInfo.to_user,
        type_complete: "rejected",
        message_rtc_uid: uuidv4(),
      },
    });

    setIncomingCall(false);
  }, [callInfo, sendToSignalingServer]);

  // Включение/выключение звука
  const toggleSound = useCallback(() => {
    setIsSound(prev => !prev);

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
  }, [isSound]);

  // Завершение звонка
  const handleEndCall = () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = undefined;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Очищаем буфер ICE‑кандидатов
      iceCandidateBuffer.current = [];

      executeAfterDelay(() => {
        setIsResponse(false);
      });
    } catch (error) {
      console.error("Ошибка при завершении звонка:", error);
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

  // Принять вызов
  const handleAcceptCall = useCallback(async () => {
    console.log("Вызов принят");
    console.log("Ответ на звонок отправлен");

    if (peerConnectionRef.current === null) return;

    try {
      localStreamRef.current = await getMediaAccess({ audio: true, video: false });

      if (localStreamRef.current) {
        const stream = localStreamRef.current;
        stream.getTracks().forEach(track => peerConnectionRef.current!.addTrack(track, stream));
      }

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      sendToSignalingServer({
        action: "answer_call",
        request_uid: uuidv4(),
        object: {
          from_user_uid: callInfo.from_user,
          to_user_uid: callInfo.to_user,
          answer_sdp: answer.sdp,
        },
      });

      setIsResponse(true);
      setIncomingCall(false);
    } catch (error) {
      console.error("Ошибка при принятии звонка:", error);
      setCallState("error");
    }
  }, [callInfo, sendToSignalingServer]);

  const checkPermissions = useCallback(async () => {
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
  }, []);

  // Обработка буфера при обновлении callInfo
  useEffect(() => {
    const buffered = [...iceCandidateBuffer.current];
    iceCandidateBuffer.current = [];
    buffered.forEach(candidate => {
      sendToSignalingServer({
        action: "ice_candidate",
        request_uid: uuidv4(),
        object: {
          from_user_uid: callInfo?.from_user,
          to_user_uid: callInfo?.to_user,
          ice_candidate: candidate.candidate,
        },
      });
    });
  }, [callInfo, sendToSignalingServer]);

  const handleIceCandidate = async (pc: RTCPeerConnection, candidateStr: string) => {
    try {
      const iceCandidate = new RTCIceCandidate({
        candidate: candidateStr,
        sdpMid: "0",
        sdpMLineIndex: 0,
      });

      await pc.addIceCandidate(iceCandidate);
      console.log("ICE‑кандидат успешно добавлен:");
    } catch (error) {
      console.error("Критическая ошибка добавления ICE‑кандидата:", {
        candidateStr,
        hasRemoteDescription: !!pc.remoteDescription,
        error: error.message,
      });
    }
  };

  useEffect(() => {
    if (!stunAndTurnServers?.ice_servers?.length) {
      return;
    }

    const initCall = async () => {
      try {
        const hasPermissions = await checkPermissions();
        if (!hasPermissions) return;

        // создание экземпляра объекта RTCPeerConnection для организации P2P‑соединения между браузерами.
        const pc = new RTCPeerConnection({
          iceServers: stunAndTurnServers.ice_servers,
        });
        peerConnectionRef.current = pc;
        console.log("RTCPeerConnection создан успешно");

        pc.ontrack = event => {
          console.log("Получен удалённый медиапоток", event.streams[0]);
          setRemoteStream(event.streams[0]);

          // Сохраняем удалённый поток в ref
          remoteStreamRef.current = event.streams[0];

          // Применяем текущее состояние звука к удалённому потоку
          if (remoteStreamRef.current) {
            remoteStreamRef.current.getAudioTracks().forEach(track => {
              track.enabled = isSound;
            });
          }
        };

        pc.onicecandidate = event => {
          if (event.candidate) {
            console.log("Найден ICE‑кандидат:", event.candidate);
            pc.onicecandidate = event => {
              if (event.candidate) {
                const fromUserUid = callInfo?.from_user;
                const toUserUid = callInfo?.to_user;

                if (fromUserUid && toUserUid) {
                  // Если все данные есть — отправляем сразу
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
                  // // Иначе буферизуем
                  iceCandidateBuffer.current.push(event.candidate);
                  console.log("Буферизуем ICE‑кандидат (callInfo не готов)");
                }
              } else {
                console.log("Сбор ICE‑кандидатов завершён");
              }
            };
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
              break;
            case "failed":
              setCallState("error");
              console.error("❌ Соединение не удалось установить. Проверьте сеть и ICE‑серверы.");
              break;
            case "disconnected":
              console.warn("⚠️ Временное отключение. Пытаемся восстановить соединение...");
              setIncomingCall(false);
              break;
            case "closed":
              setCallState("callend");
              console.log("📞 Соединение закрыто.");
              break;
            default:
              // "new", "connecting" — ожидаем
              console.log(`⏱️ Текущее состояние: ${state}`);
          }
        };

        // Обработчик входящих сообщений WebSocket
        const ws = getSocket();
        if (ws !== null) {
          ws.onmessage = async (event: MessageEvent) => {
            try {
              const data: SignalingMessage = JSON.parse(event.data);

              switch (data.action) {
                case "offer_call":
                  setCallInfo(data.object);
                  // Обрабатываем входящий вызов
                  await handleIncomingOffer(pc, data);
                  break;
                case "ice_candidate":
                  if (data.object.ice_candidate) {
                    await handleIceCandidate(pc, data.object.ice_candidate);
                  }
                  break;
                // case "answer_call":
                //   // Устанавливаем ответ от звонящего
                //   await pc.setRemoteDescription({
                //     type: "answer",
                //     sdp: data.object.answer_sdp,
                //   });
                //   setCallState("connected");
                //   break;
                default:
                  console.log("Неизвестное действие:", data.action);
              }
            } catch (error) {
              console.error("Ошибка обработки сигнального сообщения:", error);
            }
          };
        }
      } catch (error) {
        console.error("Критическая ошибка инициализации звонка:", error);
      }
    };

    initCall();

    return () => {
      // Очистка WebSocket-обработчиков
      const ws = getSocket();
      if (ws !== null) {
        ws.onmessage = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      console.log("Ресурсы звонка освобождены");
    };
  }, [stunAndTurnServers]);

  return {
    // Состояния
    remoteStream,
    incomingCall,
    isSound,
    isResponse,
    callInfo,
    callState,

    // Функции
    handleIncomingCall,
    handleRejectCall,
    toggleSound,
    handleEndCall,
    handleAcceptCall,
    setIsResponse,
  };
};
