"use client";

import { useState, useRef, useEffect } from "react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialized = useRef(false);

  // Инициализация только при первом открытии
  useEffect(() => {
    if (isOpen && !isInitialized.current) {
      setSelectedImage(currentPhoto);
      setZoom(currentZoom);
      setPosition(currentPosition);
      isInitialized.current = true;
    }

    if (!isOpen) {
      isInitialized.current = false;
    }
  }, [isOpen]); // Убрала зависимости, которые вызывали бесконечный цикл

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result as string;
        setSelectedImage(newImage);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedImage) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedImage) return;

    const newZoom = zoom;
    const estimatedWidth = 800;
    const estimatedHeight = 600;
    const imageWidth = estimatedWidth * newZoom;
    const imageHeight = estimatedHeight * newZoom;

    const maxX = Math.max(0, (imageWidth - 320) / 2);
    const maxY = Math.max(0, (imageHeight - 320) / 2);

    const x = Math.max(-maxX, Math.min(maxX, position.x + e.movementX));
    const y = Math.max(-maxY, Math.min(maxY, position.y + e.movementY));

    setPosition({ x, y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSliderDragging(true);
    updateSliderValue(e);
  };

  const handleSliderMouseMove = (e: React.MouseEvent) => {
    if (!isSliderDragging) return;
    updateSliderValue(e);
  };

  const handleSliderMouseUp = () => setIsSliderDragging(false);

  const updateSliderValue = (e: React.MouseEvent) => {
    const sliderWidth = 256;
    const x = e.nativeEvent.offsetX;
    const percentage = Math.max(0, Math.min(1, x / sliderWidth));
    const newZoom = 1 + percentage;

    setZoom(newZoom);
  };

  const handleSuccessClick = () => {
    if (selectedImage && selectedImage !== currentPhoto) {
      fetch(selectedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          onPhotoSelected(file, { zoom, position });
        })
        .catch(() => onPhotoSelected(null, { zoom, position }));
    } else if (selectedImage) {
      onPhotoSelected(null, { zoom, position });
    } else {
      onPhotoSelected(null);
    }
    onClose();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSliderDragging(false);
      setIsDragging(false);
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <ModalBase onClose={onClose}>
      <div className="w-[432px] h-[453px] bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Настроить отображение фото</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 px-6 pb-6 flex flex-col items-center">
          <div
            className="relative w-[320px] h-[320px] overflow-hidden rounded-lg mb-4"
            onClick={handlePhotoClick}
          >
            {selectedImage ? (
              <>
                <div className="absolute inset-0 bg-(--color-black-light) opacity-20 rounded-lg" />
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div
                    className="absolute w-full h-full"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Выбранное фото"
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full"
                    />
                  </div>
                </div>
                <div
                  className="absolute inset-0 border-2 border-white rounded-full pointer-events-none cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-(--color-gray-1) rounded-lg cursor-pointer">
                <div className="text-center">
                  <Image
                    src={fotoNewGroup}
                    alt="Добавить фото"
                    width={120}
                    height={120}
                    className="mx-auto mb-4"
                    style={{ width: "auto", height: "auto" }}
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
              <div className="w-[256px] relative h-4 cursor-pointer">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-(--color-gray-1) -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 w-4 h-4 bg-(--color-violet) rounded-full -translate-y-1/2 -translate-x-1/2 shadow-sm cursor-pointer"
                  style={{ left: `${(zoom - 1) * 100}%` }}
                  onMouseDown={handleSliderMouseDown}
                  onMouseMove={handleSliderMouseMove}
                  onMouseUp={handleSliderMouseUp}
                />
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="absolute top-1/2 left-0 right-0 h-4 opacity-0 -translate-y-1/2 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSuccessClick}
                className="flex items-center justify-center cursor-pointer"
              >
                <Image
                  src={successIcon}
                  alt="Сохранить"
                  width={36}
                  height={36}
                  className="text-(--color-violet) hover:opacity-80 transition-opacity"
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalBase>
  );
};

export default ModalPhotoPicker;
