import Image from "next/image";
import Link from "next/link";

import backIcon from "@/assets/icons/back-icon.svg";

export default function Page() {
  return (
    <div className="flex gap-x-6 w-full justify-center">
      <div className="w-full md:max-w-[360px] min-h-[calc(100vh-84px)] mx-auto flex flex-col md:rounded-t-lg border border-[var(--color-gray-1)]">
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/settings" className="p-2 -ml-2">
              <Image src={backIcon} width={24} height={24} alt="Назад" />
            </Link>
            <h2 className="text-[1.125rem] font-medium text-[var(--color-black)]">
              Обращение в поддержку
            </h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-[280px] text-center">
              <div className="w-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="66" height="66">
                  <path
                    d="M11.9992 1.19922C6.03762 1.19922 1.19922 6.03762 1.19922 11.9992C1.19922 17.9608 6.03762 22.7992 11.9992 22.7992C17.9608 22.7992 22.7992 17.9608 22.7992 11.9992C22.7992 6.03762 17.9608 1.19922 11.9992 1.19922Z"
                    fill="rgb(119,105,225)"
                  />
                  <path
                    d="M9.83922 17.3992L4.43922 11.9992L5.96202 10.4764L9.83922 14.3428L18.0364 6.14562L19.5592 7.67922L9.83922 17.3992Z"
                    fill="rgb(255,255,255)"
                  />
                </svg>
              </div>
              <h3 className="text-[1rem] font-bold text-[var(--color-black)] mb-3">
                Обращение отправлено!
              </h3>
              <p className="text-[0.875rem] text-[var(--color-gray-700)] leading-relaxed">
                В ближайшее время вы получите ответ на электронную почту, указанную в обращении
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Правая колонка (десктоп) */}
      <div className="hidden md:flex w-full max-w-[744px] min-h-[calc(100vh-84px)] bg-[var(--color-gray-light)] rounded-t-lg px-4">
        {/* Здесь можно добавить контент для правой колонки */}
      </div>
    </div>
  );
}
