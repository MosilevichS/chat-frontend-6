"use client";

import { useState, useEffect } from "react";

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      // если state пустой (null, undefined, пустая строка), удаляем из localStorage
      if (state === null || state === undefined || (typeof state === "string" && state === "")) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error(`Ошибка работы с localStorage для ключа "${key}"`, error);
    }
  }, [key, state]);

  return [state, setState];
}
