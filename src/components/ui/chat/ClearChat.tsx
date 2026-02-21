import { useEffect } from "react";

import { useDelayedAction } from "@/src/hooks/useDelayedAction ";
import { CounterWithCircle } from "../CounterWithCircle ";
import { useClearChatMutation } from "@/src/services/chatsApi";

interface ClearChatProps {
  setShowClearChatModal: (showClearChatModal: boolean) => void;
  chatId: number;
}

const ClearChat = ({ setShowClearChatModal, chatId }: ClearChatProps) => {
  const { executeAfterDelay, cancel } = useDelayedAction(4000);
  const [clearChat] = useClearChatMutation();

  useEffect(() => {
    executeAfterDelay(async () => {
      setShowClearChatModal(false);
      try {
        await clearChat({
          id: chatId,
        }).unwrap();
      } catch (err) {
        console.error("Ошибка:", err);
      }
    });
  }, []);

  const handleChatClearCancel = () => {
    cancel();
    setShowClearChatModal(false);
  };

  return (
    <div
      className="absolute top-20 left-0 z-1 h-[50px] w-[358px] bg-(--color-black-light) text-white rounded-lg
            flex justify-between items-center px-4 text-[14px]"
    >
      <div className="flex gap-x-2">
        <CounterWithCircle />
        <p>История чата удаляется</p>
      </div>
      <button className="text-[#CEC8FF] cursor-pointer z-3" onClick={() => handleChatClearCancel()}>
        Отмена
      </button>
    </div>
  );
};

export default ClearChat;
