import { redirect } from "next/navigation";

const Chats = () => {
  const user = true;

  if (!user) {
    redirect("/auth");
  }

  return <>chats</>;
};

export default Chats;
