"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, type Control } from "react-hook-form";

interface DateSelectProps {
  name: string;
  control: Control<any>;
  fromYear?: number;
  toYear?: number;
}

const DateSelect = ({
  name,
  control,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DateSelectProps) => {
  const [open, setOpen] = useState<"day" | "month" | "year" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const months = [
    { value: "01", label: "Январь" },
    { value: "02", label: "Февраль" },
    { value: "03", label: "Март" },
    { value: "04", label: "Апрель" },
    { value: "05", label: "Май" },
    { value: "06", label: "Июнь" },
    { value: "07", label: "Июль" },
    { value: "08", label: "Август" },
    { value: "09", label: "Сентябрь" },
    { value: "10", label: "Октябрь" },
    { value: "11", label: "Ноябрь" },
    { value: "12", label: "Декабрь" },
  ];

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => String(toYear - i));

  const inputClass =
    "h-10 w-full bg-[color:var(--color-white)] cursor-pointer rounded-lg border border-[color:var(--color-gray)] px-3 text-sm focus:border-blue-500 focus:outline-none";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getMonthLabel = (value: string) =>
    months.find(m => m.value === value)?.label ?? ""

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={{ day: "1", month: "Января", year: "2000" }}
      render={({ field }) => (
        <div ref={ref} className="flex gap-3 relative">
          {/* День */}
          <div className="relative w-20">
            <input
              readOnly
              placeholder="ДД"
              value={field.value.day}
              onClick={() => setOpen(open === "day" ? null : "day")}
              className={inputClass}
            />

            {open === "day" && (
              <div className="absolute z-50 mt-1 max-h-35 w-full overflow-y-auto rounded-lg border bg-white shadow">
                {days.map(d => (
                  <div
                    key={d}
                    onClick={() => {
                      field.onChange({ ...field.value, day: d });
                      setOpen(null);
                    }}
                    className="cursor-pointer px-2 py-1 text-sm hover:bg-blue-100"
                  >
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Месяц */}
          <div className="relative w-32">
            <input
              readOnly
              placeholder="ММ"
              value={getMonthLabel(field.value.month)}
              onClick={() => setOpen(open === "month" ? null : "month")}
              className={inputClass}
            />

            {open === "month" && (
              <div className="absolute z-50 mt-1 max-h-35 w-full overflow-y-auto rounded-lg border bg-white shadow">
                {months.map(m => (
                  <div
                    key={m.value}
                    onClick={() => {
                      field.onChange({
                        ...field.value,
                        month: m.value,
                      });
                      setOpen(null);
                    }}
                    className="cursor-pointer px-2 py-1 text-sm hover:bg-blue-100"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Год */}
          <div className="relative w-24">
            <input
              readOnly
              placeholder="ГГГГ"
              value={field.value.year}
              onClick={() => setOpen(open === "year" ? null : "year")}
              className={inputClass}
            />

            {open === "year" && (
              <div className="absolute z-50 mt-1 max-h-35 w-full overflow-y-auto rounded-lg border bg-white shadow">
                {years.map(y => (
                  <div
                    key={y}
                    onClick={() => {
                      field.onChange({
                        ...field.value,
                        year: y,
                      });
                      setOpen(null);
                    }}
                    className="cursor-pointer px-2 py-1 text-sm hover:bg-blue-100"
                  >
                    {y}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default DateSelect;
