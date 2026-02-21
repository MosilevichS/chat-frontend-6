interface User {
  avatar_url: string | null;
  avatar_webp_url: string | null;
  first_name: string;
  last_name: string;
  nickname: string;
  uid: string;
  username: string;
  is_online: boolean;
  is_blocked: boolean;
  is_in_contacts: boolean;
  was_online_at: number;
}

interface MessageSummary {
  id: number;
  uid: string; // UUID сообщения
}

interface FilesSummary {
  count: number;
  types: string[]; // массив типов файлов (например, ['image', 'pdf'])
}

interface LastMessage {
  content: string;
  created_at: number;
  from_user: string; // uid отправителя
  files_summary: FilesSummary;
  has_forwarded_message: boolean;
  has_replied_message: boolean;
  id: number;
  new: boolean; // флаг нового (непрочитанного) сообщения
  uid: string; // UUID сообщения
  updated_at: number;
}

export interface Chat {
  chat: User | null; // может быть null для групп/каналов
  chat_key: string;
  chat_type: string; // например, 'chat', 'group'
  created_by: string; // uid создателя чата
  description?: string; // описание группы/канала (может отсутствовать)
  first_new_message: MessageSummary;
  id: number; // внутренний ID чата
  is_favorite: boolean;
  last_activity_at: number;
  last_message: LastMessage;
  last_seen_message: MessageSummary | null; // последнее просмотренное сообщение
  name: string; // название чата (может быть пустым)
  new_message_count: number; // количество новых сообщений
  notifications: boolean; // включены ли уведомления
}
