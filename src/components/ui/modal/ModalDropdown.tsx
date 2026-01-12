"use client";

import { useEffect } from "react";

interface IModalDropdown {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const ModalDropdown = ({ onClose, children, className = "" }: IModalDropdown) => {
  // Закрытие по Escape
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
    <>
      {/* Оверлей */}
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />

      {/* Выпадающее меню */}
      <div className={`absolute z-50 ${className}`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </>
  );
};

export default ModalDropdown;
