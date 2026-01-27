export interface DateParts {
  day: string;
  month: string;
  year: string;
}

/**
 * Преобразует объект даты в timestamp (миллисекунды)
 */
export function dateToTimestamp(date: DateParts): number | null {
  if (!date.day || !date.month || !date.year) return null;

  const ts = Date.UTC(
    Number(date.year),
    Number(date.month) - 1,
    Number(date.day),
    12, // защита от timezone
  );

  return isNaN(ts) ? null : ts;
}


/**
 * Преобразует объект даты в Unix timestamp (секунды)
 */
export function dateToUnixTimestamp(date: {
  day: string;
  month: string;
  year: string;
}): number | null {
  const { day, month, year } = date;

  if (!day || !month || !year) return null;

  return Math.floor(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      12, // ⬅ Устанавливаем полдень для избежания проблем с часовыми поясами
    ) / 1000,
  );
}

/**
 * Преобразует timestamp в объект даты
 */
export function timestampToDateParts(timestamp?: number): DateParts {
  if (!timestamp) return { day: "", month: "", year: "" };

  const date = new Date(timestamp);

  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    year: String(date.getUTCFullYear()),
  };
}
/**
 * Преобразует Unix timestamp (секунды) в объект даты
 */
export function unixTimestampToDateParts(unixTimestamp?: number): DateParts {
  if (!unixTimestamp) return { day: "", month: "", year: "" };
  return timestampToDateParts(unixTimestamp * 1000);
}

/**
 * Проверяет валидность даты
 */
export function isValidDate(date: DateParts): boolean {
  return dateToTimestamp(date) !== null;
}

/**
 * Форматирует дату в строку для отображения
 */
export function formatDate(date: DateParts, format: "ru" | "iso" | "us" = "ru"): string {
  if (!isValidDate(date)) return "";

  const day = parseInt(date.day);
  const month = parseInt(date.month);
  const year = parseInt(date.year);

  switch (format) {
    case "ru":
      return `${day}.${month}.${year}`;
    case "iso":
      return `${year}-${date.month}-${date.day}`;
    case "us":
      return `${date.month}/${date.day}/${year}`;
    default:
      return `${day}.${month}.${year}`;
  }
}

/**
 * Преобразует Date объект в DateParts
 */
export function dateToDateParts(date: Date): DateParts {
  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    year: String(date.getUTCFullYear()),
  };
}

/**
 * Преобразует DateParts в Date объект
 */
export function datePartsToDate(date: DateParts): Date | null {
  if (!isValidDate(date)) return null;

  return new Date(
    Date.UTC(
      Number(date.year),
      Number(date.month) - 1,
      Number(date.day),
      12,
    ),
  );
}


/**
 * Преобразует строку формата ISO (YYYY-MM-DD) в DateParts
 */
export function isoStringToDateParts(isoString?: string): DateParts {
  if (!isoString) return { day: "", month: "", year: "" };

  try {
    const [year, month, day] = isoString.split("-");
    return {
      day: day || "",
      month: month || "",
      year: year || "",
    };
  } catch {
    return { day: "", month: "", year: "" };
  }
}

/**
 * Преобразует DateParts в строку формата ISO (YYYY-MM-DD)
 */
export function datePartsToIsoString(date: DateParts): string | null {
  if (!isValidDate(date)) return null;
  return `${date.year}-${date.month}-${date.day}`;
}

/**
 * Добавляет дни к DateParts
 */
export function addDaysToDate(date: DateParts, days: number): DateParts {
  const baseTs = dateToTimestamp(date);
  if (!baseTs) return date;

  const newDate = new Date(baseTs);
  newDate.setUTCDate(newDate.getUTCDate() + days);

  return timestampToDateParts(newDate.getTime());
}
/**
 * Вычисляет возраст по дате рождения
 */
export function calculateAge(
  birthDate: DateParts,
  referenceDate: DateParts = dateToDateParts(new Date()),
): number | null {
  const birthTs = dateToTimestamp(birthDate);
  const refTs = dateToTimestamp(referenceDate);

  if (!birthTs || !refTs) return null;

  const birth = new Date(birthTs);
  const ref = new Date(refTs);

  let age = ref.getUTCFullYear() - birth.getUTCFullYear();

  if (
    ref.getUTCMonth() < birth.getUTCMonth() ||
    (ref.getUTCMonth() === birth.getUTCMonth() &&
      ref.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Сравнивает две даты
 * @returns -1 если date1 < date2, 0 если равны, 1 если date1 > date2
 */
export function compareDates(date1: DateParts, date2: DateParts): number {
  const timestamp1 = dateToTimestamp(date1);
  const timestamp2 = dateToTimestamp(date2);

  if (timestamp1 === null && timestamp2 === null) return 0;
  if (timestamp1 === null) return -1;
  if (timestamp2 === null) return 1;

  return Math.sign(timestamp1 - timestamp2);
}

/**
 * Проверяет, является ли год високосным
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Получает количество дней в месяце с учетом года
 */
export function getDaysInMonth(month: string, year: string): number {
  if (!month || !year) return 31;

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);

  if (month === "02") {
    return isLeapYear(yearNum) ? 29 : 28;
  }

  const thirtyDayMonths = ["04", "06", "09", "11"];
  return thirtyDayMonths.includes(month) ? 30 : 31;
}

// Экспорт всех функций как объекта для удобного импорта
export const dateUtils = {
  dateToTimestamp,
  dateToUnixTimestamp,
  timestampToDateParts,
  unixTimestampToDateParts,
  isValidDate,
  formatDate,
  dateToDateParts,
  datePartsToDate,
  isoStringToDateParts,
  datePartsToIsoString,
  addDaysToDate,
  calculateAge,
  compareDates,
  isLeapYear,
  getDaysInMonth,
};
