import { redirect } from "next/navigation";

const Chats = () => {
  const user = false;

  if (!user) {
    redirect("/auth");
  }

  return <>chats</>;
};

export default Chats;
