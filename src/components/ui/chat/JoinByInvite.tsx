"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Loader from "@/src/components/ui/Loader";
import Button from "@/src/components/ui/Button";
import groupAvatar from "@/src/assets/icons/group.svg";

export default function JoinByInvite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setError("Недействительная ссылка-приглашение");
      setLoading(false);
      return;
    }

    const fetchChatPreview = async () => {
      try {
        const response = await fetch(`/api/chat/preview?token=${encodeURIComponent(token)}`);

        if (response.ok) {
          const data = await response.json();
          setChatInfo(data);
        }
      } catch (err) {
        console.error("Error fetching chat preview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatPreview();
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);

    try {
      console.log("Sending join request with token:", token);

      const response = await fetch("/api/chat/join-by-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
        }),
      });

      const data = await response.json();
      console.log("Join response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to join chat");
      }

      if (data.object?.chat_key) {
        router.push(`/chats/${data.object.chat_key}?type=group`);
      } else {
        router.push("/chats");
      }
    } catch (err: any) {
      console.error("Join error:", err);
      setError(err.message || "Ошибка при вступлении в чат");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600 mb-6">Недействительная ссылка-приглашение</p>
          <Button variant="primary" size="medium" onClick={() => router.push("/chats")}>
            Перейти к чатам
          </Button>
        </div>
      </div>
    );
  }

  const isChannel = chatInfo?.chat_type?.includes("channel");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Приглашение в {isChannel ? "канал" : "группу"}
          </h1>
          <p className="text-gray-600">
            Вас пригласили присоединиться к {isChannel ? "каналу" : "группе"}
          </p>
        </div>

        {chatInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                <Image
                  src={chatInfo.avatar_url || groupAvatar}
                  alt={chatInfo.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{chatInfo.name}</h2>
                <p className="text-sm text-gray-600">
                  {isChannel ? "Канал" : "Группа"}
                  {chatInfo.participants_count !== undefined && (
                    <> • {chatInfo.participants_count} участников</>
                  )}
                </p>
                {chatInfo.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{chatInfo.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="primary"
            size="medium"
            onClick={handleJoin}
            disabled={joining}
            className="w-full"
          >
            {joining ? "Присоединение..." : "Присоединиться"}
          </Button>

          <Button
            variant="secondary1"
            size="medium"
            onClick={() => router.push("/chats")}
            className="w-full"
          >
            Перейти к чатам
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Ссылка-приглашение действительна ограниченное время
        </p>
      </div>
    </div>
  );
}
