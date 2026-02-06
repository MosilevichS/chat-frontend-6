"use client";

import { useState, useEffect, useCallback, type ChangeEvent, useRef } from "react";
import ModalBase from "./ModalBase";

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

export const ModalPhotoPickerForSettings = ({
  isOpen,
  onClose,
  onPhotoSelected,
  currentPhoto = null,
  currentZoom = 1,
  currentPosition,
}: IModalPhotoPicker) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentPhoto ?? null);
  const [zoom, setZoom] = useState(currentZoom ?? 1);
  const DEFAULT_POSITION = { x: 0, y: 0 };
  const [position, setPosition] = useState<{ x: number; y: number }>(
    currentPosition ?? DEFAULT_POSITION,
  );

  useEffect(() => {
    if (isOpen && currentPhoto) {
      setSelectedImage(currentPhoto);
      setZoom(currentZoom);
      setPosition(currentPosition ?? DEFAULT_POSITION);
    }
  }, [isOpen, currentPhoto, currentZoom, currentPosition]);

  // Отправляем файл только при закрытии модалки или значительных изменениях
  const sendFileToParent = useCallback(() => {
    if (!selectedImage) return null;

    const arr = selectedImage.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);

    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    return new File([u8arr], "avatar.jpg", { type: mime });
  }, [selectedImage, zoom, position]);

  // Отправляем файл при закрытии модалки
  const handleClose = () => {
    const file = sendFileToParent();
    if (file) {
      onPhotoSelected(file, { zoom, position });
    }
    onClose();
  };

  const handleSliderChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  }, []);

  if (!isOpen || !selectedImage) return null;

  return (
    <ModalBase onClose={handleClose}>
      <div className="w-[432px] h-[453px] bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-10 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Настроить отображение фото</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 pb-6 flex flex-col items-center">
          <div className="relative w-[320px] h-[320px] overflow-hidden rounded-lg mb-4">
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
          </div>

          <div className="w-[320px] flex items-center justify-center">
            <div className="w-full">
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
              <div className="flex justify-between text-sm text-gray-500 mt-1">
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
