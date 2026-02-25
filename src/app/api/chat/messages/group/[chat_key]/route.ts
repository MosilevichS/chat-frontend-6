import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ chat_key: string }> }) {
  const { chat_key } = await params;
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("page_size") || "50";
  const ordering = searchParams.get("ordering") || "-created_at";

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    console.log(`Fetching messages for chat ${chat_key}`);

    // Сначала получаем информацию о группе, чтобы узнать virtual_user_uid
    const groupInfoResponse = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/groups_or_channels/${chat_key}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!groupInfoResponse.ok) {
      console.error("Failed to fetch group info:", groupInfoResponse.status);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const groupInfo = await groupInfoResponse.json();
    console.log("Group info:", groupInfo);

    // Получаем virtual_user_uid из chat.uid (это UID виртуального пользователя)
    const virtualUserUid = groupInfo.chat?.uid;

    if (!virtualUserUid) {
      console.error("No virtual user UID found for group");
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    console.log("Using virtual user UID:", virtualUserUid);

    // Получаем сообщения используя virtual_user_uid
    const messagesResponse = await fetch(
      `${process.env.API_URL}/api/v1/chat/message/text/${virtualUserUid}/?page=${page}&page_size=${pageSize}&ordering=${ordering}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!messagesResponse.ok) {
      console.error("Failed to fetch messages:", messagesResponse.status);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await messagesResponse.json();
    console.log(`Fetched ${data.results?.length || 0} messages`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
