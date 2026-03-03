"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";

import {
  OverlayScrollbarsComponent,
  type OverlayScrollbarsComponentRef,
} from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";

import call from "@/src/assets/icons/call.svg";
import search from "@/src/assets/icons/search-messages.svg";
import noMessages from "@/src/assets/icons/no-messages.svg";
import clip from "@/src/assets/icons/clip.svg";
import close from "@/src/assets/icons/close.svg";

import microphone from "@/src/assets/icons/microphone.svg";
import sendMessageIcon from "@/src/assets/icons/send-message.svg";
import scrollDownIcon from "@/src/assets/icons/scroll-down.svg";

import type { IContact } from "@/src/types/contact";
import type { IMessage } from "@/src/types/message";
import type { IChat } from "@/src/types/chat";

import Loader from "@/src/components/ui/Loader";
import ModalBase from "@/src/components/ui/modal/ModalBase";
import ModalSuccess from "@/src/components/ui/modal/ModalSuccess";
import OutgoingMessage from "@/src/components/ui/chat/OutgoingMessage";
import IncomingMessage from "@/src/components/ui/chat/IncomingMessage";
import DateDivider from "@/src/components/ui/chat/DateDivider";
import Button from "../Button";
import ClearChat from "./ClearChat";
import ModalConfirm from "../modal/ModalConfirm";
import ProfileInfo from "./ProfileInfo";
import CopyInfo from "./CopyInfo";
import CallBlock from "./CallBlock";

import { timeFormat } from "@/src/utils/timeFormat";
import formatChatDate from "@/src/utils/formatChatDate";

import {
  useAddBlackListMutation,
  useDeleteBlackListMutation,
  useGetContactByIdQuery,
} from "@/src/services/contactApi";
import { useGetChatsQuery } from "@/src/services/chatsApi";
import type { AppDispatch } from "@/src/store/store";
import { chatsApi } from "@/src/services/chatsApi";
import { useGetContactsQuery, useAddContactByPhoneMutation } from "@/src/services/contactApi";
import { useGetProfileQuery } from "@/src/services/userApi";
import { useGetMessagesQuery } from "@/src/services/messagesApi";
import { getSocket } from "@/src/services/socketService";
// import { useGetCallQuery } from "@/src/services/callApi";
// import { v4 as uuidv4 } from "uuid";
// import type { SignalingMessage } from "@/src/types/calls";
import ReceivCallBlock from "./ReceivCallBlock";
import ResponseBlock from "./ResponseBlock";
// import { useDelayedAction } from "@/src/hooks/useDelayedAction ";
import { useCallLogic } from "@/src/hooks/useCallLogic";

export default function Chat() {
  const dispatch = useDispatch<AppDispatch>();

  // Контакт и профиль
  const { user_uid } = useParams<{ user_uid: string }>();
  const [addContactByPhone] = useAddContactByPhoneMutation();

  const handleCallButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      // Браузер автоматически покажет стандартное окно запроса разрешений
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Освобождаем ресурсы — останавливаем все треки
      stream.getTracks().forEach(track => track.stop());

      // Если доступ получен, открываем модальное окно звонка
      setIsCallModalOpen(true);
    } catch (error) {
      console.error("Доступ к устройствам отклонён:", error);

      // Показываем информативное сообщение пользователю
      alert(
        "Для совершения звонка необходимо разрешить доступ к микрофону и камере (для видео звонка). Нажмите на значок в начале адресной строки браузера, чтобы изменить настройки разрешений.",
      );
    }
  };

  const [isBannerHidden, setBannerHidden] = useState(false);
  const [isBannerClosing, setBannerClosing] = useState(false);

  const [isProfileOpen, setProfileOpen] = useState(false);

  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);

  const [isAddToBlacklistModalOpen, setIsAddToBlacklistModalOpen] = useState(false);
  const [isDeleteToBlacklistModalOpen, setIsDeleteToBlacklistModalOpen] = useState(false);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedCopyInfo, setSelectedCopyInfo] = useState({ text: "", name: "" });
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const {
    remoteStream,
    incomingCall,
    isSound,
    isResponse,
    callInfo,
    setIsResponse,
    handleRejectCall,
    toggleSound,
    handleEndCall,
    handleAcceptCall,
  } = useCallLogic();

  // звонки
  // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const [incomingCall, setIncomingCall] = useState(false);
  // const [isSound, setIsSound] = useState(true);
  // показываем или нет блок ответа
  // const [isResponse, setIsResponse] = useState(false);
  // // данные для хранения информации о звонящем
  // const [callInfo, setCallInfo] = useState(null);
  // мой звук
  // const localStreamRef = useRef<MediaStream | undefined>(undefined);
  // удаленный звук
  // const remoteStreamRef = useRef<MediaStream | null>(null);

  // const [callState, setCallState] = useState("");
  // const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  // накапливаем потенциальный сетевые маршрут (адрес + порт), по которому два устройства могут установить прямое соединение через WebRTC, пока нету данных чтобы их отправить
  // const iceCandidateBuffer = useRef<RTCIceCandidate[]>([]);
  // const { data: stunAndTurnServers } = useGetCallQuery();

  // // Показываем модальное окно для принятия вызова
  // const handleIncomingCall = async (callData: any) => {
  //   setCallInfo(callData.object);
  //   setIncomingCall(true);
  // };

  // // Обрабатываем входящий вызов
  // const handleIncomingOffer = async (
  //   pc: RTCPeerConnection,
  //   message: Extract<SignalingMessage, { action: "offer_call" }>,
  // ) => {
  //   try {
  //     // Устанавливаем удалённое описание из offer
  //     await pc.setRemoteDescription({
  //       type: "offer",
  //       sdp: message.object.offer_sdp,
  //     });

  //     // Передаём данные в функцию показа окна
  //     await handleIncomingCall(message);
  //   } catch (error) {
  //     console.error("Ошибка при обработке входящего звонка:", error);
  //     setCallState("error");
  //   }
  // };

  // // отклонить вызов
  // const handleRejectCall = async () => {
  //   console.log("callInfo:", callInfo);

  //   sendToSignalingServer({
  //     action: "call_completion",
  //     request_uid: uuidv4(),
  //     object: {
  //       from_user_uid: callInfo.from_user,
  //       to_user_uid: callInfo.to_user,
  //       type_complete: "rejected",
  //       message_rtc_uid: uuidv4(),
  //     },
  //   });

  //   setIncomingCall(false);
  //   // setCallState("callend");
  // };

  // // отключения/включения звука
  // const toggleSound = () => {
  //   setIsSound(!isSound);
  //   const streamRemote = remoteStreamRef.current;
  //   if (streamRemote) {
  //     streamRemote.getAudioTracks().forEach(track => {
  //       track.enabled = !isSound;
  //     });
  //     console.log(`Звук удалённого потока ${isSound ? "выключен" : "включён"}`);
  //   }

  //   const streamLocal = localStreamRef.current;
  //   if (streamLocal) {
  //     streamLocal.getAudioTracks().forEach(track => {
  //       track.enabled = !isSound;
  //     });
  //     console.log(`Локальный звук ${isSound ? "выключен" : "включён"}`);
  //   }
  // };

  // const { executeAfterDelay } = useDelayedAction(2000);

  // // завершаем звонок
  // const handleEndCall = () => {
  //   try {
  //     // 1. Останавливаем локальный медиапоток
  //     // const localVideo = document.getElementById("remote-video") as HTMLVideoElement;
  //     // if (localVideo && localVideo.srcObject) {
  //     //   (localVideo.srcObject as MediaStream).getTracks().forEach(track => track.stop());
  //     //   localVideo.srcObject = null;
  //     // }

  //     if (localStreamRef.current) {
  //       localStreamRef.current.getTracks().forEach(track => track.stop());
  //       localStreamRef.current = undefined;
  //     }

  //     // 2. Закрываем WebRTC‑соединение
  //     if (peerConnectionRef.current) {
  //       peerConnectionRef.current.close();
  //       peerConnectionRef.current = null;
  //     }

  //     // // 3. Отправляем сигнал о завершении звонка через WebSocket
  //     // sendToSignalingServer({
  //     //   action: "call_completion",
  //     //   request_uid: uuidv4(),
  //     //   object: {
  //     //     from_user_uid: profile.uid,
  //     //     to_user_uid: data.uid,
  //     //     type_complete: "completed",
  //     //     message_rtc_uid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  //     //     duration: callDuration,
  //     //   },
  //     // });

  //     // // 4. Сбрасываем состояния
  //     // setCallState("end");

  //     executeAfterDelay(() => {
  //       setIsResponse(false);
  //     });
  //   } catch (error) {
  //     console.error("Ошибка при завершении звонка:", error);
  //   }
  // };

  // // принять вызов
  // const handleAcceptCall = async () => {
  //   console.log("Вызов принят");
  //   console.log("Ответ на звонок отправлен");

  //   // можно сделать проверку на доступ к микрофону (и камере, если нужно)

  //   if (peerConnectionRef.current === null) return;

  //   try {
  //     localStreamRef.current = await getMediaAccess({ audio: true, video: false });

  //     if (localStreamRef.current) {
  //       const stream = localStreamRef.current;
  //       stream.getTracks().forEach(track => peerConnectionRef.current!.addTrack(track, stream));
  //     }

  //     //   // Создаём ответ
  //     const answer = await peerConnectionRef.current.createAnswer();
  //     await peerConnectionRef.current.setLocalDescription(answer);

  //     sendToSignalingServer({
  //       action: "answer_call",
  //       request_uid: uuidv4(),
  //       object: {
  //         from_user_uid: callInfo.from_user,
  //         to_user_uid: callInfo.to_user,
  //         answer_sdp: answer.sdp,
  //       },
  //     });

  //     //   setCallState("connected");

  //     setIsResponse(true);
  //     setIncomingCall(false);
  //   } catch (error) {
  //     console.error("Ошибка при принятии звонка:", error);
  //     setCallState("error");
  //   }
  // };

  // // Функция для отправки сообщения через сигнальный сервер собеседнику
  // const sendToSignalingServer = (message: SignalingMessage) => {
  //   const ws = getSocket();
  //   if (!ws || ws.readyState !== WebSocket.OPEN) {
  //     console.log("WS not ready");
  //     return;
  //   }
  //   ws.send(JSON.stringify(message));
  // };

  // // обработка буфера при обновлении callInfo
  // useEffect(() => {
  //   const buffered = [...iceCandidateBuffer.current];
  //   iceCandidateBuffer.current = [];
  //   buffered.forEach(candidate => {
  //     sendToSignalingServer({
  //       action: "ice_candidate",
  //       request_uid: uuidv4(),
  //       object: {
  //         from_user_uid: callInfo.from_user,
  //         to_user_uid: callInfo.to_user,
  //         ice_candidate: candidate.candidate,
  //       },
  //     });
  //   });
  // }, [callInfo]);

  // const handleIceCandidate = async (pc: RTCPeerConnection, candidateStr: string) => {
  //   try {
  //     //  Создаём кандидата
  //     const iceCandidate = new RTCIceCandidate({
  //       candidate: candidateStr,
  //       sdpMid: "0", // Явно указываем медиалинию (обычно '0' для аудио)
  //       sdpMLineIndex: 0,
  //     });

  //     await pc.addIceCandidate(iceCandidate);
  //     console.log("ICE‑кандидат успешно добавлен:");
  //   } catch (error) {
  //     console.error("Критическая ошибка добавления ICE‑кандидата:", {
  //       candidateStr,
  //       hasRemoteDescription: !!pc.remoteDescription,
  //       error: error.message,
  //     });
  //   }
  // };

  // const checkPermissions = async () => {
  //   try {
  //     const cameraPermission = await navigator.permissions.query({
  //       name: "camera",
  //     });
  //     const microphonePermission = await navigator.permissions.query({
  //       name: "microphone",
  //     });

  //     if (cameraPermission.state === "denied" || microphonePermission.state === "denied") {
  //       alert("Для звонка нужно разрешить доступ к камере и микрофону в настройках браузера");
  //       return false;
  //     }
  //     return true;
  //   } catch (error) {
  //     console.warn("Не удалось проверить разрешения:", error);
  //     return false;
  //   }
  // };

  // const getMediaAccess = async (constraints: MediaStreamConstraints) => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     console.log("Доступ к устройствам получен");
  //     return stream;
  //   } catch (error) {
  //     console.log("Ошибка доступа к устройствам:", error);
  //   }
  // };

  // useEffect(() => {
  //   if (!stunAndTurnServers?.ice_servers?.length) {
  //     return;
  //   }

  //   const initCall = async () => {
  //     try {
  //       const hasPermissions = await checkPermissions();
  //       if (!hasPermissions) return;

  //       // создание экземпляра объекта RTCPeerConnection для организации P2P‑соединения между браузерами.
  //       const pc = new RTCPeerConnection({
  //         iceServers: stunAndTurnServers.ice_servers,
  //       });
  //       peerConnectionRef.current = pc;
  //       console.log("RTCPeerConnection создан успешно");

  //       pc.ontrack = event => {
  //         console.log("Получен удалённый медиапоток", event.streams[0]);
  //         setRemoteStream(event.streams[0]);

  //         // Сохраняем удалённый поток в ref
  //         remoteStreamRef.current = event.streams[0];

  //         // Применяем текущее состояние звука к удалённому потоку
  //         if (remoteStreamRef.current) {
  //           remoteStreamRef.current.getAudioTracks().forEach(track => {
  //             track.enabled = isSound;
  //           });
  //         }
  //       };

  //       pc.onicecandidate = event => {
  //         if (event.candidate) {
  //           console.log("Найден ICE‑кандидат:", event.candidate);
  //           pc.onicecandidate = event => {
  //             if (event.candidate) {
  //               const fromUserUid = callInfo?.from_user;
  //               const toUserUid = callInfo?.to_user;

  //               if (fromUserUid && toUserUid) {
  //                 // Если все данные есть — отправляем сразу
  //                 sendToSignalingServer({
  //                   action: "ice_candidate",
  //                   request_uid: uuidv4(),
  //                   object: {
  //                     from_user_uid: fromUserUid,
  //                     to_user_uid: toUserUid,
  //                     ice_candidate: event.candidate.candidate,
  //                   },
  //                 });
  //               } else {
  //                 // // Иначе буферизуем
  //                 iceCandidateBuffer.current.push(event.candidate);
  //                 console.log("Буферизуем ICE‑кандидат (callInfo не готов)");
  //               }
  //             } else {
  //               console.log("Сбор ICE‑кандидатов завершён");
  //             }
  //           };
  //         }
  //       };

  //       // Обработка состояния соединения
  //       pc.onconnectionstatechange = () => {
  //         const state = pc.connectionState;
  //         console.log("Состояние соединения изменилось:", state);

  //         switch (state) {
  //           case "connected":
  //             setCallState("connected");
  //             console.log("✅ Соединение установлено успешно!");
  //             break;
  //           case "failed":
  //             setCallState("error");
  //             console.error("❌ Соединение не удалось установить. Проверьте сеть и ICE‑серверы.");
  //             break;
  //           case "disconnected":
  //             console.warn("⚠️ Временное отключение. Пытаемся восстановить соединение...");
  //             setIncomingCall(false);
  //             break;
  //           case "closed":
  //             setCallState("callend");
  //             console.log("📞 Соединение закрыто.");
  //             break;
  //           default:
  //             // "new", "connecting" — ожидаем
  //             console.log(`⏱️ Текущее состояние: ${state}`);
  //         }
  //       };

  //       // Обработчик входящих сообщений WebSocket
  //       const ws = getSocket();
  //       ws.onmessage = async (event: MessageEvent) => {
  //         try {
  //           const data: SignalingMessage = JSON.parse(event.data);

  //           switch (data.action) {
  //             case "offer_call":
  //               setCallInfo(data.object);
  //               // Обрабатываем входящий вызов
  //               await handleIncomingOffer(pc, data);
  //               break;
  //             case "ice_candidate":
  //               if (data.object.ice_candidate) {
  //                 await handleIceCandidate(pc, data.object.ice_candidate);
  //               }
  //               break;
  //             // case "answer_call":
  //             //   // Устанавливаем ответ от звонящего
  //             //   await pc.setRemoteDescription({
  //             //     type: "answer",
  //             //     sdp: data.object.answer_sdp,
  //             //   });
  //             //   setCallState("connected");
  //             //   break;
  //             default:
  //               console.log("Неизвестное действие:", data.action);
  //           }
  //         } catch (error) {
  //           console.error("Ошибка обработки сигнального сообщения:", error);
  //         }
  //       };
  //     } catch (error) {
  //       console.error("Критическая ошибка инициализации звонка:", error);
  //     }
  //   };

  //   initCall();

  //   return () => {
  //     // Очистка WebSocket-обработчиков
  //     const ws = getSocket();
  //     if (ws !== null) {
  //       ws.onmessage = null;
  //     }

  //     if (localStreamRef.current) {
  //       localStreamRef.current.getTracks().forEach(track => track.stop());
  //     }
  //     if (peerConnectionRef.current) {
  //       peerConnectionRef.current.close();
  //       peerConnectionRef.current = null;
  //     }
  //     console.log("Ресурсы звонка освобождены");
  //   };
  // }, [stunAndTurnServers]);

  // Проверка есть ли пользователь в списке контактов
  const { data: contactsData } = useGetContactsQuery();

  const contacts = contactsData?.results;

  const isInContacts = contacts?.some(
    (contact: IContact) => contact.system_contact.uid === user_uid,
  );

  // Получение данных открытого чата
  const { data: chatsData } = useGetChatsQuery();
  const chats = chatsData?.results;
  const chat = chats?.find((chat: IChat) => chat.chat?.uid === user_uid);

  // Получение данных профиля
  const { data: profileData } = useGetProfileQuery();
  const profile = profileData;

  // Получение контакта по uid
  const { data, isLoading, isError } = useGetContactByIdQuery(user_uid);

  // Удаление и добавление в черный список
  const [addBlackList] = useAddBlackListMutation();
  const [deleteBlackList] = useDeleteBlackListMutation();

  const handleAddBlackList = async () => {
    if (!data) return;

    try {
      await addBlackList({ id: data.uid }).unwrap();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  const handleDeleteBlackList = async () => {
    if (!data) return;

    try {
      await deleteBlackList({ id: data.uid }).unwrap();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  // Получение сообщений
  const [page, setPage] = useState(1);

  const { data: messagesData } = useGetMessagesQuery({
    user_uid,
    page,
    page_size: 50,
    ordering: "-created_at",
  });

  const messages = React.useMemo(() => {
    return messagesData?.results ? [...messagesData.results].reverse() : [];
  }, [messagesData]);
  const hasMore = messagesData?.next !== null;

  useEffect(() => {
    setPage(1);
  }, [user_uid]);

  // WebSocket и сообщения
  const [inputValue, setInputValue] = useState("");
  const prevLengthRef = useRef(0);

  // Отправка сообщения
  const sendMessage = () => {
    const ws = getSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS not ready");
      return;
    }

    ws.send(
      JSON.stringify({
        action: "create_text_message",
        request_uid: profile?.uid,
        object: {
          to_user_uid: user_uid,
          content: inputValue.trim(),
        },
      }),
    );

    setInputValue("");
  };

  // Отметка сообщения как прочитанного
  const markAsRead = (message: IMessage) => {
    const ws = getSocket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WS not ready");
      return;
    }

    ws.send(
      JSON.stringify({
        action: "change_status_read_message",
        request_uid: profile?.uid,
        object: {
          uid: message.uid,
          reader_uid: profile?.uid,
          new_read_status: false,
          chat_key: message.chat_key,
        },
      }),
    );

    dispatch(
      chatsApi.util.updateQueryData("getChats", undefined, draft => {
        const chatItem = draft.results.find(
          c => c.chat?.uid === message.from_user.uid || c.chat?.uid === message.to_user.uid,
        );
        if (!chatItem) return;

        // Только если это входящее сообщение и оно было непрочитано
        if (message.from_user.uid !== profile?.uid && message.new) {
          chatItem.new_message_count =
            chatItem.new_message_count > 0 ? chatItem.new_message_count - 1 : 0;
        }
      }),
    );
  };

  // Обработка скролла чата
  const osRef = useRef<OverlayScrollbarsComponentRef | null>(null);
  const wasAtBottomRef = useRef(true);
  const isFetchingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const didInitialPositioningRef = useRef(false);

  useEffect(() => {
    const osInstance = osRef.current?.osInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport || !profile) return;

    const scrollTop = viewport.scrollTop;
    const viewportHeight = viewport.clientHeight;

    messages.forEach(msg => {
      if (msg.from_user.uid === profile.uid || !msg.new) return;

      const el = document.getElementById(`msg-${msg.uid}`);
      if (!el) return;

      // Используем offsetTop относительно родителя (OverlayScrollbars viewport)
      const offsetTop = el.offsetTop;
      const offsetBottom = offsetTop + el.offsetHeight;

      if (offsetBottom >= scrollTop && offsetTop <= scrollTop + viewportHeight) {
        markAsRead(msg);
      }
    });
  }, [messages, user_uid]);

  useEffect(() => {
    const instance = osRef.current?.osInstance();
    const viewport = instance?.elements().viewport;
    if (!viewport) return;
    if (!messages.length) return;

    // новые сообщения вниз
    if (messages.length > prevLengthRef.current && !isFetchingMoreRef.current) {
      if (wasAtBottomRef.current) {
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }

    // подгрузка вверх
    if (isFetchingMoreRef.current) {
      requestAnimationFrame(() => {
        const newScrollHeight = viewport.scrollHeight;
        const heightDiff = newScrollHeight - prevScrollHeightRef.current;

        viewport.scrollTop = prevScrollTopRef.current + heightDiff;

        isFetchingMoreRef.current = false;
      });
    }

    prevLengthRef.current = messages.length;
  }, [messages, user_uid]);

  useEffect(() => {
    didInitialPositioningRef.current = false;
  }, [user_uid]);

  // Кнопка для скролла вниз
  const [showScrollDown, setShowScrollDown] = useState(false);

  const scrollToBottom = () => {
    const osInstance = osRef.current?.osInstance();
    const viewport = osInstance?.elements().viewport;
    if (!viewport) return;

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  };

  // логика закрытия модалки через секунды при добавлении в друзья
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isModalSuccessOpen) {
      timeoutRef.current = setTimeout(() => {
        setModalSuccessOpen(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isModalSuccessOpen]);

  // Добавление контакта по номеру телефона
  const handleAddContact = async (phone_number: string) => {
    try {
      await addContactByPhone({ phone: phone_number }).unwrap();
      setModalSuccessOpen(true);
    } catch (error) {
      console.error("Ошибка при добавлении контакта:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        <Loader />
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex items-center justify-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light-opacity) rounded-lg  md:rounded-lg border border-(--color-gray-1) px-4">
        Ошибка загрузки пользователя.
      </div>
    );

  return (
    <>
      <div className="md:flex w-full overflow-hidden">
        <div className="relative flex flex-col w-full h-screen md:h-[calc(100vh-88px)] max-w-[744px] bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1)">
          <header
            className="px-4 w-full flex justify-between items-center min-h-[60px] bg-(--color-gray-light) rounded-t-lg border-b border-(--color-gray-3) z-30 cursor-pointer"
            onClick={() => setProfileOpen(true)}
          >
            <div className="flex gap-3">
              {data.avatar_url ? (
                <Image
                  src={data.avatar_url}
                  alt="Аватар"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <Image
                  className="h-10 w-10"
                  src="/avatar/avatar-8.png"
                  width={40}
                  height={40}
                  alt="Аватар"
                />
              )}

              <div className={`${chat?.chat?.is_blocked && isProfileOpen ? "w-[55px]" : ""}`}>
                <p className="font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5">
                  {data.first_name} {data.last_name}
                </p>
                {data.is_online ? (
                  <p className="text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2 truncate">
                    в сети
                  </p>
                ) : (
                  <p className="text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2 truncate">
                    был(а) {timeFormat(data.was_online_at * 1000)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-x-3">
              {chat?.chat?.is_blocked && (
                <Button
                  variant="primary"
                  className="!w-[161px]"
                  size="small"
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDeleteToBlacklistModalOpen(true);
                  }}
                >
                  Разблокировать
                </Button>
              )}
              <button aria-label="Поиск">
                <Image className="min-w-[36px]" src={search} alt="Поиск" width={36} height={36} />
              </button>
              {!chat?.chat?.is_blocked && (
                <button onClick={handleCallButtonClick} aria-label="Звонок">
                  <Image src={call} alt="Звонок" width={36} height={36} />
                </button>
              )}
            </div>
          </header>

          {!isInContacts && !isBannerHidden && !isProfileOpen && !chat?.chat?.is_blocked && (
            <div
              className={`h-[44px] w-full px-4 flex items-center bg-(--color-gray-light) border-b border-(--color-gray-3) 
                absolute top-[60px] left-0 right-0 z-20
                transition-transform duration-300 ease-in-out 
                ${isBannerClosing ? "translate-y-[-100%]" : "translate-y-0"}`}
            >
              <div className="flex gap-1 w-full">
                <div className="flex justify-center w-full max-w-[340px]">
                  <button
                    className="text-(--color-violet) active:text-(--color-violet-light) truncate"
                    onClick={() => {
                      setBannerClosing(true);
                      setTimeout(() => setBannerHidden(true), 300);
                      handleAddContact(data.username);
                    }}
                  >
                    Добавить в контакты
                  </button>
                </div>
                <div className="flex justify-center w-full max-w-[340px]">
                  <button
                    className="text-(--color-error) active:opacity-20"
                    onClick={() => setIsAddToBlacklistModalOpen(true)}
                  >
                    Заблокировать
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setBannerClosing(true);
                  setTimeout(() => setBannerHidden(true), 300);
                }}
                aria-label="Закрыть"
              >
                <Image src={close} alt="Закрыть" width={24} height={24} />
              </button>
            </div>
          )}

          {showClearChatModal && chat && (
            <ClearChat setShowClearChatModal={setShowClearChatModal} chatId={chat.id!} />
          )}

          {showCopyModal && (
            <CopyInfo setShowCopyModal={setShowCopyModal} copyInfo={selectedCopyInfo} />
          )}

          <main className="relative flex flex-col flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center">
                <Image
                  src={noMessages}
                  alt="Нет сообщений"
                  width={200}
                  height={200}
                  className="mb-6"
                  loading="eager"
                />
                <p className="text-(--color-gray) text-lg leading-[130%]">Сообщений пока нет</p>
                <p className="text-(--color-gray) text-sm leading-[120%]">Напишите первым :)</p>
              </div>
            ) : (
              <OverlayScrollbarsComponent
                key={user_uid}
                ref={osRef}
                options={{
                  scrollbars: {
                    autoHide: "scroll",
                    autoHideDelay: 400,
                  },
                }}
                events={{
                  scroll: instance => {
                    const viewport = instance.elements().viewport;
                    if (!viewport) return;

                    const isAtBottom =
                      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 40;
                    wasAtBottomRef.current = isAtBottom;

                    if (viewport.scrollTop < 20 && hasMore && !isFetchingMoreRef.current) {
                      isFetchingMoreRef.current = true;

                      prevScrollHeightRef.current = viewport.scrollHeight;
                      prevScrollTopRef.current = viewport.scrollTop;

                      setPage(prev => prev + 1);
                    }

                    setShowScrollDown(viewport.scrollHeight > viewport.clientHeight && !isAtBottom);
                  },
                }}
                className="h-full"
              >
                <div className="flex flex-col px-4 pb-2 min-h-full justify-end">
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];

                    const showDateDivider =
                      !prevMessage ||
                      new Date(prevMessage.created_at * 1000).toDateString() !==
                        new Date(message.created_at * 1000).toDateString();

                    return (
                      <React.Fragment key={message.uid}>
                        {showDateDivider && (
                          <DateDivider date={formatChatDate(message.created_at)} />
                        )}

                        <div className="flex" id={`msg-${message.uid}`}>
                          {message.from_user.uid !== data.uid ? (
                            <OutgoingMessage
                              message={message}
                              className={`${prevMessage && prevMessage.from_user.uid !== message.from_user.uid ? "mt-3" : "mt-2"}`}
                            />
                          ) : (
                            <IncomingMessage
                              message={message}
                              markAsRead={markAsRead}
                              className={`${prevMessage && prevMessage.from_user.uid !== message.from_user.uid ? "mt-3" : "mt-2"}`}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </OverlayScrollbarsComponent>
            )}

            <button
              className={`absolute bottom-2 right-2 z-50 w-[44px] h-[44px] bg-white rounded-full border-[0.33px] border-(--color-gray-3) 
                            flex items-center justify-center active:opacity-80
                            transform transition-all duration-300 ease-in-out
                            ${showScrollDown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              aria-label="Прокрутить вниз"
              onClick={scrollToBottom}
            >
              <Image src={scrollDownIcon} alt="Прокрутить вниз" />
            </button>
          </main>

          <footer className="flex items-center px-4 w-full min-h-[60px] bg-(--color-gray-light) rounded-b-lg border-t border-(--color-gray-3)">
            <form
              className="flex justify-between items-center gap-2 w-full"
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <button>
                <Image src={clip} alt="Прикрепить файл" width={36} height={36} />
              </button>
              <input
                type="text"
                placeholder="Сообщение"
                className="outline-none bg-white rounded-[1.25rem] py-2 pl-3 pr-10 w-full max-w-[624px]"
                onChange={e => setInputValue(e.target.value)}
                value={inputValue}
              />
              <button type="submit" aria-label="Отправить сообщение" className="active:opacity-50">
                {inputValue.trim() ? (
                  <Image src={sendMessageIcon} alt="Отправить сообщение" width={36} height={36} />
                ) : (
                  <Image src={microphone} alt="Микрофон" width={36} height={36} />
                )}
              </button>
            </form>
          </footer>
        </div>

        <aside
          className={`h-full bg-(--color-gray-light-opacity) rounded-lg border border-(--color-gray-1) transition-all duration-500 ease-in-out overflow-hidden
            ${isProfileOpen ? "w-full max-w-[360px] ml-6 opacity-100" : "w-0 opacity-0 ml-0"}
            `}
        >
          {isProfileOpen && (
            <ProfileInfo
              data={data}
              setProfileOpen={setProfileOpen}
              chat={chat!}
              isInContacts={isInContacts!}
              handleAddContact={() => handleAddContact(data.username)}
              handleAddBlackList={handleAddBlackList}
              handleDeleteBlackList={handleDeleteBlackList}
              setIsAddToBlacklistModalOpen={setIsAddToBlacklistModalOpen}
              setIsDeleteToBlacklistModalOpen={setIsDeleteToBlacklistModalOpen}
              setShowClearChatModal={setShowClearChatModal}
              setShowCopyModal={setShowCopyModal}
              setSelectedCopyInfo={setSelectedCopyInfo}
            />
          )}
        </aside>
      </div>

      {isModalSuccessOpen && (
        <ModalBase onClose={() => setModalSuccessOpen(false)}>
          <ModalSuccess
            name={`${data.first_name} ${data.last_name}`}
            text="теперь в списке ваших контактов"
          />
        </ModalBase>
      )}

      {isAddToBlacklistModalOpen && (
        <ModalBase onClose={() => setIsAddToBlacklistModalOpen(false)}>
          <ModalConfirm
            onClose={() => {
              setIsAddToBlacklistModalOpen(false);
              handleAddBlackList();
            }}
            onConfirm={() => setIsAddToBlacklistModalOpen(false)}
            title={`Заблокировать ${chat?.chat?.first_name}${chat?.chat?.last_name ? ` ${chat.chat.last_name}` : ""}?`}
            message="Пользователь не сможет писать Вам личные сообщения, звонить и приглашать Вас в группы и каналы"
            confirmText="Отмена"
            cancelText="Заблокировать"
            className="text-red-500 w-50!"
          />
        </ModalBase>
      )}

      {isDeleteToBlacklistModalOpen && (
        <ModalBase onClose={() => setIsDeleteToBlacklistModalOpen(false)}>
          <ModalConfirm
            onClose={() => {
              setIsDeleteToBlacklistModalOpen(false);
            }}
            onConfirm={() => {
              setIsDeleteToBlacklistModalOpen(false);
              handleDeleteBlackList();
            }}
            title={`Разблокировать ${chat?.chat?.first_name}${chat?.chat?.last_name ? ` ${chat?.chat.last_name}` : ""}?`}
            confirmText="Да"
            cancelText="Нет"
          />
        </ModalBase>
      )}
      {isCallModalOpen && (
        <CallBlock setIsCallModalOpen={setIsCallModalOpen} data={data} profile={profile!} />
      )}

      {incomingCall && (
        <ReceivCallBlock
          data={callInfo!}
          handleAcceptCall={handleAcceptCall}
          handleRejectCall={handleRejectCall}
        />
      )}

      {isResponse && (
        <ResponseBlock
          data={callInfo!}
          setIsResponse={setIsResponse}
          remoteStream={remoteStream!}
          toggleSound={toggleSound}
          isSound={isSound}
          handleEndCall={handleEndCall}
        />
      )}
    </>
  );
}
