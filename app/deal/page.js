"use client";

import { useState } from "react";
import ProfileSearchDeal from "../../components/ProfileSearchDeal";
import { connectWallet } from "../../lib/wallet";
import { supabase } from "../../lib/supabaseClient";

export default function DealPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [error, setError] = useState(null);
  const [okId, setOkId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleConnect = async () => {
    try {
      const result = await connectWallet();
      if (result?.userAddress) setWalletAddress(result.userAddress);
    } catch (e) {
      setError((e && e.message) || "Failed to connect wallet");
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setOkId(null);

    if (!walletAddress) return setError("Connect your wallet first.");
    if (!selectedPartner?.wallet) return setError("Select a counterparty first.");

    const f = new FormData(ev.currentTarget);

    const payload = {
      initiator_wallet: walletAddress,
      partner_wallet: String(selectedPartner.wallet || ""),

      marketplaces: String(f.get("marketplaces") || ""),
      regions: String(f.get("regions") || ""),

      is_exclusive_mp: !!f.get("is_exclusive_mp"),
      is_exclusive_reg: !!f.get("is_exclusive_reg"),

      rrc_control: String(f.get("rrc_control") || ""),
      guarantees: String(f.get("guarantees") || ""),

      // Если в БД есть privacy ИЛИ visibility — оставь одну строку ниже и переименуй name в форме
      // privacy: String(f.get("privacy") || ""),
      // visibility: String(f.get("visibility") || ""),
      // custom_notes / status / duration_days — оставь только если есть такие колонки
    };

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from("deals")
        .insert(payload)
        .select("id")
        .single();

      if (error) throw error;
      setOkId(data.id);
      ev.target.reset();
    } catch (e) {
      setError((e && e.message) || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <ProfileSearchDeal onSelect={(p) => setSelectedPartner(p)} />

      {selectedPartner && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded">
          ✅ Selected: <strong>{selectedPartner.company}</strong> ({selectedPartner.email}) — wallet: {selectedPartner.wallet || "—"}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Create Deal</h1>

      {walletAddress ? (
        <p className="text-green-700 text-lg">✅ Wallet connected: {walletAddress}</p>
      ) : (
        <button onClick={handleConnect} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
          🔐 Connect MetaMask
        </button>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}
      {okId && <p className="text-green-700 mt-4">✅ Deal saved. ID: <b>{okId}</b></p>}

      <form onSubmit={handleSubmit} className="w-full max-w-md mt-10 bg-white p-6 rounded-xl shadow-md">
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

        {/* Если есть privacy/visibility — раскомментируй и исправь name */}
        {/* <label className="block mb-2">Visibility / Privacy:</label>
        <input name="privacy" className="w-full p-2 border rounded mb-4" /> */}

        <button type="submit" disabled={saving} className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Saving..." : "📩 Send deal terms"}
        </button>
      </form>
    </div>
  );
}
