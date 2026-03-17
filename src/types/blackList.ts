export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface IBlackListContact {
  blocked_user: IBlockedUser;
}
export interface IBlockedUser {
  uid: string;
  is_deleted: boolean;
  username: string;
  nickname: string | null;
  phone: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  avatar_url: string | null;
  avatar_webp: string | null;
  avatar_webp_url: string | null;
  avatar_small_url: string | null;
  avatar_master_url: string;
  additional_information: string;
  birthday: string | null;
  is_online: boolean;
  was_online_at: number;
}