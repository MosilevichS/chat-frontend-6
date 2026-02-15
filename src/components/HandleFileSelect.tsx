"use client";
import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  label?: string;
  className?: string;
}

export const ImageUpload = ({
  onImageSelect,
  currentImage,
  label = "Загрузить фото",
  className = "",
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите файл изображения");
      return;
    }

    // Проверка размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер: 5MB");
      return;
    }

    setIsLoading(true);

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

    // Передаем файл родителю
    onImageSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Скрытый input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Превью изображения */}
      <div
        onClick={handleClick}
        className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 hover:border-violet-500 cursor-pointer transition-colors overflow-hidden group"
      >
        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover" sizes="128px" />
            {/* Наложение при наведении */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Изменить</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Добавить фото</span>
          </div>
        )}

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition-colors text-sm"
        >
          {preview ? "Изменить" : label}
        </button>

        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Удалить
          </button>
        )}
      </div>

      {/* Подсказка */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Поддерживаются: JPG, PNG, GIF • Макс. 5MB
      </p>
    </div>
  );
};

