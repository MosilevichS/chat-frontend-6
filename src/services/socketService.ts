let socket: WebSocket | null = null;
let isConnecting = false;

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

const MAX_RECONNECT_ATTEMPTS = 10;

let currentToken: string | null = null;

export const connectSocket = (token: string) => {
  // если уже открыт — ничего не делаем
  if (socket?.readyState === WebSocket.OPEN) {
    return socket;
  }

  // если сейчас подключается — не создаём второй
  if (isConnecting) {
    return socket;
  }

  isConnecting = true;
  currentToken = token;

  socket = new WebSocket(`wss://api.test.chat.ktsf.ru/ws/chat?authorization=${token}`);

  socket.onopen = () => {
    console.log("WS connected");
    isConnecting = false;
    reconnectAttempts = 0;
  };

  socket.onclose = () => {
    console.log("WS disconnected");

    isConnecting = false;
    socket = null;

    scheduleReconnect();
  };

  socket.onerror = () => {
    socket?.close();
  };

  return socket;
};

const scheduleReconnect = () => {
  if (!currentToken) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log("Max reconnect attempts reached");
    return;
  }

  reconnectAttempts++;

  const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);

  console.log(`Reconnecting in ${delay}ms...`);

  reconnectTimeout = setTimeout(() => {
    connectSocket(currentToken!);
  }, delay);
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  reconnectAttempts = 0;

  if (socket) {
    socket.onclose = null; // чтобы не вызвался reconnect
    socket.close();
    socket = null;
  }
};
