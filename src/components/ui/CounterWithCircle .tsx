"use client";

import { useEffect, useRef, useState } from "react";

interface CounterWithCircleProps {
  targetValue?: number;
  duration?: number; // длительность анимации в мс
  size?: number; // размер компонента
}

export const CounterWithCircle = ({
  targetValue = 4,
  duration = 4000,
  size = 24,
}: CounterWithCircleProps) => {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);

  const startAnimation = () => {
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Обновляем значение цифры
      // const current = Math.ceil(targetValue - targetValue * progress);
      const current = Math.max(0, targetValue - Math.floor(targetValue * progress));
      setCurrentValue(current);
      // Обновляем прогресс круга
      setProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  // Длина окружности: 2πr
  const radius = (size - 2) / 2; // отнимаем padding
  const circleLength = 2 * Math.PI * radius;

  return (
    <div
      className={`relative flex items-center justify-center
     text-[#7FD1C7] text-[14px] font-bold leading-[130%]
    w-[${24}px] h-[${24}px] `}
    >
      {currentValue}

      <svg className="absolute top-0 left-0" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="none" strokeWidth="2" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7FD1C7"
          strokeWidth="2"
          fill="none"
          strokeDasharray={circleLength}
          strokeDashoffset={-circleLength * progress}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
      </svg>
    </div>
  );
};



