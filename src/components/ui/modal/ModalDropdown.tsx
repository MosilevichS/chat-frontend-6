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

  // Закрытие по клику вне модалки на десктопе
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const modalContainer = target.closest(".modal-dropdown-container");
      const createButton = target.closest('button[aria-label="Создать чат"]');

      if (!modalContainer && !createButton) {
        onClose();
      }
    };

    // Добавляем обработчик только на десктопе
    if (window.innerWidth >= 768) {
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      {/* Оверлей - видимый на мобильных, прозрачный на десктопе */}
      <div
        className="fixed inset-0 z-40 bg-(--color-overlay) md:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Выпадающее меню */}
      <div
        className={`absolute z-50 modal-dropdown-container ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
};

export default ModalDropdown;
