"use client";
import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
// import ModalPhotoPicker from "@/components/ui/modal/ModalPhotoPicker";
import { ImageUpload } from "@/components/HandleFileSelect";
import { useGetProfileQuery } from "@/src/services/userApi";
import ModalBase from "@/components/ui/modal/ModalBase";

const SettingsProfilePhoto = () => {
  const { data } = useGetProfileQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [currentPhoto, setCurrentPhoto] = useState<string>("/avatar/avatar.png");
  // const [isUploadOpen, setIsUploadOpen] = useState(false);

  // const handleOpenModal = () => setIsModalOpen(true);
  // const handleCloseModal = () => setIsModalOpen(false);

  // useEffect(() => {
  //   return () => {
  //     if (currentPhoto.startsWith("blob:")) {
  //       URL.revokeObjectURL(currentPhoto);
  //     }
  //   };
  // }, [currentPhoto]);

  // const handlePhotoSelected = (
  //   photo: File | null,
  //   cropData?: { zoom: number; position: { x: number; y: number } },
  // ) => {
  //   if (photo) {
  //     const imageUrl = URL.createObjectURL(photo);
  //
  //     setCurrentPhoto(prev => {
  //       if (prev && prev.startsWith("blob:")) {
  //         URL.revokeObjectURL(prev);
  //       }
  //       return imageUrl;
  //     });
  //
  //     console.log("Photo selected:", photo, cropData);
  //   } else {
  //     setCurrentPhoto("/avatar/avatar.png");
  //   }
  //
  //   handleCloseModal();
  // };

  return (
    <div className="relative items-center flex flex-col w-full justify-center p-4 gap-2">
      <Avatar
        picUrl={data?.avatar_url}
        width={200}
        height={200}
        lastName={data?.last_name}
        firstName={data?.first_name}
      />
      <button
        onClick={() => setIsModalOpen(true)}
        className="text-[color:var(--color-violet)] text-[1.125rem] font-medium hover:opacity-60 transition-opacity"
      >
        Изменить фото
      </button>
      {isModalOpen && (
        <ModalBase
          className="w-max-[329px] md:w-max-[400px] w-full"
          onClose={() => setIsModalOpen(false)}
        >
          Mad
        </ModalBase>
      )}

    </div>
  );
};

export default SettingsProfilePhoto;
