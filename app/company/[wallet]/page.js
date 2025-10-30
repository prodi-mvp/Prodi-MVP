
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectWallet } from "../../../lib/wallet";
import { supabase } from "../../../lib/supabaseClient";

export default function CompanyProfile() {
  const { wallet } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);

  useEffect(() => {
    (async () => {
      if (!wallet) return;

      // профиль компании по адресу
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("wallet", String(wallet))
        .single();

      if (!error) setProfile(data);
      else console.error("Profile load error:", error);

      // текущий кошелёк пользователя
      try {
        const { userAddress } = await connectWallet();
        if (userAddress) setCurrentWallet(String(userAddress));
      } catch (e) {
        // без паники — просто нет подключения
      }
    })();
  }, [wallet]);

  const isOwner =
    currentWallet && wallet && currentWallet.toLowerCase() === String(wallet).toLowerCase();

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <p>⏳ Loading profile…</p>
      </main>
    );
  }

  const deepDealHref = `/deal?counterparty=${encodeURIComponent(
    String(wallet)
  )}&company=${encodeURIComponent(profile.company || "")}`;

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-black hover:underline">
            🔷 Prodi
          </Link>

          <div className="flex gap-2">
            <Link
              href={deepDealHref}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              🤝 Create deal with this company
            </Link>

            {isOwner && (
              <Link
                href="/profile"
                className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
              >
                ✏️ Edit profile
              </Link>
            )}
          </div>
        </div>

        {/* Profile card */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            {profile.logo && (
              <img
                src={profile.logo}
                alt="Logo"
                className="w-full h-auto object-contain rounded"
              />
            )}
            {profile.media && (
              <div>
                <p className="font-semibold">📺 Media</p>
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

          <div className="md:col-span-2 space-y-2">
            <h1 className="text-3xl font-bold">{profile.company || "Company"}</h1>
            <p><b>Type:</b> {profile.type || "-"}</p>
            <p><b>Region:</b> {profile.region || "-"}</p>
            <p><b>Marketplaces:</b> {profile.marketplaces || "-"}</p>
            <p><b>Contact:</b> {profile.contact || "-"}</p>
            <p>
              <b>Email:</b>{" "}
              {profile.email ? (
                <a href={`mailto:${profile.email}`} className="text-blue-600 underline">
                  {profile.email}
                </a>
              ) : (
                "-"
              )}
            </p>
            <p>
              <b>Website:</b>{" "}
              {profile.website ? (
                <a
                  href={profile.website}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.website}
                </a>
              ) : (
                "-"
              )}
            </p>
            <p><b>Description:</b> {profile.pitch || "-"}</p>
            <p className="text-sm text-gray-500"><b>Privacy:</b> {profile.privacy || "-"}</p>
            <p className="text-sm text-gray-400"><b>Wallet:</b> {String(wallet)}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
