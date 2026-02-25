import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chat_key: string }> },
) {
  const { chat_key } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const expires_in = body.expires_in || 86400; // по умолчанию 24 часа

    console.log(`Generating invite link for chat ${chat_key}`);

    const response = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/generate-invite/${chat_key}/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expires_in }),
      },
    );

    if (!response.ok) {
      console.error("Failed to generate invite link:", response.status);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to generate invite link" },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("Backend response:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating invite link:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
