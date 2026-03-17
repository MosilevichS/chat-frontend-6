export interface IMessage {
  id: number;
  uid: string;
  from_user: FromUser;
  to_user: ToUser;
  content: string;
  replied_messages: RepliedMessage[];
  forwarded_messages: ForwardedMessage[];
  files_list: FilesList3[];
  new: boolean;
  created_at: number;
  updated_at: number;
  chat_id: number;
  chat_key: string;
  chat_type: string;
  message_rtc: MessageRtc | null;
  pending?: boolean;
}

export interface FromUser {
  uid: string;
  username: string;
  nickname: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  avatar_webp_url: string;
}

export interface ToUser {
  uid: string;
  username: string;
  nickname: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  avatar_webp_url: string | null;
}

export interface RepliedMessage {
  id: number;
  uid: string;
  from_user: string;
  first_name: string;
  last_name: string;
  content: string;
  files_list: FilesList[];
}

export interface FilesList {
  id: number;
  uid: string;
  file_url: string;
  file_webp_url: string;
  file_type: string;
  created_at: number;
  updated_at: number;
}

export interface ForwardedMessage {
  id: number;
  uid: string;
  from_user: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  avatar_webp_url: string;
  content: string;
  files_list: FilesList2[];
}

export interface FilesList2 {
  id: number;
  uid: string;
  file_url: string;
  file_webp_url: string;
  file_type: string;
  created_at: number;
  updated_at: number;
}

export interface FilesList3 {
  id: number;
  uid: string;
  file_url: string;
  file_webp_url: string;
  file_type: string;
  created_at: number;
  updated_at: number;
}

export interface MessageRtc {
  uid: string;
  duration: number;
  status: string;
  updated_at: number;
  created_at: number;
}
