"use client";

import BaseCreationPage from "../_components/BaseCreationPage";
import ChannelTypeSelector from "../_components/ChannelTypeSelector";
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