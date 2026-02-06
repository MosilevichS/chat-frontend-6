import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { timeFormat } from "@/src/utils/timeFormat";

import checkboxDone from "../../../assets/icons/checkbox-done.svg";
import checkbox from "../../../assets/icons/checkbox.svg";

interface IUserContact {
  uid: string;
  first_name: string;
  last_name: string;
  system_contact: {
    uid: string;
    avatar_url?: string;
    is_online: boolean;
    was_online_at: number;
  };
}

interface IContactItemProps {
  contact: IUserContact;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (uid: string) => void;
  isToggleButtonVisible?: boolean;
}

const ContactItem = ({
  contact,
  isSelected,
  isEditing,
  onSelect,
  isToggleButtonVisible,
}: IContactItemProps) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(`/contacts/${contact.system_contact.uid}`);

  return (
    <Link
      href={`/contacts/${contact.system_contact.uid}`}
      key={contact.uid}
      className={`flex items-center py-1.5 gap-x-2.5 min-w-[344px] h-[72px] cursor-pointer hover:bg-(--color-gray-2)
                   rounded-lg px-2 mt-2.5 mb-1
               ${isSelected ? "bg-(--color-violet-1) hover:bg-(--color-violet-2)" : ""}
               ${isActive && !isEditing ? "bg-(--color-violet-dark-opacity) hover:bg-(--color-violet-dark-opacity)" : ""}`}
    >
      {contact.system_contact.avatar_url ? (
        <div className="min-w-10 min-h-10 w-10! h-10!  rounded-full overflow-hidden">
          <Image
            src={contact.system_contact.avatar_url}
            alt="Аватар"
            width={40}
            height={40}
            className="object-fill w-full h-full"
            priority
          />
        </div>
      ) : (
        <Image
          className="h-10 w-10"
          src="/avatar/avatar-8.png"
          width={40}
          height={40}
          alt="Аватар"
        />
      )}
      <div className="flex justify-between relative h-[40px] after:absolute after:left-0 after:right-0 after:bottom-[-22px] after:border-b after:border-1 after:border-(--color-button-disabled) after:z--1 w-full">
        <div>
          <p
            className={`font-medium text-lg leading-[1.2] truncate max-w-[165px] mb-0.5
                ${isSelected ? "text-white" : ""}
                ${isActive && !isEditing ? "text-white" : ""}`}
          >
            {contact.first_name} {contact.last_name}
          </p>
          {contact.system_contact.is_online ? (
            <p
              className={`text-sm font-normal text-(--color-violet) leading-[1.2] tracking-[1%] line-clamp-2
                  ${isSelected ? "text-white" : ""}
                  ${isActive && !isEditing ? "text-white" : ""}`}
            >
              в сети
            </p>
          ) : (
            <p
              className={`text-sm font-normal text-(--color-gray) leading-[1.2] tracking-[1%] line-clamp-2
                   ${isSelected ? "text-white" : ""}
                   ${isActive && !isEditing ? "text-white" : ""}`}
            >
              был(а) {timeFormat(contact.system_contact.was_online_at * 1000)}
            </p>
          )}
        </div>
        {isEditing && isToggleButtonVisible && (
          <button
            className="cursor-pointer"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(contact.uid);
            }}
          >
            <Image
              src={isSelected ? checkboxDone : checkbox}
              alt={isSelected ? "Выбрано" : "Выбрать"}
              width={24}
              height={24}
              className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]"
            />
          </button>
        )}
      </div>
    </Link>
  );
};

export default ContactItem;
