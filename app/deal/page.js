"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { connectWallet } from "../../lib/wallet";
import { supabase, setProdiWalletHeader } from "../../lib/supabaseClient";

/* ---------- helpers ---------- */
async function fetchCompanyByWallet(wallet) {
  if (!wallet) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("company, wallet, privacy")
    .eq("wallet", String(wallet))
    .maybeSingle();
  if (error) {
    console.error("fetchCompanyByWallet:", error);
    return null;
  }
  return data;
}

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ---------- inner page ---------- */
function DealPageInner() {
  // Party A (initiator)
  const [walletAddress, setWalletAddress] = useState(null);
  const [aCompany, setACompany] = useState(null);

  // Party B (counterparty)
  const [selectedPartner, setSelectedPartner] = useState(null); // {company?, wallet}
  const [bCompany, setBCompany] = useState(null);

  // UI
  const [error, setError] = useState(null);
  const [okId, setOkId] = useState(null);
  const [saving, setSaving] = useState(false);

  // inline search
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 350);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // deeplink (?counterparty=&company=)
  const searchParams = useSearchParams();
  const prefCounterparty = searchParams.get("counterparty");
  const prefCompany = searchParams.get("company");

  // 1) connect wallet + fetch my company
  useEffect(() => {
    (async () => {
      try {
        const res = await connectWallet();
        if (res?.userAddress) {
          const addr = String(res.userAddress);
          setWalletAddress(addr);
          setProdiWalletHeader?.(addr); // RLS header
          const found = await fetchCompanyByWallet(addr);
          if (found?.company) setACompany(found.company);
        }
      } catch {
        /* user can connect later */
      }
    })();
  }, []);

  // 2) apply deeplink (block self-deal)
  useEffect(() => {
    (async () => {
      if (!prefCounterparty) return;
      if (walletAddress && prefCounterparty.toLowerCase() === walletAddress.toLowerCase()) {
        setSelectedPartner(null);
        setBCompany(null);
        setError("You cannot create a deal with your own profile. Choose another company.");
        return;
      }
      const preset = { wallet: String(prefCounterparty), company: prefCompany || null };
      setSelectedPartner(preset);
      if (!preset.company) {
        const found = await fetchCompanyByWallet(preset.wallet);
        setBCompany(found?.company || null);
      } else {
        setBCompany(preset.company);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefCounterparty, prefCompany, walletAddress]);

  // 3) when partner changes — ensure company name filled
  useEffect(() => {
    (async () => {
      if (!selectedPartner) return;
      const w =
        selectedPartner.wallet ||
        selectedPartner.wallet_address ||
        selectedPartner.address;
      const c = selectedPartner.company || null;
      setBCompany(c || null);
      if (!c && w) {
        const found = await fetchCompanyByWallet(String(w));
        setBCompany(found?.company || null);
      }
    })();
  }, [selectedPartner]);

  // 4) public search (exclude myself)
  useEffect(() => {
    (async () => {
      setError(null);
      if (!dq) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        let qOr = `company.ilike.%${dq}%,email.ilike.%${dq}%`;
        let query = supabase
          .from("profiles")
          .select("company, email, wallet, region, type, privacy")
          .or(qOr)
          .eq("privacy", "public")
          .limit(10);
        if (walletAddress) query = query.neq("wallet", walletAddress);

        const { data, error } = await query;
        if (error) throw error;
        setResults(data || []);
      } catch (e) {
        console.error("search error:", e);
        setResults([]);
      } finally {
        setSearching(false);
      }
    })();
  }, [dq, walletAddress]);

  const headerTitle = useMemo(() => {
    const a = aCompany || (walletAddress ? "Your company" : "—");
    const b =
      bCompany ||
      (selectedPartner?.company
        ? selectedPartner.company
        : selectedPartner?.wallet
        ? selectedPartner.wallet.slice(0, 10) + "…"
        : "—");
    return `Deal: ${a} ↔ ${b}`;
  }, [aCompany, bCompany, walletAddress, selectedPartner]);

  // submit
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setOkId(null);

    const f = new FormData(ev.currentTarget);

    const partnerWallet =
      (selectedPartner &&
        (selectedPartner.wallet ||
          selectedPartner.wallet_address ||
          selectedPartner.address)) ||
      String(f.get("manual_partner_wallet") || "").trim();

    if (!walletAddress) return setError("Connect your wallet first.");
    if (!partnerWallet) return setError("Select a counterparty or enter wallet manually.");
    if (walletAddress.toLowerCase() === partnerWallet.toLowerCase()) {
      return setError("You cannot create a deal with yourself. Choose another company.");
    }

    const payload = {
      initiator_wallet: walletAddress,
      partner_wallet: partnerWallet,
      marketplaces: String(f.get("marketplaces") || ""),
      regions: String(f.get("regions") || ""),
      is_exclusive_mp: !!f.get("is_exclusive_mp"),
      is_exclusive_reg: !!f.get("is_exclusive_reg"),
      rrc_control: String(f.get("rrc_control") || ""),
      guarantees: String(f.get("guarantees") || ""),
      status: "proposed",
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
    } catch (e) {
      setError(e?.message || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-100 text-center p-4">
      {/* inline counterparty search */}
      <div className="w-full max-w-md mb-4 text-left bg-white p-4 rounded-xl shadow">
        <label className="block text-sm font-medium mb-2">Find a company to make a deal with</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Type company or email…"
        />
        {searching && <p className="text-xs text-gray-500 mt-2">Searching…</p>}
        {!!results.length && (
          <ul className="mt-3 divide-y rounded border">
            {results.map((r) => (
              <li
                key={r.wallet}
                className="p-2 text-sm hover:bg-gray-50 cursor-pointer text-left"
                onClick={() => {
                  setSelectedPartner({ wallet: r.wallet, company: r.company, email: r.email });
                  setBCompany(r.company || null);
                  setQ("");
                  setResults([]);
                  setError(null);
                }}
              >
                <div className="font-medium">{r.company || "—"}</div>
                <div className="text-xs text-gray-600">
                  {r.email || "—"} • wallet: {r.wallet?.slice(0, 10)}…
                </div>
              </li>
            ))}
          </ul>
        )}
        {!searching && dq && !results.length && (
          <p className="text-xs text-gray-500 mt-2">No companies found.</p>
        )}
      </div>

      {/* parties */}
      <div className="w-full max-w-md mb-4 text-left bg-white p-4 rounded-xl shadow">
        <div className="font-semibold mb-2">{headerTitle}</div>
        <div className="text-sm">
          <div className="mb-1">
            Party A (initiator): <b>{aCompany || (walletAddress ? walletAddress : "—")}</b>
          </div>
          <div>
            Party B (counterparty):{" "}
            <b>
              {bCompany ||
                selectedPartner?.company ||
                (selectedPartner?.wallet ? selectedPartner.wallet : "—")}
            </b>
            <div className="text-xs text-gray-600">
              Wallet:{" "}
              {(selectedPartner &&
                (selectedPartner.wallet ||
                  selectedPartner.wallet_address ||
                  selectedPartner.address)) || "—"}
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">Create Deal</h1>

      {walletAddress ? (
        <p className="text-green-700 text-sm mb-2">✅ Wallet connected: {walletAddress}</p>
      ) : (
        <button
          onClick={async () => {
            try {
              const r = await connectWallet();
              if (r?.userAddress) {
                const addr = String(r.userAddress);
                setWalletAddress(addr);
                setProdiWalletHeader?.(addr);
                const found = await fetchCompanyByWallet(addr);
                if (found?.company) setACompany(found.company);
              }
            } catch {}
          }}
          className="mb-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          🔐 Connect MetaMask
        </button>
      )}

      {error && <p className="text-red-600 mt-1">{error}</p>}
      {okId && <p className="text-green-700 mt-1">✅ Deal saved. ID: <b>{okId}</b></p>}

      {/* form */}
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

        {/* manual fallback while not all profiles have wallet */}
        <div className="mb-4">
          <label className="block mb-2">Counterparty wallet (manual fallback):</label>
          <input
            name="manual_partner_wallet"
            className="w-full p-2 border rounded"
            placeholder="0x1111222233334444555566667777888899990000"
          />
          <p className="text-xs text-gray-500 mt-1">Use only if the profile has no wallet.</p>
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

/* ---------- export with Suspense (for useSearchParams on Vercel) ---------- */
export default function DealPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading…</div>}>
      <DealPageInner />
    </Suspense>
  );
}
