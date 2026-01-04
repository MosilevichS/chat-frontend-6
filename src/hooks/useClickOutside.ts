import type { RefObject } from "react";
import { useEffect } from "react";

export function useClickOutside(ref: RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node | null;

      if (!target || (ref.current && ref.current.contains(target))) {
        return;
      }
      callback();
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, callback]);
}
