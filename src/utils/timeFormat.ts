import { declension } from "./declension";

export function timeFormat(time: Date | number): string {
  if (typeof time !== "number" || time < 0) {
    return "";
  }

  const now = new Date().getTime();
  const differenceTime = now - time;
  const day = differenceTime / 1000 / 60 / 60 / 24;

  if (day < 1) {
    const hours = differenceTime / 1000 / 60 / 60;
    const minutes = differenceTime / 1000 / 60;

    if (minutes < 1 && hours < 1) {
      return "только что";
    }

    if (minutes >= 1 && hours < 1) {
      return `${new Date(differenceTime).getUTCMinutes()} ${declension(
        new Date(differenceTime).getUTCMinutes(),

        ["минут", "минуту", "минуты"],
        2,
      )} назад`;
    }

    if (hours >= 1) {
      return `${new Date(differenceTime).getUTCHours()} ${declension(
        new Date(differenceTime).getUTCHours(),

        ["час", "часа", "часов"],
        1,
      )} назад`;
    }
  }

  if (day < 2 && day >= 1) {
    return "вчера";
  }

  if (day >= 2) {
    const result = new Date(time).toLocaleDateString("ru-Ru", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });

    return result;
  }

  return "";
}
