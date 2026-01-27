"use client";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ModalPhotoPicker from "@/components/ui/modal/ModalPhotoPicker";

const SettingsProfilePhoto = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>("/avatar/avatar.png");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePhotoSelected = (
    photo: File | null,
    cropData?: { zoom: number; position: { x: number; y: number } },
  ) => {
    if (photo) {
      // Создаем временный URL для предпросмотра
      const imageUrl = URL.createObjectURL(photo);
      setCurrentPhoto(imageUrl);
      // Здесь можно отправить фото на сервер
      console.log("Photo selected:", photo, cropData);
    } else {
      // Если фото null, можно сбросить к дефолтному
      setCurrentPhoto("/avatar/avatar.png");
    }
    handleCloseModal();
  };

  return (
    <div className="items-center flex flex-col w-full justify-center p-4 gap-2">
      <Avatar picUrl={currentPhoto || "/avatar/avatar.png"} width={200} height={200} />
      <button
        onClick={handleOpenModal}
        className="text-[color:var(--color-violet)] text-[1.125rem] font-medium hover:opacity-60 transition-opacity"
      >
        Изменить фото
      </button>

      {/*<ModalPhotoPicker*/}
      {/*  isOpen={isModalOpen}*/}
      {/*  onClose={handleCloseModal}*/}
      {/*  onPhotoSelected={handlePhotoSelected}*/}
      {/*  currentPhoto={currentPhoto}*/}
      {/*/>*/}
    </div>
  );
};

export default SettingsProfilePhoto;
