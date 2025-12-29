"use client";

import { useRef } from "react";
import clsx from "clsx";

import Tooltip from "./Tooltip";
import { ErrorMessage } from "./ErrorMessage";

interface IOPTInput {
  value: string;
  length?: number;
  onChange: (v: string) => void;
  onComplete: (code: string) => void;
  error: string | null;
  disabled?: boolean;
  onSupport: () => void;
  onResend: () => void;
  countdown: {
    isDisabled: boolean;
    label: string;
    startShortCooldown: () => void;
    startLongBlock: () => void;
  };
}

export default function OTPInput({
  value,
  onChange,
  onComplete,
  length = 5,
  error,
  disabled,
  onSupport,
  onResend,
  countdown,
}: IOPTInput) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (char: string, index: number) => {
    if (!/^\d?$/.test(char)) return;

    const newValue = value.substring(0, index) + char + value.substring(index + 1, length);

    onChange(newValue);

    if (index < length - 1 && char) {
      inputsRef.current[index + 1]?.focus();
    }

    if (index === length - 1 && newValue.length === length) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-1.5">
        <span className="text-lg font-medium">Введите код</span>
        <Tooltip>
          <p className="mb-1 md:mb-3 text-xs md:text-sm leading-[120%]">
            Код должен содержать только цифры, длина — 5 символов.
          </p>
          <p className="text-xs md:text-sm leading-[120%]">
            Не более 10 запросов кода в час. При превышении — блокировка номера на 60 минут.
          </p>
        </Tooltip>
      </div>

      {error && <ErrorMessage error={error} className="w-full max-w-[330px]" />}
      <div className="mb-3.5 md:mb-4 flex justify-center gap-[0.484rem]">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={el => {
              inputsRef.current[index] = el;
            }}
            value={value[index] || ""}
            maxLength={1}
            inputMode="numeric"
            autoComplete="one-time-code"
            onChange={e => handleChange(e.target.value, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            disabled={disabled}
            className={clsx(
              "h-[60px] w-full max-w-[60px] px-[0.938rem] py-[0.781rem] rounded-lg border text-center text-lg leading-[130%]",
              "outline-none transition-colors",
              "focus:border-2",
              error ? "border-(--color-error)" : "border-(--color-violet)",
              disabled ? "border-(--color-gray)" : "border-(--color-violet)",
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-[360px] flex flex-col justify-center">
        <button
          type="button"
          className="mb-5 md:mb-9.5 text-lg font-medium leading-[120%] text-(--color-violet) disabled:text-(--color-gray) hover:opacity-70"
          onClick={onResend}
          disabled={countdown.isDisabled}
        >
          {countdown.label}
        </button>
        <button
          type="button"
          className="text-lg font-medium leading-[120%] text-(--color-violet) disabled:text-(--color-gray) hover:opacity-70"
          onClick={onSupport}
        >
          Не приходит код?
        </button>
      </div>
    </div>
  );
}
