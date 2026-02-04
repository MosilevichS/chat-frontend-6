"use client";

import BaseCreationPage from "@/components/ui/chats/BaseCreationPage";
import ChannelTypeSelector from "@/components/ui/chats/ChannelTypeSelector";
import { useState } from "react";

const NewChannelPage = () => {
  const [channelType, setChannelType] = useState<"public" | "private">("public");

  return (
    <BaseCreationPage
      title="Создать канал"
      typeSelector={<ChannelTypeSelector value={channelType} onChange={setChannelType} />}
      placeholderText="Пригласить участников"
      nextPagePath="/chats/add-subscribers?type=channel"
    />
  );
};

export default NewChannelPage;
