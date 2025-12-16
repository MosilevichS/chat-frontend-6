"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Компонент надо еще дорабатывать, сделать адпативным, поменять стили
interface INavigation {
  icon: ReactNode;
}

const Navigation = ({ icon }: INavigation) => {
  const pathname = usePathname();

  const navLinks = [
    { path: "/chats", label: "Чаты" },
    { path: "/groups", label: "Группы" },
    { path: "/contacts", label: "Контакты" },
    { path: "/settings", label: "Настройки" },
  ];

  const navBaseStyle =
    "flex items-center justify-center w-12 h-12 p-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-[var(--color-gray-light)]";
  const navActive =
    "bg-[var(--color-gray-light)] border border-[var(--color-border-light)] shadow-sm";
  const navInactive = "hover:border-[var(--color-border-light)] hover:shadow-sm";

  return (
    <nav>
      <ul>
        {navLinks.map(link => (
          <li key={link.path}>
            <Link
              href={link.path}
              className={`${navBaseStyle} ${pathname === link.path ? navActive : navInactive}`}
              aria-label={link.label}
            >
              <span className="w-8 h-8">{icon}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
