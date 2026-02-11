"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, type ChangeEvent } from "react";
import ModalBase from "./ModalBase";

export interface ModalPhotoPickerHandle {
  getFile: () => Promise<File | null>;
}

interface Props {
  isOpen: boolean;
  photoUrl: string | null;
  onClose: () => void;
}

export const ModalPhotoPickerForSettings = forwardRef<ModalPhotoPickerHandle, Props>(
  ({ isOpen, photoUrl, onClose }, ref) => {
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
      if (isOpen) setZoom(1);
    }, [isOpen]);

    useImperativeHandle(ref, () => ({
      async getFile() {
        if (!photoUrl) return null;

        // 1. Загружаем файл напрямую
        const res = await fetch(photoUrl);
        const blob = await res.blob();

        // 2. Создаём ImageBitmap (НЕ ломает canvas)
        const bitmap = await createImageBitmap(blob);

        const SIZE = 400;
        const canvas = document.createElement("canvas");
        canvas.width = 361;
        canvas.height = 390;

        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.scale(zoom, zoom);

        ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2, bitmap.width, bitmap.height);

        return new Promise<File | null>(resolve => {
          canvas.toBlob(blob => {
            if (!blob) return resolve(null);
            resolve(new File([blob], "avatar.png", { type: "image/png" }));
          });
        });
      },
    }));

    if (!isOpen || !photoUrl) return null;

    return (
      <ModalBase onClose={onClose}>
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
                <img
                  src={photoUrl}
                  alt="avatar"
                  style={{ transform: `scale(${zoom})` }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-white rounded-full" />
              </div>
            </div>

            <div className="w-[320px]">
              <input
                type="range"
                min="1"
                max="2"
                step="0.01"
                value={zoom}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setZoom(+e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </ModalBase>
    );
  },
);

ModalPhotoPickerForSettings.displayName = "ModalPhotoPickerForSettings";
