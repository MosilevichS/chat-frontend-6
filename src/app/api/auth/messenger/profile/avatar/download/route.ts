import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "Файл не предоставлен" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const res = await fetch(
      `${process.env.API_URL}/api/v1/auth/messenger/profile/avatar/download/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: backendFormData,
      },
    );

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Ошибка:", error);
    return NextResponse.json({ message: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
