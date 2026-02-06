"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Button from "@/components/ui/Button";
import { avatarsFullSize } from "@/components/ui/user-profile/profile/photo-picker/assets/avatarsFullSize";
import { ModalPhotoPickerForSettings } from "@/components/ui/modal/ModalPhotoPickerForSettings";
import { useUpdateAvatarMutation, createAvatarFormData } from "@/src/services/userApi";

interface AvatarType {
  id: number;
  url: string;
}

export const SettingsProfilePhotoPicker = () => {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const [editedFile, setEditedFile] = useState<File | null>(null);
  const [uploadAvatar, { isLoading }] = useUpdateAvatarMutation();

  const handleAvatarClick = (id: number, url: string) => {
    setSelectedAvatar({ id, url });
    setModalImageUrl(url);
    setIsModalOpen(true);
    setEditedFile(null); // Сбрасываем предыдущий файл
  };

  const handlePhotoSelected = (file: File | null) => {
    if (file) {
      setEditedFile(file);
      console.log("✅ Файл получен от ModalPhotoPicker:", file);
    }
  };

  const handleSelectPhoto = async () => {
    if (!editedFile) return;

    try {
      // Отправляем файл на сервер
      const formData = createAvatarFormData(editedFile);
      const result = await uploadAvatar(formData).unwrap();
      console.log("✅ Аватар успешно загружен:", result);

      // Возвращаемся на предыдущую страницу
      router.back();
    } catch (error) {
      console.error("❌ Ошибка загрузки аватара:", error);
      alert("Не удалось загрузить фото. Попробуйте еще раз.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Аватары с выбором */}
      <div className="flex-1">
        <div className="grid grid-cols-3 gap-3 p-4">
          {avatarsFullSize.map(avatar => (
            <button
              key={avatar.id}
              className={`
                relative flex items-center justify-center p-2 rounded-xl
                transition-all duration-200
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[var(--color-violet)]
                ${selectedAvatar?.id === avatar.id ? 'ring-2 ring-[var(--color-violet)]' : ''}
              `}
              onClick={() => handleAvatarClick(avatar.id, avatar.url)}
            >
              <Image
                src={avatar.url}
                width={112}
                height={115}
                alt={`Аватар ${avatar.id}`}
                className="rounded-lg"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-20 z-100 py-4 px-2 ">
        <div className="flex flex-row gap-3 ">
          <Button variant="secondary1" size="medium" onClick={handleCancel} className="flex-1">
            Отменить
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={() => {
              setIsModalOpen(false); // Закрываем модалку
              handleSelectPhoto(); // Отправляем файл
            }}
            disabled={!isModalOpen || isLoading} // Активна когда модалка открыта
            className="flex-1"
          >
            {isLoading ? "Загрузка..." : "Выбрать фото"}
          </Button>
        </div>
      </div>

      <ModalPhotoPickerForSettings
        isOpen={isModalOpen}
        currentPhoto={modalImageUrl}
        onClose={() => {
          setIsModalOpen(false);
          // Файл уже был отправлен через handlePhotoSelected
        }}
        onPhotoSelected={handlePhotoSelected}
      />
    </div>
  );
};