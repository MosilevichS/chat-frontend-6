import Contacts from "@/src/components/ui/contacts/Contacts";

export default function ContactsLayout({
  chat,
}: {
  children: React.ReactNode;
  chat: React.ReactNode;
}) {
  return (
    <div className="flex flex-row gap-x-6 justify-center md:mb-1">
      <Contacts />
      {chat}
    </div>
  );
}
