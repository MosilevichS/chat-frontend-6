"use client";

import BaseCreationPage from "@/src/components/ui/chats/BaseCreationPage";
import GroupTypeSelector from "@/src/components/ui/chats/GroupTypeSelector";
import { useState } from "react";

const NewGroupPage = () => {
  const [groupType, setGroupType] = useState<"closed" | "open">("closed");

  return (
    <BaseCreationPage
      title="Создать группу"
      typeSelector={<GroupTypeSelector value={groupType} onChange={setGroupType} />}
      placeholderText="Пригласить участников"
      nextPagePath="/chats/add-subscribers?type=group"
    />
  );
};

export default NewGroupPage;