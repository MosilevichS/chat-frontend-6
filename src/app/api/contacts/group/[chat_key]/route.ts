import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ chat_key: string }> }) {
  const { chat_key } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    console.log(`Fetching participants for group ${chat_key}`);

    // Используем правильный эндпоинт из документации
    const response = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/groups_or_channels/${chat_key}/participants/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch participants:", response.status);
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const data = await response.json();
    console.log(`Fetched ${data.results?.length || 0} participants`);

    // API возвращает пагинированный ответ с results
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching group participants:", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
