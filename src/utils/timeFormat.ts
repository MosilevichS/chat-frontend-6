import { declension } from "./declension";

type TimeFormatMode = "relative" | "time";

export function timeFormat(time: Date | number, mode: TimeFormatMode = "relative"): string {
  if (!time) return "";

  const timestamp =
    typeof time === "number"
      ? time < 1e12
        ? time * 1000 // unix → ms
        : time
      : time.getTime();

  // HH:MM режим
  if (mode === "time") {
    return new Date(timestamp).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Relative режим
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  if (minutes < 1) return "только что";

  if (minutes < 60) {
    return `${minutes} ${declension(minutes, ["минут", "минуту", "минуты"], 2)} назад`;
  }

  if (hours < 24) {
    return `${hours} ${declension(hours, ["час", "часа", "часов"], 1)} назад`;
  }

  if (days === 1) return "вчера";

  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}
