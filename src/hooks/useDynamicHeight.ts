import { useEffect, type RefObject } from "react";

interface UseDynamicHeightOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  hasActionButton?: boolean; // Есть ли кнопка действий внизу (удалить/создать и т.д.)
  hasHeader?: boolean; // Есть ли заголовок сверху
  extraOffset?: number; // Дополнительное смещение
}

export const useDynamicHeight = ({
  containerRef,
  hasActionButton = false,
  hasHeader = true,
  extraOffset = 0,
}: UseDynamicHeightOptions) => {
  useEffect(() => {
    const updateHeight = () => {
      const container = containerRef.current;
      if (!container) return;

      const viewportHeight = window.innerHeight;

      // Базовые отступы
      let baseHeight = viewportHeight - 88; // 88px - высота верхней панели

      if (hasHeader) {
        baseHeight -= 36; // Высота заголовка контактов
      }

      // Высота поиска
      baseHeight -= 72; // 44px высота инпута + 16px паддинг сверху + 12px снизу

      // Кнопка внизу
      if (hasActionButton) {
        baseHeight -= 76; // Высота кнопки действий
      }

      // Дополнительные отступы
      baseHeight -= extraOffset;

      // Устанавливаем высоту
      container.style.maxHeight = `${Math.max(baseHeight, 200)}px`; // Минимум 200px

      // Автоматически скрываем/показываем скролл
      if (container.scrollHeight <= container.clientHeight) {
        container.style.paddingRight = "0px";
        container.style.overflowY = "hidden";
      } else {
        container.style.paddingRight = "6px";
        container.style.overflowY = "auto";
      }
    };

    // Вызываем сразу
    updateHeight();

    // Добавляем обработчик ресайза
    window.addEventListener("resize", updateHeight);

    // Используем MutationObserver для отслеживания изменений контента
    const observer = new MutationObserver(updateHeight);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [containerRef, hasActionButton, hasHeader, extraOffset]);
};
