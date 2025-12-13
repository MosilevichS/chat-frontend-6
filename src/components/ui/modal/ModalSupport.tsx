"use client";

import Button from "../Button";

interface IModalSupport {
  onSupport: () => void;
  onClose: () => void;
  title: string;
  message?: string;
}

const ModalSupport = ({ title, message, onSupport, onClose }: IModalSupport) => {
  return (
    <div className="w-100 bg-white py-8 px-5 rounded-xl text-center">
      <h3 className={`font-medium text-2xl ${message ? "mb-4" : "mb-5"} leading-7`}>{title}</h3>
      {message && <p className="text-lg mb-7 leading-6">{message}</p>}

      <Button onClick={onSupport} variant={"primary"} size={"medium"} className="mb-4">
        Обратиться в поддержку
      </Button>
      <Button onClick={onClose} variant={"secondary1"} size={"medium"}>
        Назад
      </Button>
    </div>
  );
};

export default ModalSupport;
