"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Button from "@/components/ui/Button";
import { avatarsFullSize } from "@/components/ui/user-profile/profile/photo-picker/assets/avatarsFullSize";
import ModalPhotoPicker from "@/components/ui/modal/ModalPhotoPicker";

interface AvatarType {
  id: number;
  url: string;
}
export const SettingsProfilePhotoPicker = () => {
  const router = useRouter();
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string>("");
  const initialPosition = useMemo(() => ({ x: 0, y: 0 }), []);

  const handleSelectAvatar = (id: number, url: string) => {
    setSelectedAvatar({ id, url });
  };

  const handleSelectPhoto = () => {
    if (!selectedAvatar) return;

    setModalImageUrl(selectedAvatar.url);
    setIsModalOpen(true);
  };
  const handlePhotoSelected = (file: File | null) => {
    if (!file) return;

    // 👉 тут у тебя ГОТОВЫЙ File
    console.log("FILE:", file);

    // пример:
    // uploadAvatar(file)
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
              className="
                relative flex items-center justify-center p-2 rounded-xl
                transition-all duration-200
                active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[var(--color-violet)]"
              onClick={() => handleSelectAvatar(avatar.id, avatar.url)}
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

      <div className="sticky bottom-20   py-4 px-2 ">
        <div className="flex flex-row gap-3 ">
          <Button variant="secondary1" size="medium" onClick={handleCancel} className="flex-1">
            Отменить
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSelectPhoto}
            disabled={!selectedAvatar}
            className="flex-1"
          >
            Выбрать фото
          </Button>
        </div>
      </div>
      <ModalPhotoPicker
        key={modalImageUrl}
        isOpen={isModalOpen}
        currentPhoto={modalImageUrl}
        onClose={() => setIsModalOpen(false)}
        onPhotoSelected={handlePhotoSelected}
      />
    </div>
  );
};
