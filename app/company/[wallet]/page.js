
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { connectWallet } from "../../../lib/wallet";
import { supabase } from "../../../lib/supabase";
import SupabaseProfileSearch from "../../../components/SupabaseProfileSearch";

export default function CompanyProfile() {
  const { wallet } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!wallet) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet", wallet.toLowerCase())
        .single();

      if (error) {
        console.error("Ошибка загрузки профиля:", error.message);
      } else {
        setProfile(data);
      }

      try {
        const { userAddress } = await connectWallet();
        setCurrentWallet(userAddress?.toLowerCase());
      } catch (err) {
        console.warn("Не удалось подключить кошелёк:", err);
      }
    };

    fetchProfile();
  }, [wallet]);

  const isOwner = currentWallet === wallet?.toLowerCase();

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <p>⏳ Загрузка профиля...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Навигация */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-black hover:underline">
            🔷 Prodi
          </Link>
          {isOwner && (
            <Link
              href="/profile"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              ✏️ Редактировать
            </Link>
          )}
        </div>

        {/* 🔍 Поиск партнёров */}
        <SupabaseProfileSearch />

        {/* Блок профиля */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Левая колонка */}
          <div className="space-y-4">
            {profile.logo && (
              <img
                src={profile.logo}
                alt="Логотип"
                className="w-full h-auto object-contain rounded"
              />
            )}
            {profile.media && (
              <div>
                <p className="font-semibold">📺 Медиа:</p>
                <a
                  href={profile.media}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.media}
                </a>
              </div>
            )}
          </div>

          {/* Правая колонка */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold">{profile.company}</h1>
            <p><strong>Тип:</strong> {profile.type}</p>
            <p><strong>Регион:</strong> {profile.region}</p>
            <p><strong>Маркетплейсы:</strong> {profile.marketplaces}</p>
            <p><strong>Контакт:</strong> {profile.contact}</p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${profile.email}`}
                className="text-blue-600 underline"
              >
                {profile.email}
              </a>
            </p>
            <p>
              <strong>Сайт:</strong>{" "}
              <a
                href={profile.website}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.website}
              </a>
            </p>
            <p><strong>Описание:</strong> {profile.pitch}</p>
            <p className="text-sm text-gray-500">
              Приватность: {profile.privacy}
            </p>
            <p className="text-sm text-gray-400">
              Адрес кошелька: {wallet}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
