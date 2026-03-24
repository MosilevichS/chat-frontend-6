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
    from_user: { avatar_url?: string; first_name: string; last_name: string };
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
  const [showVideo, setShowVideo] = useState(false);

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
  //Состояние для удаленного видео
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  // Рефы
  // мой звук
  const localStreamRef = useRef<MediaStream | undefined>(undefined);
  // удаленный стрим
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // накапливаем потенциальный сетевые маршрут (адрес + порт), по которому два устройства могут установить прямое соединение через WebRTC, пока нету данных чтобы их отправить
  const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);
  const callInfoRef = useRef<CallInfo | null>(null);
  const fromUserRef = useRef<string | null>(null);

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
            console.log(data);
            if (fromUserRef.current === null) {
              fromUserRef.current = data.object.from_user;
              console.log(fromUserRef.current);
            }
            console.log(peerConnectionRef.current?.signalingState);

            if (data.object.from_user === fromUserRef.current) {
              if (sdpRef.current === "") {
                await handleIncomingOffer(data);
                // Передаём данные в функцию показа окна (ответить на звонок или отклонить)
                handleIncomingCall(data);
                console.log("Первый offer_call");
                sdpRef.current = data.object.offer_sdp;
              } else {
                console.log("не Первый offer_call");

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
                    message_rtc_uid: data.object.message_rtc.uid,
                  },
                });
              }
            } else {
              console.log("От моего действия прилетает");
            }

            break;
          case "ice_candidate":
            if (data.object.ice_candidate && peerConnectionRef.current) {
              await handleIceCandidate(peerConnectionRef.current, data.object.ice_candidate);
            }
            break;
          case "answer_call":
            console.log(data);
            if (data.object.from_user !== fromUserRef.current) {
              await peerConnectionRef.current?.setRemoteDescription({
                type: "answer",
                sdp: data.object.answer_sdp,
              });
              sendToSignalingServer({
                action: "call_state_update",
                request_uid: uuidv4(),
                object: {
                  from_user_uid: data.object.from_user,
                  to_user_uid: data.object.to_user,
                  message_rtc_uid: data.object.message_rtc_uid,
                  state: "connected",
                },
              });
            }
            break;
          case "call_completion":
            setShowVideo(false);
            if (data.object?.type_complete === "completed") {
              setIncomingCall(false);
              setCallState("end");
              executeAfterDelay(() => {
                setIsResponse(false);
                setCallState("connecting");
                cleanupConnection();
              });
            }
            // не ответил
            if (data.object?.type_complete === "unreceived") {
              setIncomingCall(false);
              cleanupConnection();
            }

            break;
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
          console.log(callInfo);

          if (fromUserUid && toUserUid) {
            sendToSignalingServer({
              action: "ice_candidate",
              request_uid: uuidv4(),
              object: {
                from_user_uid: fromUserUid,
                to_user_uid: toUserUid,
                ice_candidate: event.candidate.candidate,
                message_rtc_uid: "",
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

      pc.onnegotiationneeded = async () => {
        console.log("Пересогласование");
        // Проверяем состояние соединения
        if (pc.signalingState !== "stable") {
          console.warn("Нельзя отправить offer: текущее состояние —", pc.signalingState);
          return;
        }

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          if (!offer.sdp) {
            console.error("SDP offer не содержит данных");
            setCallState("error");
            return;
          }
          if (callInfoRef.current) {
            console.log("Работает");

            sendToSignalingServer({
              action: "offer_call",
              request_uid: uuidv4(),
              object: {
                to_user_uid: callInfoRef.current?.from_user,
                offer_sdp: offer.sdp,
              },
            });
          }
        } catch (error) {
          console.error("Ошибка при создании/отправке offer:", error);
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
      setShowVideo(false);
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
    if (peerConnectionRef.current === null) return;

    const hasPermissions = await checkPermissions();
    if (!hasPermissions) return;

    try {
      localStreamRef.current = await getMediaAccess({
        audio: true,
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
            message_rtc_uid: callInfo.message_rtc.uid,
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
    callInfoRef.current = callData.object;
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
      const microphonePermission = await navigator.permissions.query({
        name: "microphone",
      });

      console.log("UsecallLogic");

      if (microphonePermission.state === "denied") {
        alert("Для звонков нужно разрешить доступ к камере и микрофону в настройках браузера");
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
            message_rtc_uid: callInfo.message_rtc.uid,
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
    setShowVideo(false);
    sdpRef.current = "";
    fromUserRef.current = null;

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

    callInfoRef.current = null;

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
      // const hasPermissions = await checkPermissions();
      // if (!hasPermissions) return;

      const pc = await initializePeerConnection();
      if (!pc) return;

      peerConnectionRef.current = pc;
      setupWebSocketHandlers();
    };

    initCall();
  }, [stunAndTurnServers, isCallModalOpen]);

  const checkcameraPermission = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({
        name: "camera",
      });

      if (cameraPermission.state === "denied") {
        alert("Для видео звонка нужно разрешить доступ к камере в настройках браузера");
        return false;
      }
      return true;
    } catch (error) {
      console.warn("Не удалось проверить разрешения:", error);
      return false;
    }
  };

  // Функция для включения видео
  const enableVideo = async () => {
    if (!checkcameraPermission()) return;

    try {
      // Получаем видеопоток
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];

      // Добавляем видеодорожку в соединение
      peerConnectionRef.current?.addTrack(videoTrack, videoStream);

      // Добавляем в локальный поток
      localStreamRef.current?.addTrack(videoTrack);

      console.log(localStream?.getTracks());
      setShowVideo(true);
    } catch (err) {
      console.log("❌ Ошибка включения видео:", err);
    }
  };

  // Функция для выключения видео
  const disableVideo = () => {
    try {
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      const peerConnection = peerConnectionRef.current;

      if (!videoTrack || !peerConnection) return;

      // 1. Получаем sender для видеодорожки
      const sender = peerConnection.getSenders().find(s => s.track === videoTrack);

      if (sender) {
        // 2. Удаляем трек из соединения
        peerConnection.removeTrack(sender);
      }

      // 4. Отключаем трек в локальном потоке
      videoTrack.stop();
      localStreamRef.current?.removeTrack(videoTrack);

      // 5. Обновляем UI
      setShowVideo(false);
      console.log("Видео полностью отключено и удалено из соединения");
    } catch (err) {
      console.error("Ошибка отключения видео:", err);
    }
  };

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
    showVideo,
    // Функции
    handleIncomingCall,
    handleRejectCall,
    toggleSound,
    handleEndCall,
    handleAcceptCall,
    setIsResponse,
    cleanupConnection,
    enableVideo,
    disableVideo,
  };
};
