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
    maxAge: 60 * 10,
  });
  cookieStore.set("refreshToken", refresh, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  cookieStore.set("isFilled", String(is_filled), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { success: true, is_filled };
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete({
    name: "accessToken",
    path: "/",
  });
  cookieStore.delete({
    name: "refreshToken",
    path: "/",
  });
  cookieStore.delete({
    name: "isFilled",
    path: "/",
  });

  return { success: true };
}
