"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Controller, type Control } from "react-hook-form";
import Image from "next/image";
import backIcon from "@/assets/icons/back-icon.svg";

interface DateSelectProps {
  name: string;
  control: Control<any>;
  fromYear?: number;
  toYear?: number;
  defaultValue?: { day: string; month: string; year: string };
}

interface DateValue {
  day: string;
  month: string;
  year: string;
}

const DateSelect = ({
  name,
  control,
  fromYear = 1900,
  toYear = new Date().getFullYear(),
  defaultValue = { day: "", month: "", year: "" },
}: DateSelectProps) => {
  const [open, setOpen] = useState<"day" | "month" | "year" | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Годы от текущего до fromYear
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => String(toYear - i));

  // Получение количества дней в месяце
  const getDaysInMonth = useCallback((month: string, year: string) => {
    if (!month || !year) return 31; // По умолчанию 31 день

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Проверка високосного года для февраля
    if (month === "02") {
      const isLeapYear = (yearNum % 4 === 0 && yearNum % 100 !== 0) || yearNum % 400 === 0;
      return isLeapYear ? 29 : 28;
    }

    // Месяцы с 30 днями
    const thirtyDayMonths = ["04", "06", "09", "11"];
    return thirtyDayMonths.includes(month) ? 30 : 31;
  }, []);

  // Обновление списка дней при изменении месяца или года
  const updateDaysList = useCallback(
    (month: string, year: string) => {
      const daysCount = getDaysInMonth(month, year);
      const days = Array.from({ length: daysCount }, (_, i) => String(i + 1).padStart(2, "0"));
      setDaysInMonth(days);
    },
    [getDaysInMonth],
  );

  // Получение названия месяца по значению
  const getMonthLabel = useCallback(
    (value: string) => {
      if (!value) return "";
      const month = months.find(m => m.value === value);
      return month ? month.label : "";
    },
    [months],
  );

  // Валидация дня при изменении месяца/года
  const validateDay = useCallback(
    (dateValue: DateValue): DateValue => {
      if (!dateValue.day || !dateValue.month || !dateValue.year) {
        return dateValue;
      }

      const dayNum = parseInt(dateValue.day);
      const maxDays = getDaysInMonth(dateValue.month, dateValue.year);

      if (dayNum > maxDays) {
        return { ...dateValue, day: String(maxDays).padStart(2, "0") };
      }

      return dateValue;
    },
    [getDaysInMonth],
  );

  // Обработчик изменения значения
  const handleChange = useCallback(
    (
      currentValue: DateValue,
      onChange: (value: DateValue) => void,
      field: keyof DateValue,
      newValue: string,
    ) => {
      const newDateValue = { ...currentValue, [field]: newValue };

      // Если меняем месяц или год, валидируем день
      if (field === "month" || field === "year") {
        const validatedValue = validateDay(newDateValue);

        // Обновляем список дней
        if (validatedValue.month && validatedValue.year) {
          updateDaysList(validatedValue.month, validatedValue.year);
        }

        onChange(validatedValue);
      } else {
        onChange(newDateValue);
      }

      setOpen(null);
    },
    [validateDay, updateDaysList],
  );

  // Обработчик клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Инициализация списка дней
  useEffect(() => {
    if (defaultValue.month && defaultValue.year) {
      updateDaysList(defaultValue.month, defaultValue.year);
    } else {
      // По умолчанию 31 день
      setDaysInMonth(Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")));
    }
  }, [defaultValue.month, defaultValue.year, updateDaysList]);

  const inputClass =
    "h-10 w-full bg-white cursor-pointer rounded-lg border border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none";
  const dropdownClass =
    "absolute z-50 mt-1 w-full max-h-45 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg";
  const optionClass = "cursor-pointer px-4 py-2 text-sm hover:bg-blue-50 transition-colors";

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <div ref={containerRef} className="flex items-start gap-3">
          {/* День */}
          <div className="relative w-24">
            <div className="relative">
              <input
                readOnly
                placeholder="День"
                value={field.value?.day || ""}
                onClick={() => setOpen(open === "day" ? null : "day")}
                className={inputClass}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Image
                  src={backIcon}
                  width={12}
                  height={12}
                  alt=""
                  className={`transition-transform ${open === "day" ? "rotate-90" : "-rotate-90"}`}
                />
              </div>
            </div>

            {open === "day" && (
              <div className={dropdownClass}>
                {daysInMonth.map(day => (
                  <div
                    key={day}
                    onClick={() => handleChange(field.value, field.onChange, "day", day)}
                    className={`${optionClass} ${field.value?.day === day ? "bg-blue-100 font-medium" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Месяц */}
          <div className="relative w-36">
            <div className="relative">
              <input
                readOnly
                placeholder="Месяц"
                value={getMonthLabel(field.value?.month || "")}
                onClick={() => setOpen(open === "month" ? null : "month")}
                className={inputClass}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Image
                  src={backIcon}
                  width={12}
                  height={12}
                  alt=""
                  className={`transition-transform ${open === "month" ? "rotate-90" : "-rotate-90"}`}
                />
              </div>
            </div>

            {open === "month" && (
              <div className={dropdownClass}>
                {months.map(month => (
                  <div
                    key={month.value}
                    onClick={() => handleChange(field.value, field.onChange, "month", month.value)}
                    className={`${optionClass} ${field.value?.month === month.value ? "bg-blue-100 font-medium" : ""}`}
                  >
                    {month.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Год */}
          <div className="relative w-28">
            <div className="relative">
              <input
                readOnly
                placeholder="Год"
                value={field.value?.year || ""}
                onClick={() => setOpen(open === "year" ? null : "year")}
                className={inputClass}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Image
                  src={backIcon}
                  width={12}
                  height={12}
                  alt=""
                  className={`transition-transform ${open === "year" ? "rotate-90" : "-rotate-90"}`}
                />
              </div>
            </div>

            {open === "year" && (
              <div className={dropdownClass}>
                {years.map(year => (
                  <div
                    key={year}
                    onClick={() => handleChange(field.value, field.onChange, "year", year)}
                    className={`${optionClass} ${field.value?.year === year ? "bg-blue-100 font-medium" : ""}`}
                  >
                    {year}
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
