type QueueMessage = unknown;

const STORAGE_KEY = "ws_message_queue";

const queue: QueueMessage[] = loadQueue();

function loadQueue(): QueueMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export const enqueueMessage = (message: QueueMessage) => {
  queue.push(message);
  saveQueue();
};

export const flushQueue = (socket: WebSocket) => {
  if (socket.readyState !== WebSocket.OPEN) return;

  while (queue.length > 0) {
    const msg = queue.shift();
    if (msg) socket.send(JSON.stringify(msg));
  }

  saveQueue();
};

export const getQueueSize = () => queue.length;
