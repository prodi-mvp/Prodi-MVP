"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, setProdiWalletHeader } from "../../lib/supabaseClient";
import { connectWallet } from "../../lib/wallet";

export default function MyDealsPage() {
  const [wallet, setWallet] = useState(null);
  const [incoming, setIncoming] = useState([]); // где я partner и статус proposed
  const [outgoing, setOutgoing] = useState([]); // где я initiator
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await connectWallet();
        if (!r?.userAddress) return;
        const w = String(r.userAddress);
        setWallet(w);
        setProdiWalletHeader(w);

        // входящие
        const { data: inc, error: e1 } = await supabase
          .from("deals")
          .select("id, created_at, initiator_wallet, partner_wallet, status, marketplaces, regions")
          .eq("partner_wallet", w)
          .order("created_at", { ascending: false });
        if (e1) throw e1;

        // исходящие
        const { data: out, error: e2 } = await supabase
          .from("deals")
          .select("id, created_at, initiator_wallet, partner_wallet, status, marketplaces, regions")
          .eq("initiator_wallet", w)
          .order("created_at", { ascending: false });
        if (e2) throw e2;

        setIncoming(inc || []);
        setOutgoing(out || []);
      } catch (e) {
        setError(e?.message || "Failed to load deals");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function updateStatus(id, next) {
    try {
      const { error } = await supabase.from("deals").update({ status: next }).eq("id", id);
      if (error) throw error;
      setIncoming((list) => list.map((d) => (d.id === id ? { ...d, status: next } : d)));
    } catch (e) {
      alert(e?.message || "Failed");
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-xl font-bold text-black hover:underline">🔷 Prodi</Link>
          <div className="text-sm text-gray-600">Wallet: {wallet || "—"}</div>
        </div>

        <h1 className="text-2xl font-bold mb-4">My deals</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-600">Loading…</p>}

        {/* Incoming (я — партнёр) */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Incoming (for my signature)</h2>
          {!incoming.length ? (
            <p className="text-gray-600">No incoming deals.</p>
          ) : (
            <ul className="space-y-3">
              {incoming.map((d) => (
                <li key={d.id} className="border rounded p-3">
                  <div className="text-sm">From: <b>{d.initiator_wallet}</b></div>
                  <div className="text-sm">Regions: {d.regions || "—"}</div>
                  <div className="text-sm">Marketplaces: {d.marketplaces || "—"}</div>
                  <div className="text-sm">Status: <b>{d.status}</b></div>
                  {d.status === "proposed" && (
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => updateStatus(d.id, "accepted")} className="px-3 py-1 rounded bg-green-600 text-white">Accept</button>
                      <button onClick={() => updateStatus(d.id, "rejected")} className="px-3 py-1 rounded bg-red-600 text-white">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Outgoing (я — инициатор) */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Outgoing (created by me)</h2>
          {!outgoing.length ? (
            <p className="text-gray-600">No outgoing deals.</p>
          ) : (
            <ul className="space-y-3">
              {outgoing.map((d) => (
                <li key={d.id} className="border rounded p-3">
                  <div className="text-sm">To: <b>{d.partner_wallet}</b></div>
                  <div className="text-sm">Regions: {d.regions || "—"}</div>
                  <div className="text-sm">Marketplaces: {d.marketplaces || "—"}</div>
                  <div className="text-sm">Status: <b>{d.status}</b></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
