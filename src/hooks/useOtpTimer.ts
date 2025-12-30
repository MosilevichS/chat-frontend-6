"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "otp_timer";

const SHORT_SEC = 60;
const BLOCK_10_MIN_SEC = 10 * 60;
const BLOCK_1_HOUR_SEC = 60 * 60;

type TimerType = "short" | "block10" | "block60";

type StoredTimer = {
  until: number;
  type: TimerType;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useOtpTimer() {
  const [until, setUntil] = useState<number | null>(null);
  const [type, setType] = useState<TimerType | null>(null);
  const [now, setNow] = useState(Date.now());
  const [initialized, setInitialized] = useState(false);

  // Тик
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Восстановление
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setInitialized(true);
      return;
    }

    try {
      const saved = JSON.parse(raw) as StoredTimer;

      if (saved.until > Date.now()) {
        setUntil(saved.until);
        setType(saved.type);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Автозапуск 60 сек
  useEffect(() => {
    if (!initialized) return;

    if (!until) {
      startShort();
    }
  }, [initialized, until]);

  const secondsLeft = useMemo(() => {
    if (!until) return 0;
    return Math.max(0, Math.floor((until - now) / 1000));
  }, [until, now]);

  const isActive = secondsLeft > 0;
  const isButtonDisabled = isActive;

  // Синхронизация
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (until && type && until > Date.now()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ until, type }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [until, type]);

  const start = useCallback((sec: number, t: TimerType) => {
    const u = Date.now() + sec * 1000;
    setUntil(u);
    setType(t);
  }, []);

  const startShort = useCallback(() => {
    start(SHORT_SEC, "short");
  }, [start]);

  const startBlock10 = useCallback(() => {
    start(BLOCK_10_MIN_SEC, "block10");
  }, [start]);

  const startBlock60 = useCallback(() => {
    start(BLOCK_1_HOUR_SEC, "block60");
  }, [start]);

  const label = useMemo(() => {
    if (!isActive) return "Отправить новый код";

    if (type === "short") {
      return `Отправить новый код через ${formatTime(secondsLeft)}`;
    }

    return `Попробуйте снова через ${formatTime(secondsLeft)}`;
  }, [isActive, type, secondsLeft]);

  return {
    isButtonDisabled,
    label,
    startShort,
    startBlock10,
    startBlock60,
    initialized,
  };
}
