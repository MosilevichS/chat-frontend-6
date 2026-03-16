import { enqueueMessage, flushQueue } from "./messageQueueService";

let socket: WebSocket | null = null;

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

let isConnecting = false;
let manualClose = false;

const MAX_RECONNECT_ATTEMPTS = 10;

// Подписчик на события сокета
type MessageListener = (event: MessageEvent) => void;

const listeners = new Set<MessageListener>();

export const subscribeToSocket = (listener: MessageListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Получение свежего access токена
const getFreshToken = async (): Promise<string | null> => {
  try {
    const res = await fetch("/api/get-token");

    if (!res.ok) {
      console.log("Token refresh failed");
      return null;
    }

    const { token } = await res.json();
    return token;
  } catch (err) {
    console.log("Token fetch error", err);
    return null;
  }
};

// Отправка данных через сокет с очередью
export const sendThroughSocket = async (data: unknown) => {
  console.log("sendThroughSocket called", data);
  enqueueMessage(data);

  if (socket?.readyState === WebSocket.OPEN) {
    flushQueue(socket);
    return;
  }

  // если есть таймер реконнекта — отменяем
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  await connectSocket();
};

// Подключение сокета
export const connectSocket = async (): Promise<WebSocket | null> => {
  if (socket?.readyState === WebSocket.OPEN) return socket;
  if (socket?.readyState === WebSocket.CONNECTING) return socket;
  if (isConnecting) return socket;

  isConnecting = true;
  manualClose = false;

  const token = await getFreshToken();
  if (!token) {
    isConnecting = false;
    return null;
  }

  socket = new WebSocket(`wss://api.dev.chat.ktsf.ru/ws/chat?authorization=${token}`);

  socket.onopen = () => {
    console.log("WS connected");

    isConnecting = false;
    reconnectAttempts = 0;

    flushQueue(socket!);

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  socket.onmessage = event => {
    listeners.forEach(listener => listener(event));
  };

  socket.onclose = () => {
    console.log("WS disconnected");

    isConnecting = false;
    socket = null;

    if (!manualClose) {
      scheduleReconnect();
    }
  };

  socket.onerror = () => {
    socket?.close();
  };

  return socket;
};

// Планирование реконнекта
const scheduleReconnect = () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log("Max reconnect attempts reached");
    return;
  }

  if (reconnectTimeout) return;

  reconnectAttempts++;

  const delay = Math.min(500 * 2 ** reconnectAttempts, 5000);

  console.log(`Reconnecting in ${delay}ms...`);

  reconnectTimeout = setTimeout(async () => {
    reconnectTimeout = null;

    const ws = await connectSocket();

    if (ws?.readyState === WebSocket.OPEN) {
      flushQueue(ws);
    }
  }, delay);
};

// Получить текущий сокет
export const getSocket = () => socket;

//Ручное отключение (logout / unmount)
export const disconnectSocket = () => {
  manualClose = true;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  reconnectAttempts = 0;

  if (socket) {
    socket.close();
    socket = null;
  }
};
