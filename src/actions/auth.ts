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

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      status: res.status,
      message: data?.detail || data?.message || "Неверный код",
      fieldErrors: data?.errors,
    };
  }

  const { access, refresh, is_filled }: { access: string; refresh: string; is_filled: boolean } =
    data;

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
  cookieStore.set("isFilled", String(is_filled), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  return { success: true, is_filled };
}

export async function refreshAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.API_URL}/api/v1/auth/login/refresh/token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);

  const data = await res.json();

  cookieStore.set("accessToken", data.accessToken, {
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
