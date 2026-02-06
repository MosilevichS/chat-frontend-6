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

const SettingsProfilePhoto = () => {
  const { data } = useGetProfileQuery();
  const [uploadAvatar] = useUpdateAvatarMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    // fileInputRef.current?.click();
    router.push("/settings/profile/photo-picker");
  };

  return (
    <div className=" relative items-center flex flex-col w-full justify-center ">
      <div className="hidden md:flex px-4  flex-col">
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
      </div>
      <div className="flex md:hidden px-4 ">
        <Avatar
          picUrl={data?.avatar_url}
          width={361}
          height={390}
          lastName={data?.last_name}
          firstName={data?.first_name}
          shape="square"
        />
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-3 left-7 bg-[var(--color-violet)] text-white text-[1rem] px-3 py-2 rounded-md hover:bg-[var(--color-violet-dark)] active:scale-95 transition-all"
        >
          + Изменить фото
        </button>
      </div>
      <div>

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

export default SettingsProfilePhoto;
