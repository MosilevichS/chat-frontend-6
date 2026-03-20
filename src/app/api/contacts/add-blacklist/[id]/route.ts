import { cookies } from "next/headers";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = await params;

  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/contact/blacklist/add/${id}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Попытка распарсить JSON, если он есть
    const data = await res.json().catch(() => null);

    // Пробрасываем статус и данные backend напрямую
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
