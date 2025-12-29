import { useCallback, useEffect, useMemo, useState } from "react";

const LONG_BLOCK_KEY = "otp_resend_block_until";
const SHORT_COOLDOWN_SEC = 60;
const LONG_BLOCK_SEC = 60 * 60;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useCountdownUntil(until: number | null) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!until) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSecondsLeft(0);
      return;
    }

    const update = () => {
      const diff = Math.max(0, Math.floor((until - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [until]);

  return secondsLeft;
}

export function useOtpResend() {
  const [shortUntil, setShortUntil] = useState<number | null>(null);
  const [longUntil, setLongUntil] = useState<number | null>(null);

  // инициализация из localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(LONG_BLOCK_KEY);
    if (!saved) return;

    const until = Number(saved);
    if (Number.isNaN(until)) return;

    // если блокировка ещё актуальна
    if (until > Date.now()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLongUntil(until);
    } else {
      localStorage.removeItem(LONG_BLOCK_KEY);
    }
  }, []);

  // синхронизация с localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (longUntil && longUntil > Date.now()) {
      localStorage.setItem(LONG_BLOCK_KEY, longUntil.toString());
    } else {
      localStorage.removeItem(LONG_BLOCK_KEY);
    }
  }, [longUntil]);

  const shortLeft = useCountdownUntil(shortUntil);
  const longLeft = useCountdownUntil(longUntil);

  const activeSeconds = longLeft > 0 ? longLeft : shortLeft;
  const isDisabled = activeSeconds > 0;

  const label = useMemo(() => {
    return activeSeconds > 0
      ? `Отправить новый код через ${formatTime(activeSeconds)}`
      : "Отправить новый код";
  }, [activeSeconds]);

  const startShortCooldown = useCallback(() => {
    setShortUntil(Date.now() + SHORT_COOLDOWN_SEC * 1000);
  }, []);

  const startLongBlock = useCallback(() => {
    setLongUntil(Date.now() + LONG_BLOCK_SEC * 1000);
  }, []);

  return {
    isDisabled,
    label,
    startShortCooldown,
    startLongBlock,
  };
}
