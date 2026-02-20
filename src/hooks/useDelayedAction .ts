import { useEffect, useRef, useState } from "react";

//хук для управления отложенными действиями

export const useDelayedAction = (delay: number = 4000) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPending, setIsPending] = useState(false);

  const executeAfterDelay = (action: () => void) => {
    setIsPending(true);

    timerRef.current = setTimeout(() => {
      action();
      setIsPending(false);
    }, delay);
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      setIsPending(false);
    }
  };

  // Автоотмена при размонтировании компонента
  useEffect(() => {
    return () => cancel();
  }, []);

  return { isPending, executeAfterDelay, cancel };
};


// Использование хука:

// const MyComponent = () => {
//   const { isPending, executeAfterDelay, cancel } = useDelayedAction(4000);

//   const handleStart = () => {
//     executeAfterDelay(() => {
//       console.log("Действие выполнено через 4 с!");
//     });
//   };

//   return (
//     <div>
//       <button disabled={isPending} onClick={handleStart}>
//         Запустить (4 с)
//       </button>
//       <button onClick={cancel}>Отменить</button>
//       {isPending && <p>Ожидание...</p>}
//     </div>
//   );
// };