import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${process.env.API_URL}/api/v1/auth/messenger/profile/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  const data = await res.json();
  return Response.json(data);
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  try {
    const body = await request.json();

    const res = await fetch(`${process.env.API_URL}/api/v1/auth/messenger/profile/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Попытка распарсить JSON, если он есть
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    // Пробрасываем статус и данные backend напрямую
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
