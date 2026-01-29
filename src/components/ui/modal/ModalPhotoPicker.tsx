"use client";

import { useState, useRef, useEffect, useCallback, type ChangeEvent } from "react";
import ModalBase from "./ModalBase";
import Image from "next/image";
import fotoNewGroup from "../../../assets/icons/foto-new-group.svg";
import successIcon from "../../../assets/icons/success.svg";

export interface IModalPhotoPicker {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSelected: (
    photo: File | null,
    cropData?: { zoom: number; position: { x: number; y: number } },
  ) => void;
  currentPhoto?: string | null;
  currentZoom?: number;
  currentPosition?: { x: number; y: number };
}

const ModalPhotoPicker = ({
  isOpen,
  onClose,
  onPhotoSelected,
  currentPhoto = null,
  currentZoom = 1,
  currentPosition = { x: 0, y: 0 },
}: IModalPhotoPicker) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentPhoto);
  const [zoom, setZoom] = useState(currentZoom);
  const [position, setPosition] = useState(currentPosition);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedImage(currentPhoto);
      setZoom(currentZoom);
      setPosition(currentPosition);
    }
  }, [isOpen, currentPhoto, currentZoom, currentPosition]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  }, []);

  const handleSuccessClick = useCallback(() => {
    if (selectedImage) {
      // Создаем файл из DataURL
      const arr = selectedImage.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);

      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      const file = new File([u8arr], "photo.jpg", { type: mime });
      onPhotoSelected(file, { zoom, position });
    } else {
      onPhotoSelected(null, { zoom, position });
    }
    onClose();
  }, [selectedImage, zoom, position, onPhotoSelected, onClose]);

  const handleSliderChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  }, []);

  if (!isOpen) return null;

  return (
    <ModalBase onClose={onClose}>
      <div className="w-[432px] h-[453px] bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Настроить отображение фото</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 pb-6 flex flex-col items-center">
          <div
            className="relative w-[320px] h-[320px] overflow-hidden rounded-lg mb-4 cursor-pointer"
            onClick={() => !selectedImage && fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <div className="w-full h-full relative rounded-full overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={selectedImage}
                    alt="Выбранное фото"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 border-2 border-white rounded-full" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-(--color-gray-1) rounded-lg">
                <div className="text-center">
                  <Image
                    src={fotoNewGroup}
                    alt="Добавить фото"
                    width={120}
                    height={120}
                    className="mx-auto mb-4"
                  />
                  <p className="text-(--color-gray)">Нажмите для выбора фото</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {selectedImage && (
            <div className="w-[320px] flex items-center justify-between">
              <div className="w-[256px]">
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={zoom}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-(--color-gray-1) rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:w-4 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-(--color-violet)"
                />
              </div>

              <button
                onClick={handleSuccessClick}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Image src={successIcon} alt="Сохранить" width={24} height={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default ModalPhotoPicker;
