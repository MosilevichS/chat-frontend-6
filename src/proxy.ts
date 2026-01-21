import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const isFilled = req.cookies.get("isFilled")?.value;

  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  if (!accessToken && refreshToken) {
    const refreshResponse = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshResponse.ok) {
      const { access, refresh } = await refreshResponse.json();

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
  }

  const publicPaths = ["/", "/phone", "/phone-code"];
  const protectedPaths = [
    "/personal-data",
    "/done",
    "/support",
    "/chats",
    "/contacts",
    "/settings",
    "/groups",
  ];

  // Публичные страницы
  if (publicPaths.includes(pathname)) {
    if (accessToken && isFilled === "true") {
      return NextResponse.redirect(new URL("/chats", req.url));
    }
    return response;
  }

  // Защищённые страницы
  if (protectedPaths.includes(pathname)) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isFilled === "true" && pathname === "/personal-data") {
      return NextResponse.redirect(new URL("/chats", req.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/phone/:path*",
    "/phone-code/:path*",
    "/personal-data/:path*",
    "/done/:path*",
    "/support/:path*",
    "/chats/:path*",
    "/contacts/:path*",
    "/settings/:path*",
    "/groups/:path*",
  ],
};
