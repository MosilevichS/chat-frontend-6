"use client";

import Button from "../Button";

interface IModalConfirm {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

const ModalConfirm = ({
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  className,
}: IModalConfirm) => {
  return (
    <div className="w-[329px] md:w-[400px] bg-white p-6 rounded-lg text-center md:text-left">
      <h3 className="font-medium text-lg mb-2 leading-5">{title}</h3>
      <p className="mb-5 text-(--color-gray) leading-5">{message}</p>

      <div className="flex justify-center md:justify-end gap-2">
        <Button onClick={onClose} variant={"adaptive"} size={"small"} className={className}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} variant={"primary"} size={"small"}>
          {confirmText}
        </Button>
      </div>
    </div>
  );
};

export default ModalConfirm;
