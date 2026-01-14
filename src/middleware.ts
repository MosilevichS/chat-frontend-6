import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/phone", "/phone-code"];
  const protectedPaths = ["/personal-data", "/done", "/support", "/chats"];

  // Публичные страницы
  if (publicPaths.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/chats", req.url));
    }
    return NextResponse.next();
  }

  // Защищённые страницы
  if (protectedPaths.includes(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
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
};
