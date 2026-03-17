import edit from "@/assets/icons/edit.svg";
import black_list from "@/assets/icons/black_list.svg";
import mail from "@/assets/icons/mail.svg";


interface userProfileAction {
  picture: string;
  name: string;
  href: string;
}
export const userProfileActions: userProfileAction[] = [
  { picture: edit, name: "Редактирование профиля", href: "/settings/profile" },
  { picture: black_list, name: "Чёрный список", href: "/settings/blackList" },
  { picture: mail, name: "Поддержка", href: "/settings/support" },
] as const;
