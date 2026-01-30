import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", ws => {
  console.log("Client connected");

  ws.on("message", message => {
    const data = JSON.parse(message.toString());

    console.log("Received:", data);
    ws.send(
      JSON.stringify({
        content: data.object.content,
      }),
    );
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WS сервер запущен на ws://localhost:3001");
