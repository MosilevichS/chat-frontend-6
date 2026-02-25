import { useDelayedAction } from "@/src/hooks/useDelayedAction ";
import Image from "next/image";
import { useEffect } from "react";

import copyGreen from "@/src/assets/icons/copy-green.svg";

interface CopyInfoModal {
  setShowCopyModal: (showCopyModal: boolean) => void;
  copyInfo: { text: string; name: string; };
}

const CopyInfo = ({ setShowCopyModal, copyInfo }: CopyInfoModal) => {
  // Логика копирования
  const { executeAfterDelay } = useDelayedAction(4000);

  navigator.clipboard.writeText(copyInfo.text);

  useEffect(() => {
    executeAfterDelay(() => {
      setShowCopyModal(false);
    });
  }, []);

  return (
    <div
      className="absolute top-20 left-0 z-1 h-[50px] w-[358px] bg-(--color-black-light) text-white rounded-lg
                          flex gap-x-2 items-center px-4 text-[14px]"
    >
      <Image src={copyGreen} alt="Закрыть" width={24} height={24} />
      <p>{`${copyInfo.name} скопирован`}</p>
    </div>
  );
};

export default CopyInfo;
