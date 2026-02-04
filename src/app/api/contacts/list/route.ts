import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const body = await request.json();

  // Первый запрос к защищённому ресурсу
  let res = await fetch(`${process.env.API_URL}/api/v1/contact/check/list/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Если токен истёк, обновляем его
  if (res.status === 401) {
    const refreshRes = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshRes.ok) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { access, refresh } = await refreshRes.json();

    cookieStore.set("accessToken", access, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    cookieStore.set("refreshToken", refresh, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Повторный запрос с новым токеном
    res = await fetch(`${process.env.API_URL}/api/v1/contact/check/list/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  const data = await res.json().catch(() => null);
  return new Response(JSON.stringify(data), { status: res.status });
}
