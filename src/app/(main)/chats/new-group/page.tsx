"use client";

import BaseCreationPage from "../_components/BaseCreationPage";
import GroupTypeSelector from "../_components/GroupTypeSelector";
import { useState } from "react";

const NewGroupPage = () => {
  const [groupType, setGroupType] = useState<"closed" | "open">("closed");

  return (
    <BaseCreationPage
      title="Создать группу"
      typeSelector={<GroupTypeSelector value={groupType} onChange={setGroupType} />}
      placeholderText="Выберите контакт для начала общения"
    />
  );
};

export default NewGroupPage;
