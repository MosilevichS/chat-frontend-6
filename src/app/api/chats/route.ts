import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/chat/list/?ordering=-last_activity_at&page_size=100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      return new Response("Failed to fetch data", { status: res.status });
    }

    const data = await res.json();

    const sortedData = data.results.sort(
      (a: { is_favorite: boolean }, b: { is_favorite: boolean }) => {
        if (a.is_favorite === b.is_favorite) {
          return 0;
        }

        // true идёт перед false
        return a.is_favorite ? -1 : 1;
      },
    );

    const responseData = {
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: sortedData,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
