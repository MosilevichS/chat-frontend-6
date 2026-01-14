"use server";

import { cookies } from "next/headers";

export async function loginAction(payload: { phone_number: string; code: string }) {
  const res = await fetch(`${process.env.API_URL}/api/v1/auth/messenger/login/get/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to login");
  }

  const { access, refresh, is_filled }: { access: string; refresh: string; is_filled: boolean } =
    await res.json();

  const cookieStore = await cookies();
  cookieStore.set("accessToken", access, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("refreshToken", refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { is_filled };
}

export async function refreshAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await res.json();

  cookieStore.set("access_token", data.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
}
