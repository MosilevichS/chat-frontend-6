"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import InputWithCounter from "@/src/components/ui/InputWithCounter";
import Button from "@/src/components/ui/Button";
import ModalPhotoPicker from "@/src/components/ui/modal/ModalPhotoPicker";
import Image from "next/image";
import backDesktop from "../../../assets/icons/back-desktop.svg";
import backMobile from "../../../assets/icons/back-icon.svg";
import fotoNewGroup from "../../../assets/icons/foto-new-group.svg";

interface IBaseCreationPage {
  title: string;
  typeSelector: ReactNode;
  placeholderText: string;
  nextPagePath: string;
  groupType?: "closed" | "open";
  channelType?: "public" | "private";
}

const BaseCreationPage = ({
  title,
  typeSelector,
  placeholderText,
  nextPagePath,
  groupType = "closed",
  channelType = "public",
}: IBaseCreationPage) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleBack = () => router.back();

  const handleNext = () => {
    const type = title.includes("канал") ? "channel" : "group";

    let chatType: string;
    if (type === "channel") {
      chatType = channelType === "public" ? "public-channel" : "private-channel";
    } else {
      chatType = groupType === "open" ? "public-group" : "private-group";
    }

    let photoBase64 = "";
    if (selectedPhoto) {
      const base64Match = selectedPhoto.match(/^data:image\/\w+;base64,(.+)$/);
      if (base64Match && base64Match[1]) {
        photoBase64 = base64Match[1];
      }
    }

    // Создаем объект с параметрами
    const params = {
      type,
      name: name,
      description: description,
      chatType,
      ...(type === "group" && { groupType }),
      ...(type === "channel" && { channelType }),
    };

    // Используем URLSearchParams для правильного кодирования
    const searchParams = new URLSearchParams();

    // Добавляем каждый параметр отдельно
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });

    if (photoBase64) {
      searchParams.append("photo", photoBase64);
    }

    router.push(`/chats/add-subscribers?${searchParams.toString()}`);
  };

  const handlePhotoSelected = (
    file: File | null,
    cropData?: { zoom: number; position: { x: number; y: number } },
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setSelectedPhoto(imageUrl);
        if (cropData) {
          setPhotoZoom(cropData.zoom);
          setPhotoPosition(cropData.position);
        }
      };
      reader.readAsDataURL(file);
    } else if (cropData) {
      setPhotoZoom(cropData.zoom);
      setPhotoPosition(cropData.position);
    }
  };

  const isFormValid = name.trim().length > 0 && name.length >= 1 && name.length <= 100;

  return (
    <>
      <div className="flex flex-row gap-x-6 w-full justify-center md:mb-1">
        <div className="w-full md:max-w-[360px] md:min-w-[360px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) md:rounded-lg border border-(--color-gray-1)">
          <div className="flex items-center w-full p-4 relative">
            <button
              onClick={handleBack}
              className="flex-shrink-0 w-10 h-10 bg-transparent rounded-lg flex items-center justify-center transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
              aria-label="Назад"
            >
              <div className="md:hidden flex items-center justify-center">
                <Image src={backMobile} alt="Назад" width={24} height={24} />
              </div>
              <div className="hidden md:flex items-center justify-center">
                <Image src={backDesktop} alt="Назад" width={24} height={24} />
              </div>
            </button>

            <h1 className="text-lg font-semibold text-gray-900 md:ml-3 ml-auto mr-auto md:mr-0">
              {title}
            </h1>
          </div>

          <div className="w-full px-4 flex flex-col">
            <div className="flex flex-col items-center w-full">
              <div className="relative mb-2 md:mb-4">
                <div
                  className="relative w-[88px] h-[88px] md:w-[200px] md:h-[200px] cursor-pointer rounded-full overflow-hidden border border-(--color-gray-1)"
                  onClick={() => setIsPhotoModalOpen(true)}
                >
                  {selectedPhoto ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <div className="absolute inset-0 rounded-full overflow-hidden">
                        <div
                          className="absolute w-full h-full"
                          style={{
                            transform: `translate(${photoPosition.x * (isMobile ? 0.44 : 1)}px, ${photoPosition.y * (isMobile ? 0.44 : 1)}px) scale(${photoZoom})`,
                            transformOrigin: "center center",
                          }}
                        >
                          <img
                            src={selectedPhoto}
                            alt="Выбранное фото"
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <Image
                        src={fotoNewGroup}
                        alt="Фото"
                        width={isMobile ? 88 : 200}
                        height={isMobile ? 88 : 200}
                        loading="eager"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                className="text-sm font-medium text-(--color-violet) mb-6 md:mb-8 hover:text-violet-700 transition-colors"
                onClick={() => setIsPhotoModalOpen(true)}
              >
                {selectedPhoto ? "Изменить фото" : "Выбрать фото"}
              </button>

              <div className="w-full border border-(--color-gray-1) rounded-lg overflow-hidden bg-white mb-6">
                <div className="relative border-b border-(--color-gray-1)">
                  <InputWithCounter
                    id="name-input"
                    label="Название"
                    value={name}
                    onChange={setName}
                    maxLength={100}
                  />
                </div>

                <div className="relative">
                  <InputWithCounter
                    id="description-input"
                    label="Описание"
                    value={description}
                    onChange={setDescription}
                    maxLength={250}
                  />
                </div>
              </div>

              {typeSelector}
            </div>

            <div className="mt-auto pt-6 pb-4">
              <Button
                variant="primary"
                size="medium"
                onClick={handleNext}
                disabled={!isFormValid}
                className="w-full"
              >
                Далее
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-center items-center w-full max-w-[744px] min-h-[calc(100vh-88px)] bg-(--color-gray-light) rounded-lg border border-(--color-gray-1) px-4">
          <p className="text-(--color-gray) text-lg font-normal">{placeholderText}</p>
        </div>
      </div>

      <ModalPhotoPicker
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoSelected={handlePhotoSelected}
        currentPhoto={selectedPhoto}
        currentZoom={photoZoom}
        currentPosition={photoPosition}
      />
    </>
  );
};

export default BaseCreationPage;
