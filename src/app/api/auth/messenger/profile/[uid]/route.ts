import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  try {
    const { uid } = await params;

    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const res = await fetch(`${process.env.API_URL}/api/v1/auth/messenger/profile/${uid}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Ошибка при удалении профиля:", error);

    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
