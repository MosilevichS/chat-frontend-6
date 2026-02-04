import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();

  let accessToken = (await cookieStore).get("accessToken")?.value;
  const refreshToken = (await cookieStore).get("refreshToken")?.value;

  // Обновление accessToken с помощью refreshToken
  if (!accessToken && refreshToken) {
    const refreshResponse = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshResponse.ok) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    const { access, refresh } = await refreshResponse.json();
    accessToken = access;

    const response = NextResponse.json({ token: accessToken });

    response.cookies.set("accessToken", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    response.cookies.set("refreshToken", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  }

  if (!accessToken) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  return NextResponse.json({ token: accessToken });
}
