import { cookies } from "next/headers";

export async function GET(request: Request, { params }: { params: { user_uid: string } }) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  const { user_uid } = await params;

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/chat/message/text/${user_uid}/?ordering=created_at&page=1&page_size=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
