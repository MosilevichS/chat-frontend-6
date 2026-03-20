import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ user_uid: string }> },
) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  const { user_uid } = await params;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!user_uid) {
    return NextResponse.json({ message: "Bad Request: Missing user_uid" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/contact/${user_uid}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
