"use client";
import { useState, useCallback, useRef } from "react";
import {
  createAvatarFormData,
  useGetProfileQuery,
  useUpdateAvatarMutation,
} from "@/src/services/userApi";
import { Avatar } from "@/components/ui/Avatar";
import ModalBase from "@/components/ui/modal/ModalBase";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/src/hooks/useClickOutside";

export const SettingsProfilePhoto = () => {
  const { data } = useGetProfileQuery();
  const [uploadAvatar] = useUpdateAvatarMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    setIsModalOpen(false);
  });
  const handleAvatarChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        alert("File size should be less than 5MB");
        return;
      }

      try {
        const formData = createAvatarFormData(file);
        const result = await uploadAvatar(formData).unwrap();
        console.log("Avatar uploaded successfully:", result);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to upload avatar:", error);
        alert("Failed to upload avatar. Please try again.");
      }
    },
    [uploadAvatar],
  );

  const handleButtonClick = () => {
    router.push("/settings/profile/photo-picker");
  };
  const handleButtonDeleteModalOpen = () => {
    setIsModalOpen(false);
    setIsModalDeleteOpen(true);
  };
  const handleButtonDeleteClick = async () => {
    try {
      const emptyPixel =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      const response = await fetch(emptyPixel);
      const blob = await response.blob();
      const file = new File([blob], "empty.png", { type: "image/png" });

      const formData = createAvatarFormData(file);
      const result = await uploadAvatar(formData).unwrap();

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      alert("Не удалось удалить фото. Пожалуйста, попробуйте снова.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Desktop */}
      <div className="hidden md:flex flex-col items-center px-4">
        {isModalDeleteOpen && (
          <ModalBase
            className="max-w-[329px] absolute top-1/4  mx-3 md:max-w-[400px] max-h-[172] justify-center rounded-md bg-[var(--color-white)]
           "
            onClose={() => setIsModalOpen(false)}
          >
            <div className="px-4 flex flex-col gap-4">
              <h3 className="font-medium text-lg mx-auto leading-5">Удалить фото профиля</h3>
              <p className="pl-5 text-(--color-gray) leading-5">
                Вы уверены, что хотите удалить текущее фото?
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  size="medium"
                  variant="secondary1"
                  className="max-h-[44px] min-w-[140px] mb-2"
                  onClick={() => setIsModalDeleteOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleButtonDeleteClick}
                  size="medium"
                  variant="primary"
                  className="max-h-[44px] min-w-[140px]  text-white"
                >
                  Удалить
                </Button>
              </div>
            </div>
          </ModalBase>
        )}
        <Avatar
          sizes="200px"
          className="w-[200px] h-[200px] rounded-full"
          picUrl={data?.avatar_url}
          firstName={data?.first_name}
          lastName={data?.last_name}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 text-[color:var(--color-violet)] text-[1.125rem] font-medium hover:opacity-60 transition-opacity"
        >
          Изменить фото
        </button>
      </div>

      {/* Mobile */}
      <div className="relative flex md:hidden justify-center px-4">
        {isModalDeleteOpen && (
          <ModalBase
            className="max-w-[329px] absolute top-1/3  mx-auto md:max-w-[400px] max-h-[172] justify-center rounded-md bg-[var(--color-gray-light)]
           "
            onClose={() => setIsModalOpen(false)}
          >
            <div className="px-4 flex flex-row gap-4">
              <Button
                size="medium"
                variant="secondary1"
                className="w-full min-w-[140px] mb-2"
                onClick={() => setIsModalDeleteOpen(false)}
              >
                Отмена
              </Button>

              <Button
                // onClick={}
                size="medium"
                variant="primary"
                className="w-full min-w-[140px]  text-white"
              >
                Удалить
              </Button>
            </div>
          </ModalBase>
        )}
        <Avatar
          className="w-[360px] h-[391px] rounded-lg"
          picUrl={data?.avatar_url}
          firstName={data?.first_name}
          lastName={data?.last_name}
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-3 left-7 bg-[var(--color-violet)] text-white text-[1rem] px-3 py-2 rounded-md hover:bg-[var(--color-violet-dark)] active:scale-95 transition-all"
        >
          Изменить фото
        </button>
      </div>
      {isModalOpen && (
        <ModalBase
          className="max-w-[393px] md:max-w-[400px] rounded-md justify-center mx-4 px-5 "
          onClose={() => setIsModalOpen(false)}
        >
          <div ref={modalRef} className="px-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />

            <Button
              size="medium"
              variant="secondary1"
              className="w-full justify-center mb-2"
              onClick={handleButtonClick}
            >
              Загрузить новое фото
            </Button>

            <Button
              onClick={handleButtonDeleteModalOpen}
              size="medium"
              variant="secondary1"
              className="w-full justify-center text-red-400 hover:text-red-500"
            >
              Удалить фото
            </Button>
          </div>
        </ModalBase>
      )}
    </div>
  );
};
