import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  return NextResponse.json({
    token,
  });
}
