export function timeFormat(timestamp: Date | number): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return "только что";
  }

  if (diffMin < 60) {
    return `${diffMin} минута${diffMin === 1 ? "" : diffMin < 5 ? "ы" : "н"} назад`;
  }

  if (diffHr < 24) {
    return `${diffHr} час${diffHr === 1 ? "" : diffHr < 5 ? "а" : "ов"} назад`;
  }

  if (diffDay === 1) {
    return "вчера";
  }

  const date = new Date(then);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
