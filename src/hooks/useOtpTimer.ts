"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "otp_timers";

const SHORT_SEC = 60;
const BLOCK_10_MIN_SEC = 10 * 60;
const BLOCK_1_HOUR_SEC = 60 * 60;

type TimerType = "short" | "block10" | "block60";

type StoredTimer = {
  until: number;
  type: TimerType;
};

type StoredTimers = Record<string, StoredTimer>;

type Options = {
  autoStart?: boolean;
};

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function loadTimers(): StoredTimers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTimers(timers: StoredTimers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

function cleanupExpired(timers: StoredTimers) {
  const now = Date.now();
  for (const phone in timers) {
    if (timers[phone].until <= now) {
      delete timers[phone];
    }
  }
}

export function useOtpTimer(phone: string | null, options: Options = {}) {
  const { autoStart = true } = options;

  const normalizedPhone = phone ? normalizePhone(phone) : null;

  const [until, setUntil] = useState<number | null>(null);
  const [type, setType] = useState<TimerType | null>(null);
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now());
  const [initialized, setInitialized] = useState(false);

  const restoredRef = useRef(false);

  /* ---------- тик ---------- */
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------- восстановление ---------- */
  useEffect(() => {
    restoredRef.current = false;

    if (!normalizedPhone) {
      setUntil(null);
      setType(null);
      setInitialized(true);
      return;
    }

    const timers = loadTimers();
    cleanupExpired(timers);

    const saved = timers[normalizedPhone];

    if (saved && saved.until > Date.now()) {
      setUntil(saved.until);
      setType(saved.type);
      restoredRef.current = true;
    } else {
      setUntil(null);
      setType(null);
    }

    saveTimers(timers);
    setInitialized(true);
  }, [normalizedPhone]);

  /* ---------- автозапуск ---------- */
  useEffect(() => {
    if (!initialized || !normalizedPhone || !autoStart) return;

    if (restoredRef.current) return;

    if (!until) {
      // eslint-disable-next-line react-hooks/immutability
      startShort();
    }
  }, [initialized, normalizedPhone, autoStart, until]);

  /* ---------- storage sync (между вкладками) ---------- */
  useEffect(() => {
    if (!normalizedPhone) return;

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;

      const timers = loadTimers();
      const saved = timers[normalizedPhone];

      if (saved && saved.until > Date.now()) {
        setUntil(saved.until);
        setType(saved.type);
      } else {
        setUntil(null);
        setType(null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [normalizedPhone]);

  /* ---------- сохранение ---------- */
  useEffect(() => {
    if (!normalizedPhone) return;

    const timers = loadTimers();

    if (until && type && until > Date.now()) {
      timers[normalizedPhone] = { until, type };
    } else {
      delete timers[normalizedPhone];
    }

    saveTimers(timers);
  }, [until, type, normalizedPhone]);

  /* ---------- api ---------- */
  const start = useCallback((sec: number, t: TimerType) => {
    const u = Date.now() + sec * 1000;
    setUntil(u);
    setType(t);
  }, []);

  const startShort = useCallback(() => start(SHORT_SEC, "short"), [start]);

  const startBlock10 = useCallback(() => start(BLOCK_10_MIN_SEC, "block10"), [start]);

  const startBlock60 = useCallback(() => start(BLOCK_1_HOUR_SEC, "block60"), [start]);

  const reset = useCallback(() => {
    if (!normalizedPhone) return;

    const timers = loadTimers();
    delete timers[normalizedPhone];
    saveTimers(timers);

    setUntil(null);
    setType(null);
  }, [normalizedPhone]);

  /* ---------- computed ---------- */
  const secondsLeft = useMemo(() => {
    if (!until) return 0;
    return Math.max(0, Math.floor((until - now) / 1000));
  }, [until, now]);

  const isActive = secondsLeft > 0;

  const label = useMemo(() => {
    if (!isActive) return "Отправить новый код";

    if (type === "short") {
      return `Отправить новый код через ${formatTime(secondsLeft)}`;
    }

    return `Попробуйте снова через ${formatTime(secondsLeft)}`;
  }, [isActive, type, secondsLeft]);

  return {
    initialized,
    isActive,
    isButtonDisabled: isActive,
    secondsLeft,
    label,
    startShort,
    startBlock10,
    startBlock60,
    reset,
  };
}
