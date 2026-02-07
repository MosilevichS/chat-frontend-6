"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Button from "@/components/ui/Button";
import { avatarsFullSize } from "@/components/ui/user-profile/profile/photo-picker/assets/avatarsFullSize";
import {
  ModalPhotoPickerForSettings,
  type ModalPhotoPickerHandle,
} from "@/components/ui/modal/ModalPhotoPickerForSettings";
import {
  useUpdateAvatarMutation,
  createAvatarFormData,
} from "@/src/services/userApi";

export const SettingsProfilePhotoPicker = () => {
  const router = useRouter();
  const modalRef = useRef<ModalPhotoPickerHandle>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [uploadAvatar, { isLoading }] = useUpdateAvatarMutation();

  const handleAvatarClick = (url: string) => {
    setPhotoUrl(url);
    setModalOpen(true);
  };

  const handleConfirm = async () => {

    if (!modalRef.current) return;

    const file = await modalRef.current.getFile();
    console.log(file, file?.size);
    if (!file) return;

    const formData = createAvatarFormData(file);
    await uploadAvatar(formData).unwrap();

    setModalOpen(false);
    router.back();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid grid-cols-3 gap-3 p-4 mb-auto">
        {avatarsFullSize.map(avatar => (
          <button
            key={avatar.id}
            onClick={() => handleAvatarClick(avatar.url)}
            className="rounded-xl overflow-hidden active:scale-95"
          >
            <Image
              src={avatar.url}
              width={112}
              height={115}
              alt="avatar"
            />
          </button>
        ))}
      </div>

      <div className="sticky bottom-20 p-4 flex gap-3">
        <Button
          variant="secondary1"
          size="medium"
          onClick={() => router.back()}
          className="flex-1"
        >
          Отменить
        </Button>

        <Button
          variant="primary"
          size="medium"
          onClick={handleConfirm}
          disabled={!modalOpen || isLoading}
          className="flex-1"
        >
          {isLoading ? "Загрузка..." : "Выбрать фото"}
        </Button>
      </div>

      <ModalPhotoPickerForSettings
        ref={modalRef}
        isOpen={modalOpen}
        photoUrl={photoUrl}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
