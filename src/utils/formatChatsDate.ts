export function formatChatsDate(timestamp: number): string {
  const eventDate = new Date(timestamp);
  // Начало текущего дня (00:00:00 в локальном времени)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Неделя назад от начала сегодняшнего дня
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);

  // Форматируем время: ЧЧ:ММ
  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Массив названий дней недели
  const daysOfWeek = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

  if (timestamp >= today.getTime()) {
    // Событие сегодня
    return formatTime(eventDate);
  } else if (timestamp >= oneWeekAgo.getTime()) {
    // Событие в течение последней недели
    const dayName = daysOfWeek[eventDate.getDay()];
    return `${dayName}`;
  } else {
    // Событие больше недели назад
    const day = String(eventDate.getDate()).padStart(2, "0");
    const month = String(eventDate.getMonth() + 1).padStart(2, "0"); // Месяц от 0 до 11
    const year = String(eventDate.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  }
}
