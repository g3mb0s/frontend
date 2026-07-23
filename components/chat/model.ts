export const STARTER_PROMPTS = [
  "Объясни разницу между Present Simple и Present Continuous",
  "Давай потренируем разговорный английский",
  "Проверь мой текст и объясни ошибки",
  "Составь план изучения английского на неделю",
];

export function conversationTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim();
  return normalized.length > 52 ? `${normalized.slice(0, 52)}…` : normalized;
}

export function formatConversationDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return new Intl.DateTimeFormat("ru-RU", {
    ...(sameDay ? { hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short" }),
  }).format(date);
}
