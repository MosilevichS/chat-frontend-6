import { z } from "zod";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Схема ошибок валидации полей
 * { field: ["message"] }
 */
const validationErrorSchema = z.record(z.string(), z.array(z.string()));

/**
 * Схема обычной ошибки
 * { message: "text" }
 */
const messageErrorSchema = z.object({
  message: z.string(),
});

export function parseApiError(error: unknown): {
  fieldErrors?: Record<string, string[]>;
  message?: string;
} {
  const err = error as FetchBaseQueryError;

  if (!err?.data) {
    return { message: "Ошибка сети" };
  }

  // Ошибки формы
  const validation = validationErrorSchema.safeParse(err.data);
  if (validation.success) {
    return { fieldErrors: validation.data };
  }

  // Обычная ошибка
  const message = messageErrorSchema.safeParse(err.data);
  if (message.success) {
    return { message: message.data.message };
  }

  return { message: "Неизвестная ошибка" };
}
