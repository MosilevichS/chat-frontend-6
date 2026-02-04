const formatChatDate = (ts: number) => {
  const date = new Date(ts * 1000);

  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) {
    return "Сегодня";
  }

  if (target.getTime() === yesterday.getTime()) {
    return "Вчера";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

export default formatChatDate;
