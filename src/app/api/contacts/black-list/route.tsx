import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Получаем параметры из URL (не из body!)
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const page_size = searchParams.get("page_size") || "20";

    // Первый запрос к защищённому ресурсу
    let res = await fetch(
      `${process.env.API_URL}/api/v1/contact/blacklist/?page=${page}&page_size=${page_size}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Если токен истёк, обновляем его
    if (res.status === 401) {
      const refreshToken = cookieStore.get("refreshToken")?.value;

      const refreshRes = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshRes.ok) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { access, refresh } = await refreshRes.json();

      // Обновляем куки
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
      res = await fetch(
        `${process.env.API_URL}/api/v1/contact/blacklist/?page=${page}&page_size=${page_size}`,
        {
          method: "GET", // ДОЛЖЕН БЫТЬ GET, не POST!
          headers: {
            Authorization: `Bearer ${access}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/contacts/blackList:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
