import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    console.log(`Joining chat with invite token:`, token);

    // Извлекаем chat_key из URL или токена
    let chatKey = "";

    // Пробуем распарсить JWT токен
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        chatKey = payload.chat_key || "";
        console.log("Extracted chat_key from token payload:", chatKey);
      }
    } catch (e) {
      console.log("Token is not JWT or could not parse");
    }

    // Если не получилось из JWT, пробуем извлечь из самого token (если это URL)
    if (!chatKey && token.includes("/")) {
      const matches = token.match(/\/group_([a-f0-9-]+)/);
      if (matches && matches[1]) {
        chatKey = `group_${matches[1]}`;
        console.log("Extracted chat_key from URL:", chatKey);
      }
    }

    if (!chatKey) {
      return NextResponse.json({ error: "Could not extract chat_key from token" }, { status: 400 });
    }

    // Используем WebSocket для вступления по ссылке
    return new Promise<Response>(resolve => {
      const ws = new WebSocket(`wss://api.dev.chat.ktsf.ru/ws/chat?authorization=${accessToken}`);

      const timeout = setTimeout(() => {
        ws.close();
        resolve(NextResponse.json({ error: "Request timeout" }, { status: 408 }));
      }, 10000);

      ws.onopen = () => {
        const requestUid = crypto.randomUUID();

        const request = {
          action: "join_by_invite_link",
          request_uid: requestUid,
          object: {
            chat_key: chatKey,
            token: token,
          },
        };

        ws.send(JSON.stringify(request));
      };

      ws.onmessage = event => {
        const data = JSON.parse(event.data);

        if (data.action === "join_by_invite_link") {
          clearTimeout(timeout);
          ws.close();

          if (data.status === "OK") {
            resolve(NextResponse.json(data));
          } else {
            resolve(
              NextResponse.json({ error: data.error || "Failed to join chat" }, { status: 400 }),
            );
          }
        }
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(NextResponse.json({ error: "WebSocket error" }, { status: 500 }));
      };
    });
  } catch (error) {
    console.error("Error joining chat by invite:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
