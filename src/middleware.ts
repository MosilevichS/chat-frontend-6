import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const token = localStorage.getItem("refreshToken");
  // if (request.nextUrl.pathname === "/") {
  //   return NextResponse.redirect(new URL("/chats", request.url));
  // }

  return NextResponse.next();
}
