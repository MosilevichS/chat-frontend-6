interface ISystemContact {
  avatar?: string;
  avatar_url?: string;
  avatar_webp?: string;
  avatar_webp_url?: string;
  is_online: boolean;
  uid: string;
  was_online_at: number;
}

export interface IContact {
  username: string;
  nickname: string;
  was_online_at: number;
  is_online: boolean;
  avatar_url: string;
  birthday: number;
  owner_user: string;
  phone: string;
  first_name: string;
  last_name: string;
  system_contact: ISystemContact;
  uid: string;
}

