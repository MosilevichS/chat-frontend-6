"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import ModalPhotoPicker from "@/src/components/ui/modal/ModalPhotoPicker";
import Image from "next/image";
import backDesktop from "../../../../assets/icons/back-desktop.svg";
import backMobile from "../../../../assets/icons/back-icon.svg";
import fotoNewGroup from "../../../../assets/icons/foto-new-group.svg";
import closeInputIcon from "../../../../assets/icons/close-input.svg";

interface BaseCreationPageProps {
  title: string;
  typeSelector: ReactNode;
  placeholderText: string;
  nextPagePath: string;
}

const BaseCreationPage = ({
  title,
  typeSelector,
  placeholderText,
  nextPagePath,
}: BaseCreationPageProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  const [nameCharCount, setNameCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setNameCharCount(name.length);
  }, [name]);

  useEffect(() => {
    setDescCharCount(description.length);
  }, [description]);

  const handleBack = () => router.back();
  const handleNext = () => router.push(nextPagePath);

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 100) setName(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 250) setDescription(e.target.value);
  };

  const handleNameFocus = () => {
    setIsNameFocused(true);
    setIsDescFocused(false);
  };

  const handleDescriptionFocus = () => {
    setIsDescFocused(true);
    setIsNameFocused(false);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    if (target.closest("#name-visual")) {
      document.getElementById("name-input")?.focus();
    } else if (target.closest("#desc-visual")) {
      document.getElementById("description-input")?.focus();
    }
  };

  const clearName = () => {
    setName("");
    document.getElementById("name-input")?.focus();
  };

  const clearDescription = () => {
    setDescription("");
    document.getElementById("description-input")?.focus();
  };

  const isFormValid = name.trim().length > 0 && nameCharCount >= 1 && nameCharCount <= 100;

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
                <div
                  className={`relative border-b border-(--color-gray-1) ${name.length > 0 || isNameFocused ? "min-h-[72px]" : "h-[56px]"}`}
                >
                  <Input
                    id="name-input"
                    value={name}
                    onChange={handleNameChange}
                    onFocus={handleNameFocus}
                    onBlur={() => setIsNameFocused(false)}
                    placeholder=""
                    className="w-full border-0 rounded-none px-4 absolute inset-0 opacity-0 z-10"
                  />

                  <div
                    id="name-visual"
                    onClick={handleInputClick}
                    className={`flex px-4 ${name.length > 0 || isNameFocused ? "pt-6 pb-2 items-start" : "h-[56px] items-center"} cursor-text`}
                  >
                    <div className="flex-1 min-w-0" style={{ maxWidth: "280px" }}>
                      <div
                        className={`${isNameFocused || name.length > 0 ? "text-xs text-(--color-gray)" : "text-base text-(--color-gray)"}`}
                      >
                        Название
                      </div>
                      {(name.length > 0 || isNameFocused) && (
                        <div className="text-base text-gray-900 mt-2 break-words relative min-h-[20px]">
                          {name.length > 0 ? (
                            <>
                              {name}
                              {isNameFocused && (
                                <span className="inline-block w-[2px] h-5 bg-(--color-violet) ml-[1px] animate-pulse align-middle"></span>
                              )}
                            </>
                          ) : (
                            isNameFocused && (
                              <span className="inline-block w-[2px] h-5 bg-(--color-violet) animate-pulse"></span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-start shrink-0 ml-2">
                      <div
                        className={`${isNameFocused || name.length > 0 ? "text-xs" : "opacity-0"} text-(--color-gray)`}
                      >
                        {nameCharCount}/100
                      </div>
                      {name.length > 0 && (
                        <button
                          onClick={clearName}
                          className="mt-2 flex items-center justify-center w-4 h-4"
                          aria-label="Очистить"
                          type="button"
                        >
                          <Image src={closeInputIcon} alt="Очистить" width={16} height={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`relative ${description.length > 0 || isDescFocused ? "min-h-[72px]" : "h-[56px]"}`}
                >
                  <Input
                    id="description-input"
                    value={description}
                    onChange={handleDescriptionChange}
                    onFocus={handleDescriptionFocus}
                    onBlur={() => setIsDescFocused(false)}
                    placeholder=""
                    className="w-full border-0 rounded-none px-4 absolute inset-0 opacity-0 z-10"
                  />

                  <div
                    id="desc-visual"
                    onClick={handleInputClick}
                    className={`flex px-4 ${description.length > 0 || isDescFocused ? "pt-6 pb-2 items-start" : "h-[56px] items-center"} cursor-text`}
                  >
                    <div className="flex-1 min-w-0" style={{ maxWidth: "280px" }}>
                      <div
                        className={`${isDescFocused || description.length > 0 ? "text-xs text-(--color-gray)" : "text-base text-(--color-gray)"}`}
                      >
                        Описание
                      </div>
                      {(description.length > 0 || isDescFocused) && (
                        <div className="text-base text-gray-900 mt-2 break-words relative min-h-[20px]">
                          {description.length > 0 ? (
                            <>
                              {description}
                              {isDescFocused && (
                                <span className="inline-block w-[2px] h-5 bg-(--color-violet) ml-[1px] animate-pulse align-middle"></span>
                              )}
                            </>
                          ) : (
                            isDescFocused && (
                              <span className="inline-block w-[2px] h-5 bg-(--color-violet) animate-pulse"></span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-start shrink-0 ml-2">
                      <div
                        className={`${isDescFocused || description.length > 0 ? "text-xs" : "opacity-0"} text-(--color-gray)`}
                      >
                        {descCharCount}/250
                      </div>
                      {description.length > 0 && (
                        <button
                          onClick={clearDescription}
                          className={`flex items-center justify-center w-4 h-4 ${isDescFocused || description.length > 0 ? "mt-2" : ""}`}
                          aria-label="Очистить"
                          type="button"
                        >
                          <Image src={closeInputIcon} alt="Очистить" width={16} height={16} />
                        </button>
                      )}
                    </div>
                  </div>
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
