"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectWallet } from "../../../lib/wallet";
import { supabase } from "../../../lib/supabaseClient";

export default function CompanyProfilePage() {
  const { wallet } = useParams(); // /company/[wallet]
  const [profile, setProfile] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 1) Load company profile by wallet from Supabase
  useEffect(() => {
    (async () => {
      try {
        if (!wallet) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("wallet", String(wallet))
          .maybeSingle();

        if (error) throw error;
        setProfile(data || null);
      } catch (e) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet]);

  // 2) Detect current user's wallet (for isOwner & button visibility)
  useEffect(() => {
    (async () => {
      try {
        const { userAddress } = await connectWallet();
        if (userAddress) setCurrentWallet(String(userAddress));
      } catch {
        // user may ignore connection prompt; that's fine
      }
    })();
  }, []);

  const isOwner =
    currentWallet &&
    wallet &&
    String(currentWallet).toLowerCase() === String(wallet).toLowerCase();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <p>⏳ Loading profile…</p>
      </main>
    );
  }

  if (err || !profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Link href="/" className="text-xl font-bold mb-4 hover:underline">🔷 Prodi</Link>
        <p className="text-red-600 mb-2">{err || "Profile not found"}</p>
        <Link href="/" className="text-blue-600 underline">Go back home</Link>
      </main>
    );
  }

  const deepDealHref = `/deal?counterparty=${encodeURIComponent(
    String(wallet)
  )}&company=${encodeURIComponent(profile.company || "")}`;

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-black hover:underline">
            🔷 Prodi
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/deals"
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            >
              📂 My deals
            </Link>

            {isOwner ? (
              <Link
                href="/profile"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                ✏️ Edit profile
              </Link>
            ) : (
              <Link
                href={deepDealHref}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                🤝 Create deal with this company
              </Link>
            )}
          </div>
        </div>

        {/* Profile card */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Left column: logo & media */}
          <div className="space-y-4">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="Company logo"
                className="w-full h-auto object-contain rounded border"
              />
            ) : (
              <div className="w-full aspect-video border rounded flex items-center justify-center text-gray-400">
                No logo
              </div>
            )}

            {profile.media && (
              <div className="text-sm">
                <p className="font-semibold mb-1">📺 Media</p>
                <a
                  href={profile.media}
                  className="text-blue-600 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.media}
                </a>
              </div>
            )}
          </div>

          {/* Right column: details */}
          <div className="md:col-span-2 space-y-2">
            <h1 className="text-3xl font-bold">{profile.company || "Company"}</h1>

            <p>
              <b>Wallet:</b> <span className="break-all">{String(wallet)}</span>
            </p>
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
                  className="text-blue-600 underline break-all"
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
          </div>
        </div>
      </div>
    </main>
  );
}
