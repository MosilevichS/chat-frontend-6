/**
 * Кнопка переключения меню с иконкой
 *
 * @example
 * <DesktopMenuButton
 *   icon={<MenuIcon />}
 *   state="active"
 *   aria-label="Открыть меню"
 *   onClick={() => console.log('Clicked!')}
 * />
 *
 * @param icon - Иконка кнопки (ReactNode)
 * @param state - Состояние: "default" | "active" (по умолчанию "default")
 * @param aria-label - Обязательное описание для доступности
 * @prop onClick - Обработчик клика (передаётся в кнопку через {...props})
 * @prop disabled - Блокировка кнопки (наследуется от HTMLButtonElement)
 */

import type { ButtonHTMLAttributes } from "react";
import type { ReactNode } from "react";

type ButtonState = "default" | "active";

interface DesktopMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  state?: ButtonState;
}

const baseButton =
  "flex items-center justify-center w-12 h-12 p-2 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const hoverStyle = "hover:bg-[var(--color-gray-light)]";
const activeStyle =
  "bg-[var(--color-gray-light)] border border-[var(--color-border-light)] shadow-sm";

const DesktopMenuButton = ({
  icon,
  state = "default",
  className = "",
  ...props
}: DesktopMenuButtonProps) => {
  const isActive = state === "active";

  return (
    <button
      className={`${baseButton} ${hoverStyle} ${isActive ? activeStyle : ""} ${className}`}
      {...props}
    >
      <span className="w-8 h-8">{icon}</span>
    </button>
  );
};

export default DesktopMenuButton;
