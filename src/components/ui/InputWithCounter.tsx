"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface InputWithCounterProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  maxLength: number;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
}

const InputWithCounter = ({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  maxLength,
  placeholder = "",
  className = "",
  showClearButton = true,
}: InputWithCounterProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const charCount = value.length;
  const isError = charCount > maxLength;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleVisualClick = () => {
    inputRef.current?.focus();
  };

  const hasContent = value.length > 0 || isFocused;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full border-0 rounded-none px-4 absolute inset-0 opacity-0 z-10 cursor-text"
        maxLength={maxLength * 2}
      />

      <div
        onClick={handleVisualClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex px-4 ${hasContent ? "pt-6 pb-2 items-start" : "h-[56px] items-center"} cursor-text transition-all duration-200`}
      >
        <div className="flex-1 min-w-0" style={{ maxWidth: "280px" }}>
          <div
            className={`${hasContent ? "text-xs text-(--color-gray)" : "text-base text-(--color-gray)"}`}
          >
            {label}
          </div>
          
          {hasContent && (
            <div className="text-base text-gray-900 mt-2 break-words relative min-h-[20px]">
              {value.length > 0 ? (
                <>
                  {value}
                  {isFocused && (
                    <span className="inline-block w-[2px] h-5 bg-(--color-violet) ml-[1px] animate-pulse align-middle"></span>
                  )}
                </>
              ) : (
                isFocused && (
                  <span className="inline-block w-[2px] h-5 bg-(--color-violet) animate-pulse"></span>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-start shrink-0 ml-2">
          <div
            className={`${hasContent ? "text-xs" : "opacity-0"} ${isError ? "text-(--color-error)" : "text-(--color-gray)"}`}
          >
            {charCount}/{maxLength}
          </div>
          
          {value.length > 0 && showClearButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={`mt-2 flex items-center justify-center w-4 h-4 transition-opacity ${isHovered ? "opacity-100" : "opacity-70"}`}
              aria-label="Очистить"
              type="button"
            >
              {/* Временно убираем иконку или используем текст */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputWithCounter;