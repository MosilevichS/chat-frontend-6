"use client";

import Button from "../Button";

interface IModalConfirm {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ModalConfirm = ({
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
}: IModalConfirm) => {
  return (
    <div className="w-100 bg-white p-6 rounded-lg">
      <h3 className="font-medium text-lg mb-2 leading-6">{title}</h3>
      <p className="mb-5 text-(--color-gray) leading-5">{message}</p>

      <div className="flex justify-end gap-2">
        <Button onClick={onConfirm} variant={"secondary2"} size={"small"}>
          {confirmText}
        </Button>
        <Button onClick={onClose} variant={"secondary1"} size={"small"}>
          {cancelText}
        </Button>
      </div>
    </div>
  );
};

export default ModalConfirm;
