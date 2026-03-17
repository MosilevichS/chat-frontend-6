"use client";

import { useState, useMemo } from "react";
import {
  useDeleteBlackListSettingsMutation,
  useGetBlackListQuery,
} from "@/src/services/contactApi";
import { BlackListInputSearch } from "./BlackListInputSearch";
import Image from "next/image";
import { BlackListTopMenu } from "@/components/ui/user-profile/black-list/BlackListTopMenu";
import type { IBlackListContact, IBlockedUser } from "@/src/types/blackList";

export const BlackListPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteButtonView, setDeleteButtonView] = useState(false);

  const { data, isLoading, isFetching } = useGetBlackListQuery({
    page,
    page_size: 20,
  });
  const toggleDeleteMode = () => {
    setDeleteButtonView(prev => !prev);
  };

  const [deleteBlackList] = useDeleteBlackListSettingsMutation();

  const handleDeleteBlackList = async (user: IBlockedUser) => {
    if (!user) return;
    try {
      await deleteBlackList({ id: user.uid }).unwrap();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };
  const filteredData = useMemo((): IBlackListContact[] => {
    if (!data?.results) return [];

    const search = searchTerm.trim().toLowerCase();
    if (!search) return data.results;

    return data.results.filter(item => {
      const user = item.blocked_user;

      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").toLowerCase();

      return fullName.includes(search);
    });
  }, [data, searchTerm]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-violet)]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <BlackListTopMenu onToggleDeleteMode={toggleDeleteMode} />
      <BlackListInputSearch value={searchTerm} onChange={setSearchTerm} />

      <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
        {isFetching && (
          <span className="text-[var(--color-violet)] animate-pulse">Обновление...</span>
        )}
      </div>

      {/* Список контактов */}
      <div className=" overflow-hidden mb-2 px-2">
        {filteredData.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📵</div>
            <p className="text-gray-500">
              {searchTerm ? "Ничего не найдено" : "Черный список пуст"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 ">
            {filteredData.map(item => {
              const user = item.blocked_user;
              const fullName =
                [user.first_name, user.last_name].filter(Boolean).join(" ") || "Без имени";
              return (
                <div key={user.uid}>
                  <div className="flex items-center justify-between">
                    <div className="p-2 flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full bg-[var(--color-violet)] flex-shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={fullName}
                            fill
                            sizes="48px"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">{fullName}</h3>
                      </div>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      className={
                        deleteButtonView
                          ? "p-2 text-gray-400 hover:text-red-500 transition-colors"
                          : "hidden"
                      }
                      onClick={() => {
                        handleDeleteBlackList(user);
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z"
                          fill="#747474"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="h-1px border-b border-[var(--color-gray-1)]"></div>

      {/* Пагинация */}
      {data && data.count > 20 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 "
          >
            ← Назад
          </button>
          <span className="px-4 py-2 text-gray-600">
            {page} из {Math.ceil(data.count / 20)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!data.next}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 "
          >
            Вперед →
          </button>
        </div>
      )}
    </div>
  );
};
