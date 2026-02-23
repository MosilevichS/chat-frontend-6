import { cookies } from "next/headers";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: number }> }) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("accessToken")?.value;

  if (!token) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  const { id } = await params;

  try {
    await fetch(`${process.env.API_URL}/api/v1/contact/blacklist/delete/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Пробрасываем статус и данные backend напрямую
    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}
