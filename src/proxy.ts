/*import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const isFilled = req.cookies.get("isFilled")?.value;

  const { pathname } = req.nextUrl;

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
    if (token && isFilled === "true") {
      return NextResponse.redirect(new URL("/chats", req.url));
    }
    return NextResponse.next();
  }

  // Защищённые страницы
  if (protectedPaths.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isFilled === "true" && pathname === "/personal-data") {
      return NextResponse.redirect(new URL("/chats", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
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
  ],
};*/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Редирект с корня сразу в чаты
  if (pathname === '/') {
    return NextResponse.redirect(new URL("/chats", req.url));
  }
  
  // Для разработки всегда разрешаем доступ
  const response = NextResponse.next();
  
  // Устанавливаем тестовый токен
  response.cookies.set({
    name: 'accessToken',
    value: 'dev_test_token',
    path: '/',
    maxAge: 86400,
  });
  
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
  ],
};