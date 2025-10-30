"use client";

import { useState } from "react";
import ProfileSearchDeal from "../../components/ProfileSearchDeal";
import { connectWallet } from "../../lib/wallet";
import { supabase } from "../../lib/supabaseClient";

export default function DealPage() {
  const [walletAddress, setWalletAddress] = useState(null);         // Party A
  const [selectedPartner, setSelectedPartner] = useState(null);     // Party B (from search)
  const [error, setError] = useState(null);
  const [okId, setOkId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result?.userAddress) setWalletAddress(result.userAddress);
    } catch (e) {
      console.error("wallet connect error:", e);
      setError((e && e.message) || "Failed to connect wallet");
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setOkId(null);

    const f = new FormData(ev.currentTarget);

    // нормализуем кошелёк контрагента: из профиля или из резервного поля
    const partnerWallet =
      (selectedPartner &&
        (selectedPartner.wallet ||
         selectedPartner.wallet_address ||
         selectedPartner.address)) ||
      String(f.get("manual_partner_wallet") || "").trim();

    if (!walletAddress) return setError("Connect your wallet first.");
    if (!partnerWallet) return setError("Select a counterparty or enter wallet manually.");

    const payload = {
      initiator_wallet: walletAddress,
      partner_wallet: partnerWallet,

      marketplaces: String(f.get("marketplaces") || ""),
      regions: String(f.get("regions") || ""),

      is_exclusive_mp: !!f.get("is_exclusive_mp"),
      is_exclusive_reg: !!f.get("is_exclusive_reg"),

      rrc_control: String(f.get("rrc_control") || ""),
      guarantees: String(f.get("guarantees") || "")
      // при необходимости позже добавим: status, duration_days, visibility и т.п.
    };

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("deals")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.error("🧨 Supabase insert error:", JSON.stringify(error, null, 2));
        throw error;
      }

      setOkId(data.id);
      ev.target.reset();
      // оставляем выбранного партнёра, чтобы было видно, с кем создали
    } catch (e) {
      console.error("create deal error:", e);
      setError((e && e.message) || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 text-center p-4">
      {/* Поиск партнёра */}
      <ProfileSearchDeal onSelect={(p) => setSelectedPartner(p)} />

      {/* Панель участников — всегда видно двух сторон */}
      <div className="w-full max-w-md mb-4 text-left bg-white p-4 rounded-xl shadow">
        <div className="font-semibold mb-2">Participants</div>
        <div className="text-sm">
          <div className="mb-1">
            Party A (initiator): <b>{walletAddress || "— not connected —"}</b>
          </div>
          <div>
            Party B (counterparty):
            <div className="mt-1">
              <div className="font-medium">
                {(selectedPartner && (selectedPartner.company || selectedPartner.email)) || "— not selected —"}
              </div>
              <div className="text-xs text-gray-600">
                Wallet: {(selectedPartner && (selectedPartner.wallet || selectedPartner.wallet_address || selectedPartner.address)) || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Create Deal</h1>

      {/* Кошелёк инициатора */}
      {walletAddress ? (
        <p className="text-green-700 text-sm mb-2">
          ✅ Wallet connected: {walletAddress}
        </p>
      ) : (
        <button
          onClick={handleConnect}
          className="mb-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          🔐 Connect MetaMask
        </button>
      )}

      {/* Сообщения */}
      {error && <p className="text-red-600 mt-1">{error}</p>}
      {okId && <p className="text-green-700 mt-1">✅ Deal saved. ID: <b>{okId}</b></p>}

      {/* Форма сделки */}
      <form onSubmit={handleSubmit} className="w-full max-w-md mt-6 bg-white p-6 rounded-xl shadow-md text-left">
        <h2 className="text-xl font-semibold mb-4">Deal form</h2>

        <label className="block mb-2">Marketplaces (comma-separated):</label>
        <input name="marketplaces" className="w-full p-2 border rounded mb-4" />

        <div className="flex items-center gap-2 mb-4">
          <input id="is_exclusive_mp" type="checkbox" name="is_exclusive_mp" />
          <label htmlFor="is_exclusive_mp">Exclusive on marketplaces</label>
        </div>

        <label className="block mb-2">Regions / Locations:</label>
        <input name="regions" className="w-full p-2 border rounded mb-2" />

        <div className="flex items-center gap-2 mb-4">
          <input id="is_exclusive_reg" type="checkbox" name="is_exclusive_reg" />
          <label htmlFor="is_exclusive_reg">Exclusive in regions</label>
        </div>

        <label className="block mb-2">Price control (RRP/MAP):</label>
        <input name="rrc_control" className="w-full p-2 border rounded mb-4" />

        <label className="block mb-2">Manufacturer guarantees:</label>
        <textarea name="guarantees" className="w-full p-2 border rounded mb-4" />

        {/* TEMP for deploy/debug: ручной ввод кошелька партнёра, если в профиле его нет.
            Когда профили будут полные, этот блок можно удалить без последствий. */}
        <div className="mb-4">
          <label className="block mb-2">Counterparty wallet (manual fallback):</label>
          <input
            name="manual_partner_wallet"
            className="w-full p-2 border rounded"
            placeholder="0x1111222233334444555566667777888899990000"
          />
          <p className="text-xs text-gray-500 mt-1">Use only if search shows no wallet.</p>
        </div>

        <button
          type="submit"
          disabled={saving || !walletAddress}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "📩 Send deal terms"}
        </button>
      </form>
    </div>
  );
}
