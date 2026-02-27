import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }
// api/v1/chat/calls/ice-servers/
  try {
    const res = await fetch(`${process.env.API_URL}/api/v1/chat/calls/ice-servers/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return new Response("Failed to fetch data", { status: res.status });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
