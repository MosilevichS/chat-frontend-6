export interface IUser {
  id?: number;
  nickname: string;
  first_name: string;
  last_name?: string | null;
  patronymic?: string | null;
  additional_information?: string | null;
  phone: string;
  email?: string | null;
  birthday?: number | null;
  gender?: "male" | "female" | "other";
  country?: string | null;
  city_id?: number | null;
}
