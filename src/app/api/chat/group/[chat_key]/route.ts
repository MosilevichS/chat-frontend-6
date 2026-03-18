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
    console.log(`Fetching group info for ${chat_key}`);

    const response = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/groups_or_channels/${chat_key}/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Group not found" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching group info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
