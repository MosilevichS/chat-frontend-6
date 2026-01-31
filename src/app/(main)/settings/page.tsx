"use client";
import { UseProfileInfo, UserProfileActions } from "@/components/ui/user-profile";
import Image from "next/image";
import delete_outline from "../../../assets/icons/delete_outline.svg";
import { useDeleteProfileMutation, useGetProfileQuery } from "@/src/services/userApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/src/actions/auth";

import ModalConfirm from "@/components/ui/modal/ModalConfirm";

const Page = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteProfile, { isLoading }] = useDeleteProfileMutation();
  const { data } = useGetProfileQuery();

  const handleDelete = async () => {
    console.log("Начало удаления профиля");
    try {
      if (!data?.uid) {
        console.error("UID не найден");
        return;
      }
      console.log("Пытаемся удалить профиль с UID:", data.uid);
      await deleteProfile(data.uid).unwrap();
      console.log("Профиль успешно удален");
      await logoutAction();
      router.replace("/phone");
    } catch (error) {
      console.error("Ошибка при удалении профиля:", error);
      alert("Не удалось удалить профиль. Попробуйте позже.");
    }
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    await handleDelete();
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex gap-x-6 w-full justify-center">
      <div className="w-full flex flex-col md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto bg-(--color-gray-light) md:rounded-t-lg border border-(--color-gray-1) p-4">
        <div className="w-full">
          <p className="flex justify-center text-(--color-black) font-medium text-[1.125rem] ">
            Настройки
          </p>
          <div className="gap-y-4 flex flex-col p-4">
            <UseProfileInfo />
            <UserProfileActions />
          </div>
        </div>
        <button
          onClick={handleDeleteClick}
          disabled={isLoading}
          className="flex mb-5 md:mb-0 mt-auto items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Image src={delete_outline} width={16} height={16} alt="Удалить профиль" />
          <span className="text-base font-normal text-[color:var(--color-error)] hover:opacity-60 transition-opacity">
            Удалить профиль
          </span>
        </button>
        {showConfirm && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <ModalConfirm
              title="Удаление профиля"
              message="Это действие необратимо. Все данные будут удалены без возможности восстановления."
              confirmText="Удалить"
              cancelText="Отмена"
              onConfirm={confirmDelete}
              onClose={cancelDelete}
            />
          </div>
        )}
      </div>
      <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-(--color-gray-light) rounded-t-lg px-4"></div>
    </div>
  );
};

export default Page;
