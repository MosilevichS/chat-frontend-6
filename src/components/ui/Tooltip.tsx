"use client";

import { useState, useEffect, useRef } from "react";
import tooltip from "@/src/assets/icons/tooltip.svg";

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={tooltipRef} className="relative inline-block group">
      <span
        className="cursor-pointer text-(--color-gray) hover:text-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src={tooltip.src} alt="Tooltip Icon" className="w-6 h-6" />
      </span>

      <div
        className={`
          absolute left-1/2 bottom-full transform -translate-x-[65%] mb-5 p-4 md:p-5 w-[329px] bg-(--color-violet-dark) text-white text-sm rounded-2xl z-50 pointer-events-none transition-opacity duration-300 overflow-visible
          ${isOpen ? "opacity-100" : "opacity-0"} group-hover:opacity-100`}
      >
        {children}
        <div className="absolute -bottom-[18px] left-[60%] w-0 h-0 border-solid border-l-[17.5px] border-r-[17.5px] border-b-31 border-l-transparent border-r-transparent border-t-transparent border-b-[#615AA3] rotate-180"></div>
      </div>
    </div>
  );
};

export default Tooltip;
