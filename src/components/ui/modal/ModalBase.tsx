"use client";

import { useEffect } from "react";

interface IModalBase {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalBase = ({ isOpen, onClose, children }: IModalBase) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-(--color-overlay)"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
};

export default ModalBase;
